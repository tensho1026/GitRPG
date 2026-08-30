"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { ensureDefaultAvatar } from "@/lib/defaultAvatar";

import { supabase } from "../../../supabase/supabase.config";
import { randomUUID } from "crypto";
import { avatarCharacters } from "@/data/avatar";

export const unlockAvatar = async (email: string, avatarId: string) => {
  await assertAuthenticatedUser(email);
  if (!email) {
    throw new Error("User not found.");
  }

  const avatarToUnlock = avatarCharacters.find((a) => a.id === avatarId);
  if (!avatarToUnlock) {
    throw new Error("Avatar not found.");
  }

  const { data: userStatus, error: userStatusError } = await supabase
    .from("UserStatus")
    .select("level, coin")
    .eq("userId", email)
    .single();

  if (userStatusError || !userStatus) {
    console.error("Failed to fetch user status:", userStatusError);
    throw new Error("User status not found.");
  }

  // Check if user already has this avatar
  const { data: existingAvatar, error: avatarError } = await supabase
    .from("Avatar")
    .select("id")
    .eq("userId", email)
    .eq("name", avatarToUnlock.name)
    .maybeSingle();

  if (avatarError) {
    console.error("Failed to check avatar ownership:", avatarError);
    throw new Error("Failed to check avatar ownership.");
  }

  if (existingAvatar) {
    throw new Error("Avatar already owned.");
  }

  if (
    !Number.isSafeInteger(userStatus.level) ||
    userStatus.level < 1 ||
    !Number.isSafeInteger(userStatus.coin) ||
    userStatus.coin < 0
  ) {
    throw new Error("Invalid user status");
  }

  if (userStatus.level < avatarToUnlock.unlockLevel) {
    throw new Error("Level requirement not met.");
  }

  if (userStatus.coin < avatarToUnlock.price) {
    throw new Error("Not enough coins.");
  }

  try {
    // Debit only if the balance has not changed since it was read. This
    // prevents concurrent unlock requests from overspending the account.
    const remainingCoin = userStatus.coin - avatarToUnlock.price;
    const { data: debitedStatus, error: coinError } = await supabase
      .from("UserStatus")
      .update({
        coin: remainingCoin,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", email)
      .eq("coin", userStatus.coin)
      .gte("coin", avatarToUnlock.price)
      .select("coin")
      .maybeSingle();

    if (coinError) {
      console.error("Failed to update coins:", coinError);
      throw new Error("Failed to deduct coins.");
    }

    if (!debitedStatus) {
      throw new Error("Coin balance changed. Please try again.");
    }

    // Create the avatar
    const { error: createError } = await supabase.from("Avatar").insert({
      id: randomUUID(),
      name: avatarToUnlock.name,
      image: avatarToUnlock.image,
      description: avatarToUnlock.description,
      type: avatarToUnlock.type,
      hp: avatarToUnlock.statBonus.hp,
      attack: avatarToUnlock.statBonus.attack,
      defense: avatarToUnlock.statBonus.defense,
      price: avatarToUnlock.price,
      userId: email,
      equipped: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (createError) {
      console.error("Failed to create avatar:", createError);
      await supabase
        .from("UserStatus")
        .update({ coin: userStatus.coin, updatedAt: new Date().toISOString() })
        .eq("userId", email)
        .eq("coin", remainingCoin);
      throw new Error("Failed to create avatar.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in unlockAvatar:", error);
    throw error;
  }
};

export const autoUnlockAvatars = async (email: string) => {
  await assertAuthenticatedUser(email);
  try {
    const defaultAvatar = await ensureDefaultAvatar(email);
    return {
      success: true,
      newlyUnlockedAvatars: [],
      totalCost: 0,
      userData: {
        selectedAvatar: defaultAvatar.selectedAvatar,
        unlockedAvatars: defaultAvatar.unlockedAvatars,
      },
    };
  } catch (error) {
    console.error("❌ [autoUnlockAvatars] Fatal error:", error);
    console.error(
      "❌ [autoUnlockAvatars] Error stack:",
      (error as Error).stack
    );
    throw error;
  }
};
