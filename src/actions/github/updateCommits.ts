// app/actions/updateCommits.ts
"use server";

import {
  getAuthenticatedUserId,
} from "@/lib/authenticatedUser";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { getCommitsAfterSignup } from "@/actions/github/getCommitsAfterSignup";
import { supabase } from "../../supabase/supabase.config";

export const updateCommits = async () => {
  const userId = await getAuthenticatedUserId();

  const { data: user, error: userError } = await supabase
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
    const { data: currentStatus, error: fetchError } = await supabase
      .from("UserStatus")
      .select("commit, coin, level, hp, attack, defense")
      .eq("userId", userId)
      .single();

    if (fetchError || !currentStatus) {
      console.error("Failed to fetch current status:", fetchError);
      throw new Error(
        `Failed to fetch current status: ${fetchError?.message ?? "not found"}`
      );
    }

    const fromDate = createdAt.toISOString();
    const contributions = await fetchTotalContributions(fromDate);
    let newCommitCount = Math.max(0, contributions.commits || 0);

    // GitHub's contribution graph can lag immediately after a new account is
    // linked. Use the recent events endpoint as a best-effort lower-level
    // fallback during the first 24 hours, but never accept a browser value.
    const hoursSinceCreation =
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (currentStatus.commit === 0 && hoursSinceCreation >= 0 && hoursSinceCreation < 24) {
      try {
        const alternativeCommitCount = await getCommitsAfterSignup();
        newCommitCount = Math.max(newCommitCount, alternativeCommitCount);
      } catch (error) {
        console.warn("Recent GitHub events fallback failed:", error);
      }
    }

    if (!Number.isSafeInteger(newCommitCount) || newCommitCount < 0) {
      throw new Error("Invalid commit count from GitHub");
    }

    const commitDifference = Math.max(0, newCommitCount - currentStatus.commit);
    const coinsToAdd = commitDifference;
    const newCoinAmount = currentStatus.coin + coinsToAdd;
    const newLevel = Math.floor(newCommitCount / 10) + 1;
    const finalLevel = Math.max(currentStatus.level, newLevel);

    // Keep existing manually repaired stats, while ensuring level-derived
    // stats are present for older rows.
    const newHp = Math.max(currentStatus.hp, 100 + (finalLevel - 1) * 10);
    const newAttack = Math.max(currentStatus.attack, 10 + (finalLevel - 1) * 10);
    const newDefense = Math.max(currentStatus.defense, 5 + (finalLevel - 1) * 10);

    // Avoid awarding the same commits twice when React Strict Mode or two tabs
    // synchronize the account at the same time.
    const { data: updatedStatus, error: updateError } = await supabase
      .from("UserStatus")
      .update({
        commit: newCommitCount,
        coin: newCoinAmount,
        level: finalLevel,
        hp: newHp,
        attack: newAttack,
        defense: newDefense,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("commit", currentStatus.commit)
      .select()
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
