"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../supabase/supabase.config";
import { revalidatePath } from "next/cache";

export const equipItem = async (userId: string, itemId: string) => {
  await assertAuthenticatedUser(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!itemId) {
    throw new Error("Item ID is required");
  }

  try {
    const { data, error } = await supabase.rpc("equip_item", {
      p_user_id: userId,
      p_item_id: itemId,
    });

    if (error || !data?.item) {
      console.error("Failed to equip item transaction:", error);
      throw new Error(error?.message || "Failed to equip item");
    }

    revalidatePath("/item");

    return {
      success: true,
      item: data.item,
    };
  } catch (error) {
    console.error("Error in equipItem:", error);
    throw error;
  }
};
