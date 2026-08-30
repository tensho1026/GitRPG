"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../../supabase/supabase.config";
import { randomUUID } from "crypto";
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

    // Check if user already owns this avatar
    const { data: existingAvatar, error: existingError } = await supabase
      .from("Avatar")
      .select("id")
      .eq("userId", userId)
      .eq("name", avatar.name)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check avatar ownership:", existingError);
      throw new Error("Failed to check avatar ownership");
    }

    if (existingAvatar) {
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

    // Debit only if the balance has not changed since it was read. This
    // prevents two simultaneous purchases from overwriting each other.
    const remainingCoin = userStatus.coin - avatar.price;
    const { data: debitedStatus, error: coinError } = await supabase
      .from("UserStatus")
      .update({
        coin: remainingCoin,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId)
      .eq("coin", userStatus.coin)
      .gte("coin", avatar.price)
      .select("coin")
      .maybeSingle();

    if (coinError) {
      console.error("Failed to update user coins:", coinError);
      throw new Error("Failed to update user coins");
    }

    if (!debitedStatus) {
      throw new Error("Coin balance changed. Please try again.");
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
      await supabase
        .from("UserStatus")
        .update({ coin: userStatus.coin, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .eq("coin", remainingCoin);
      throw new Error("Failed to create avatar");
    }

    return {
      success: true,
      avatar: newAvatar,
      remainingCoin,
    };
  } catch (error) {
    console.error("Error in purchaseAvatar:", error);
    throw error;
  }
};
