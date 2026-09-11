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
    const equipment = equipmentData.find((item) => item.id === equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    const { data, error } = await supabase.rpc("purchase_item", {
      p_user_id: userId,
      p_equipment_id: equipment.id,
      p_name: equipment.name,
      p_image: equipment.image,
      p_description: equipment.description,
      p_type: equipment.type,
      p_attack: equipment.attack ?? null,
      p_defense: equipment.defense ?? null,
      p_price: equipment.price,
    });

    if (error || !data?.item) {
      console.error("Failed to purchase item transaction:", error);
      throw new Error(error?.message || "Failed to purchase item");
    }

    revalidatePath("/item");

    return {
      success: true,
      item: data.item,
      remainingCoin: data.remainingCoin,
    };
  } catch (error) {
    console.error("Error in purchaseItem:", error);
    throw error;
  }
};
