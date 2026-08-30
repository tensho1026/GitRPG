"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../supabase/supabase.config";
import { equipmentData } from "@/data/equipment";
import { revalidatePath } from "next/cache";

export const purchaseItem = async (userId: string, equipmentId: string) => {
  await assertAuthenticatedUser(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!equipmentId) {
    throw new Error("Equipment ID is required");
  }

  try {
    // Find the equipment to purchase
    const equipment = equipmentData.find((item) => item.id === equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Check if user already owns this item
    const { data: existingItem, error: existingError } = await supabase
      .from("Items")
      .select("id")
      .eq("userId", userId)
      .eq("equipmentId", equipmentId)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check item ownership:", existingError);
      throw new Error("Failed to check item ownership");
    }

    if (existingItem) {
      throw new Error("You already own this item");
    }

    // Get user's current coin amount
    const { data: userStatus, error: userError } = await supabase
      .from("UserStatus")
      .select("coin")
      .eq("userId", userId)
      .single();

    if (userError || !userStatus) {
      console.error("Failed to fetch user status:", userError);
      throw new Error("Failed to fetch user status");
    }

    if (userStatus.coin < equipment.price) {
      throw new Error("Insufficient coins");
    }

    // Debit only if the balance has not changed since it was read. This
    // prevents two simultaneous purchases from overwriting each other.
    const remainingCoin = userStatus.coin - equipment.price;
    const { data: debitedStatus, error: coinError } = await supabase
      .from("UserStatus")
      .update({
        coin: remainingCoin,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("coin", userStatus.coin)
      .gte("coin", equipment.price)
      .select("coin")
      .maybeSingle();

    if (coinError) {
      console.error("Failed to update user coins:", coinError);
      throw new Error("Failed to update user coins");
    }

    if (!debitedStatus) {
      throw new Error("Coin balance changed. Please try again.");
    }

    // Create the item
    const { data: newItem, error: itemError } = await supabase
      .from("Items")
      .insert({
        equipmentId: equipment.id,
        name: equipment.name,
        image: equipment.image,
        description: equipment.description,
        type: equipment.type,
        attack: equipment.attack || null,
        defense: equipment.defense || null,
        price: equipment.price,
        equipped: false,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (itemError) {
      console.error("Failed to create item:", itemError);
      await supabase
        .from("UserStatus")
        .update({ coin: userStatus.coin, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .eq("coin", remainingCoin);
      throw new Error("Failed to create item");
    }

    revalidatePath("/item");

    return {
      success: true,
      item: newItem,
      remainingCoin,
    };
  } catch (error) {
    console.error("Error in purchaseItem:", error);
    throw error;
  }
};
