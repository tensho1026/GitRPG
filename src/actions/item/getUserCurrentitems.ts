"use server";

import { supabase } from "../../supabase/supabase.config";

export const getUserCurrentItems = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data: items, error } = await supabase
      .from("Items")
      .select("*")
      .eq("userId", userId)
      .eq("equipped", true)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Failed to fetch user equipped items:", error);
      throw new Error(`Failed to fetch user equipped items: ${error.message}`);
    }

    return items || [];
  } catch (error) {
    console.error("Error in getUserCurrentItems:", error);
    throw error;
  }
};
