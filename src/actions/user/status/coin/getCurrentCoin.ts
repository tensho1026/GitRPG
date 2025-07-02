"use server";

import { supabase } from "../../../../supabase/supabase.config";

export const getCurrentCoin = async (userId: string): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data: userStatus, error } = await supabase
      .from("UserStatus")
      .select("coin")
      .eq("userId", userId)
      .single();

    if (error) {
      console.error("Failed to fetch user coin:", error);
      throw new Error(`Failed to fetch user coin: ${error.message}`);
    }

    if (!userStatus) {
      throw new Error("User status not found");
    }

    return userStatus.coin;
  } catch (error) {
    console.error("Error in getCurrentCoin:", error);
    throw error;
  }
};
