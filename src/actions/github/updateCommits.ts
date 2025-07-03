// app/actions/updateCommits.ts
"use server";

import { supabase } from "../../supabase/supabase.config";

export const updateCommits = async (userId: string, commits: number) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (commits < 0) {
    throw new Error("Commits must be non-negative");
  }

  try {
    // Get current user status
    const { data: currentStatus, error: fetchError } = await supabase
      .from("UserStatus")
      .select("commit, coin, level")
      .eq("userId", userId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch current status:", fetchError);
      throw new Error(`Failed to fetch current status: ${fetchError.message}`);
    }

    if (!currentStatus) {
      throw new Error("User status not found");
    }

    const newCommitCount = commits;
    const commitDifference = Math.max(0, newCommitCount - currentStatus.commit);

    // Award coins for new commits (1 coin per commit)
    const coinsToAdd = commitDifference;
    const newCoinAmount = currentStatus.coin + coinsToAdd;

    // Calculate new level (every 10 commits = 1 level)
    const newLevel = Math.floor(newCommitCount / 10) + 1;

    // Update user status
    const { data: updatedStatus, error: updateError } = await supabase
      .from("UserStatus")
      .update({
        commit: newCommitCount,
        coin: newCoinAmount,
        level: Math.max(currentStatus.level, newLevel), // Don't decrease level
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update user status:", updateError);
      throw new Error(`Failed to update user status: ${updateError.message}`);
    }

    return {
      success: true,
      updatedStatus,
      coinsAwarded: coinsToAdd,
      newCommits: commitDifference,
    };
  } catch (error) {
    console.error("Error in updateCommits:", error);
    throw error;
  }
};
