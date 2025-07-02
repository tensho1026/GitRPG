"use server";

import { supabase } from "../../supabase/supabase.config";
import { revalidatePath } from "next/cache";

export const equipItem = async (userId: string, itemId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!itemId) {
    throw new Error("Item ID is required");
  }

  try {
    // Get the item to equip
    const { data: itemToEquip, error: itemError } = await supabase
      .from("Items")
      .select("*")
      .eq("id", itemId)
      .eq("userId", userId)
      .single();

    if (itemError || !itemToEquip) {
      console.error("Failed to fetch item:", itemError);
      throw new Error("Item not found or doesn't belong to user");
    }

    // Unequip all items of the same type first
    const { error: unequipError } = await supabase
      .from("Items")
      .update({
        equipped: false,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("type", itemToEquip.type);

    if (unequipError) {
      console.error("Failed to unequip items:", unequipError);
      throw new Error("Failed to unequip existing items");
    }

    // Equip the selected item
    const { data: equippedItem, error: equipError } = await supabase
      .from("Items")
      .update({
        equipped: true,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", itemId)
      .eq("userId", userId)
      .select()
      .single();

    if (equipError) {
      console.error("Failed to equip item:", equipError);
      throw new Error("Failed to equip item");
    }

    revalidatePath("/item");
    console.log(
      `Item ${itemToEquip.name} ${
        !itemToEquip.equipped ? "equipped" : "unequipped"
      } successfully`
    );

    return {
      success: true,
      item: equippedItem,
    };
  } catch (error) {
    console.error("Error in equipItem:", error);
    throw error;
  }
};
