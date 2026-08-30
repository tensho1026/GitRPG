"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { supabase } from "../../supabase/supabase.config";

export const getUserItems = async (userId: string) => {
  await assertAuthenticatedUser(userId);

  try {
    const { data: items, error } = await supabase
      .from("Items")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Failed to fetch user items:", error);
      throw new Error(`Failed to fetch user items: ${error.message}`);
    }

    return items || [];
  } catch (error) {
    console.error("Error in getUserItems:", error);
    throw error;
  }
};
