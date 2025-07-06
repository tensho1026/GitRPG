"use server";

import { supabase } from "../../../supabase/supabase.config";
import { avatarCharacters } from "@/data/avatar";

export const unlockAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const avatarToUnlock = avatarCharacters.find((a) => a.id === avatarId);
  if (!avatarToUnlock) {
    throw new Error("Avatar not found.");
  }

  const { data: userStatus, error: userStatusError } = await supabase
    .from("UserStatus")
    .select("*")
    .eq("userId", email)
    .single();

  if (userStatusError || !userStatus) {
    console.error("Failed to fetch user status:", userStatusError);
    throw new Error("User status not found.");
  }

  // Check if user already has this avatar
  const { data: existingAvatar, error: avatarError } = await supabase
    .from("Avatar")
    .select("*")
    .eq("userId", email)
    .eq("name", avatarToUnlock.name)
    .single();

  if (!avatarError && existingAvatar) {
    throw new Error("Avatar already owned.");
  }

  if (userStatus.level < avatarToUnlock.unlockLevel) {
    throw new Error("Level requirement not met.");
  }

  if (userStatus.coin < avatarToUnlock.price) {
    throw new Error("Not enough coins.");
  }

  try {
    // Deduct coins from user
    const { error: coinError } = await supabase
      .from("UserStatus")
      .update({
        coin: userStatus.coin - avatarToUnlock.price,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", email);

    if (coinError) {
      console.error("Failed to update coins:", coinError);
      throw new Error("Failed to deduct coins.");
    }

    // Create the avatar
    const { error: createError } = await supabase.from("Avatar").insert({
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
      throw new Error("Failed to create avatar.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in unlockAvatar:", error);
    throw error;
  }
};

export const autoUnlockAvatars = async (email: string) => {
  try {
    if (!email) {
      throw new Error("User not found.");
    }

    return {
      success: true,
      newlyUnlockedAvatars: [],
      totalCost: 0,
      userData: {
        level: 1,
        coin: 100,
        selectedAvatar: "warrior",
        unlockedAvatars: ["warrior"],
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
