"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../../../supabase/supabase.config";

export const reduceCoin = async (
  userId: string,
  amount: number
): Promise<number> => {
  await assertAuthenticatedUser(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive integer");
  }

  try {
    // Get current coin amount
    const { data: currentStatus, error: fetchError } = await supabase
      .from("UserStatus")
      .select("coin")
      .eq("userId", userId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch current coin:", fetchError);
      throw new Error(`Failed to fetch current coin: ${fetchError.message}`);
    }

    if (!currentStatus) {
      throw new Error("User status not found");
    }

    if (!Number.isSafeInteger(currentStatus.coin) || currentStatus.coin < 0) {
      throw new Error("Invalid coin balance");
    }

    const newCoinAmount = currentStatus.coin - amount;

    if (newCoinAmount < 0) {
      throw new Error("Insufficient coins");
    }

    // Update coin amount
    const { data: updatedStatus, error: updateError } = await supabase
      .from("UserStatus")
      .update({
        coin: newCoinAmount,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("coin", currentStatus.coin)
      .gte("coin", amount)
      .select("coin")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update coin:", updateError);
      throw new Error(`Failed to update coin: ${updateError.message}`);
    }

    if (!updatedStatus) {
      throw new Error("Coin balance changed. Please try again.");
    }

    return updatedStatus.coin;
  } catch (error) {
    console.error("Error in reduceCoin:", error);
    throw error;
  }
};
