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
      .select("commit, coin, level, hp, attack, defense")
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

    const finalLevel = Math.max(currentStatus.level, newLevel);

    // Increase stats by 10 per level gained
    const levelDiff = finalLevel - currentStatus.level;

    // Fix existing users' stats to match their level
    // Base stats: HP=100, Attack=10, Defense=5 at level 1
    // Each level adds +10 to all stats
    const expectedHp = 100 + (finalLevel - 1) * 10;
    const expectedAttack = 10 + (finalLevel - 1) * 10;
    const expectedDefense = 5 + (finalLevel - 1) * 10;

    // Use the higher value between current and expected (don't decrease)
    const newHp = Math.max(currentStatus.hp, expectedHp);
    const newAttack = Math.max(currentStatus.attack, expectedAttack);
    const newDefense = Math.max(currentStatus.defense, expectedDefense);

    // Update user status
    const { data: updatedStatus, error: updateError } = await supabase
      .from("UserStatus")
      .update({
        commit: newCommitCount,
        coin: newCoinAmount,
        level: finalLevel, // Don't decrease level
        hp: newHp,
        attack: newAttack,
        defense: newDefense,
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
