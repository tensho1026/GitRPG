// app/actions/updateCommits.ts
"use server";

import { getAuthenticatedUserId } from "@/lib/authenticatedUser";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { getLevelFromCommits } from "@/lib/leveling";
import { db } from "../../db/neon";
import { getSyncPlan, type SyncStatus } from "@/lib/sync";
import { SYNC_INTERVAL_MS, SYNC_LEASE_MS } from "@/actions/github/syncConstants";

type CurrentStatus = {
  commit: number;
  coin: number;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  lastSyncAt: string | null;
  syncStartedAt: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
};

export const updateCommits = async (options: { force?: boolean } = {}) => {
  const userId = await getAuthenticatedUserId();

  const { data: user, error: userError } = await db
    .from("Users")
    .select("createdAt")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const createdAt = new Date(user.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    throw new Error("Invalid user creation date");
  }

  let claimTime: string | null = null;
  try {
    const { data: currentStatus, error: fetchError } = await db
      .from("UserStatus")
      .select(
        "commit, coin, level, hp, attack, defense, lastSyncAt, syncStartedAt, syncStatus, syncError"
      )
      .eq("userId", userId)
      .single();

    if (fetchError || !currentStatus) {
      console.error("Failed to fetch current status:", fetchError);
      throw new Error(
        `Failed to fetch current status: ${fetchError?.message ?? "not found"}`
      );
    }

    const now = Date.now();
    const current = currentStatus as CurrentStatus;
    const plan = getSyncPlan({
      now,
      createdAt: createdAt.toISOString(),
      lastSyncAt: current.lastSyncAt,
      syncStartedAt: current.syncStartedAt,
      syncStatus: current.syncStatus,
      force: options.force,
      intervalMs: SYNC_INTERVAL_MS,
      leaseMs: SYNC_LEASE_MS,
    });

    if (!plan.shouldSync) {
      return {
        success: true,
        skipped: true,
        reason: plan.reason,
        updatedStatus: currentStatus,
        coinsAwarded: 0,
        newCommits: 0,
      };
    }

    // Claim the row before calling GitHub. A second tab seeing the same
    // snapshot cannot claim the same idle/success state and will skip.
    const startedAt = new Date(now).toISOString();
    const { data: claim, error: claimError } = await db
      .from("UserStatus")
      .update({
        syncStatus: "syncing",
        syncStartedAt: startedAt,
        syncError: null,
        updatedAt: claimTime,
      })
      .eq("userId", userId)
      .eq("syncStatus", current.syncStatus || "idle")
      .eq("syncStartedAt", current.syncStartedAt)
      .eq("lastSyncAt", current.lastSyncAt)
      .select("syncStartedAt")
      .maybeSingle();

    if (claimError) {
      throw new Error(`Failed to claim GitHub sync: ${claimError.message}`);
    }
    if (!claim) {
      return {
        success: true,
        skipped: true,
        reason: "in_progress",
        updatedStatus: currentStatus,
        coinsAwarded: 0,
        newCommits: 0,
      };
    }

    claimTime = startedAt;
    const totalCommits = await fetchTotalContributions(
      createdAt.toISOString(),
      startedAt
    );

    if (
      !Number.isSafeInteger(currentStatus.commit) ||
      currentStatus.commit < 0 ||
      !Number.isSafeInteger(currentStatus.coin) ||
      currentStatus.coin < 0 ||
      !Number.isSafeInteger(currentStatus.level) ||
      currentStatus.level < 1 ||
      !Number.isSafeInteger(currentStatus.hp) ||
      currentStatus.hp < 0 ||
      !Number.isSafeInteger(currentStatus.attack) ||
      currentStatus.attack < 0 ||
      !Number.isSafeInteger(currentStatus.defense) ||
      currentStatus.defense < 0
    ) {
      throw new Error("Invalid user status values");
    }

    // Recheck the lifetime total so commits indexed after an earlier sync
    // are still counted. Keep the stored total when GitHub temporarily drops.
    const newCommitCount = Math.max(currentStatus.commit, totalCommits);
    const commitDifference = Math.max(0, newCommitCount - currentStatus.commit);
    const coinsToAdd = commitDifference;
    const newCoinAmount = currentStatus.coin + coinsToAdd;
    if (!Number.isSafeInteger(newCoinAmount)) {
      throw new Error("Coin balance is too large");
    }
    const newLevel = getLevelFromCommits(newCommitCount);
    const finalLevel = Math.max(currentStatus.level, newLevel);

    // Grow every stat for each new commit, including manually raised stats.
    // The baseline also credits partial levels earned under the old rules.
    const newHp = Math.max(currentStatus.hp + commitDifference, 100 + newCommitCount);
    const newAttack = Math.max(currentStatus.attack + commitDifference, 10 + newCommitCount);
    const newDefense = Math.max(currentStatus.defense + commitDifference, 5 + newCommitCount);

    // Avoid awarding the same commits twice when React Strict Mode or two tabs
    // synchronize the account at the same time.
    const { data: updatedStatus, error: updateError } = await db
      .from("UserStatus")
      .update({
        commit: newCommitCount,
        coin: newCoinAmount,
        level: finalLevel,
        hp: newHp,
        attack: newAttack,
        defense: newDefense,
        lastSyncAt: startedAt,
        syncStartedAt: null,
        syncStatus: "success",
        syncError: null,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("commit", currentStatus.commit)
      .eq("coin", currentStatus.coin)
      .eq("syncStatus", "syncing")
      .eq("syncStartedAt", startedAt)
      .select("id, userId, level, commit, coin, hp, attack, defense, updatedAt")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update user status:", updateError);
      throw new Error(`Failed to update user status: ${updateError.message}`);
    }

    if (!updatedStatus) {
      throw new Error("User status changed during GitHub sync");
    }

    return {
      success: true,
      updatedStatus,
      coinsAwarded: coinsToAdd,
      newCommits: commitDifference,
    };
  } catch (error) {
    if (claimTime) {
      await db
        .from("UserStatus")
        .update({
          syncStatus: "error",
          syncStartedAt: null,
          syncError: error instanceof Error ? error.message : "GitHub sync failed",
          updatedAt: new Date().toISOString(),
        })
        .eq("userId", userId)
        .eq("syncStatus", "syncing")
        .eq("syncStartedAt", claimTime);
    }
    console.error("Error in updateCommits:", error);
    throw error;
  }
};
