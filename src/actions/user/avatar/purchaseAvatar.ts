"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../../supabase/supabase.config";
import { avatarCharacters } from "@/data/avatar";

export const purchaseAvatar = async (userId: string, avatarId: string) => {
  await assertAuthenticatedUser(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!avatarId) {
    throw new Error("Avatar ID is required");
  }

  try {
    // Find the avatar to purchase
    const avatar = avatarCharacters.find((a) => a.id === avatarId);
    if (!avatar) {
      throw new Error("Avatar not found");
    }

    const { data, error } = await supabase.rpc("purchase_avatar", {
      p_user_id: userId,
      p_avatar_id: crypto.randomUUID(),
      p_name: avatar.name,
      p_image: avatar.image,
      p_description: avatar.description,
      p_type: avatar.type,
      p_hp: avatar.statBonus.hp,
      p_attack: avatar.statBonus.attack,
      p_defense: avatar.statBonus.defense,
      p_price: avatar.price,
    });

    if (error || !data?.avatar) {
      console.error("Failed to purchase avatar transaction:", error);
      throw new Error(error?.message || "Failed to purchase avatar");
    }

    return {
      success: true,
      avatar: data.avatar,
      remainingCoin: data.remainingCoin,
    };
  } catch (error) {
    console.error("Error in purchaseAvatar:", error);
    throw error;
  }
};
