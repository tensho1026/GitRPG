"use server";

import { supabase } from "../../../supabase/supabase.config";
import { randomUUID } from "crypto";
import { avatarCharacters } from "@/data/avatar";

export const purchaseAvatar = async (userId: string, avatarId: string) => {
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

    // Check if user already owns this avatar
    const { data: existingAvatar, error: existingError } = await supabase
      .from("Avatar")
      .select("id")
      .eq("userId", userId)
      .eq("name", avatar.name)
      .single();

    if (!existingError && existingAvatar) {
      throw new Error("You already own this avatar");
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

    if (userStatus.coin < avatar.price) {
      throw new Error("Insufficient coins");
    }

    // Update user's coin amount
    const { error: coinError } = await supabase
      .from("UserStatus")
      .update({
        coin: userStatus.coin - avatar.price,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId);

    if (coinError) {
      console.error("Failed to update user coins:", coinError);
      throw new Error("Failed to update user coins");
    }

    // Create the avatar
    const { data: newAvatar, error: avatarError } = await supabase
      .from("Avatar")
      .insert({
        id: randomUUID(),
        name: avatar.name,
        image: avatar.image,
        description: avatar.description,
        type: avatar.type,
        hp: avatar.statBonus.hp,
        attack: avatar.statBonus.attack,
        defense: avatar.statBonus.defense,
        price: avatar.price,
        equipped: false,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (avatarError) {
      console.error("Failed to create avatar:", avatarError);
      throw new Error("Failed to create avatar");
    }

    return {
      success: true,
      avatar: newAvatar,
      remainingCoin: userStatus.coin - avatar.price,
    };
  } catch (error) {
    console.error("Error in purchaseAvatar:", error);
    throw error;
  }
};
