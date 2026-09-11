// app/actions/updateCommits.ts
"use server";

import { getAuthenticatedUserId } from "@/lib/authenticatedUser";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { getCommitsAfterSignup } from "@/actions/github/getCommitsAfterSignup";
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
    const claimTime = new Date().toISOString();
    const { data: claim, error: claimError } = await db
      .from("UserStatus")
      .update({
        syncStatus: "syncing",
        syncStartedAt: claimTime,
        syncError: null,
        updatedAt: claimTime,
      })
      .eq("userId", userId)
      .eq("syncStatus", current.syncStatus || "idle")
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

    const initialSync = plan.reason === "initial";
    const fromDate = plan.fromDate;
    let contributions;
    try {
      contributions = await fetchTotalContributions(fromDate);
    } catch (error) {
      await db
        .from("UserStatus")
        .update({
          syncStatus: "error",
          syncStartedAt: null,
          syncError: error instanceof Error ? error.message : "GitHub sync failed",
          updatedAt: new Date().toISOString(),
        })
        .eq("userId", userId)
        .eq("syncStatus", "syncing");
      throw error;
    }
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

    if (!Number.isSafeInteger(contributions.commits) || contributions.commits < 0) {
      throw new Error("Invalid commit count from GitHub");
    }

    // GitHub's aggregate can temporarily move backwards while contributions
    // are re-indexed. Never lower the stored total, otherwise the next sync
    // could award the same commits again.
    let newCommitCount = initialSync
      ? Math.max(currentStatus.commit, contributions.commits)
      : currentStatus.commit + contributions.commits;

    // GitHub's contribution graph can lag immediately after a new account is
    // linked. Use the recent events endpoint as a best-effort lower-level
    // fallback during the first 24 hours, but never accept a browser value.
    const hoursSinceCreation =
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (
      newCommitCount === 0 &&
      currentStatus.commit === 0 &&
      initialSync &&
      hoursSinceCreation >= 0 &&
      hoursSinceCreation < 24
    ) {
      try {
        const alternativeCommitCount = await getCommitsAfterSignup();
        newCommitCount = Math.max(newCommitCount, alternativeCommitCount);
      } catch (error) {
        console.warn("Recent GitHub events fallback failed:", error);
      }
    }

    const commitDifference = Math.max(0, newCommitCount - currentStatus.commit);
    const coinsToAdd = commitDifference;
    const newCoinAmount = currentStatus.coin + coinsToAdd;
    if (!Number.isSafeInteger(newCoinAmount)) {
      throw new Error("Coin balance is too large");
    }
    const newLevel = Math.floor(newCommitCount / 10) + 1;
    const finalLevel = Math.max(currentStatus.level, newLevel);

    // Keep existing manually repaired stats, while ensuring level-derived
    // stats are present for older rows.
    const newHp = Math.max(currentStatus.hp, 100 + (finalLevel - 1) * 10);
    const newAttack = Math.max(currentStatus.attack, 10 + (finalLevel - 1) * 10);
    const newDefense = Math.max(currentStatus.defense, 5 + (finalLevel - 1) * 10);

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
        lastSyncAt: new Date().toISOString(),
        syncStartedAt: null,
        syncStatus: "success",
        syncError: null,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("commit", currentStatus.commit)
      .eq("coin", currentStatus.coin)
      .eq("syncStatus", "syncing")
      .eq("syncStartedAt", claimTime)
      .select("id, userId, level, commit, coin, hp, attack, defense, updatedAt")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update user status:", updateError);
      throw new Error(`Failed to update user status: ${updateError.message}`);
    }

    return {
      success: true,
      updatedStatus: updatedStatus ?? currentStatus,
      coinsAwarded: updatedStatus ? coinsToAdd : 0,
      newCommits: updatedStatus ? commitDifference : 0,
    };
  } catch (error) {
    console.error("Error in updateCommits:", error);
    throw error;
  }
};
