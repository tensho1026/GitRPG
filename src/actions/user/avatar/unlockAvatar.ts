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
  if (!email) {
    throw new Error("User not found.");
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

  // Get user's owned avatars from the Avatar table
  const { data: userAvatars, error: avatarsError } = await supabase
    .from("Avatar")
    .select("name")
    .eq("userId", email);

  if (avatarsError) {
    console.error("Failed to fetch user avatars:", avatarsError);
    throw new Error("Failed to fetch user avatars.");
  }

  const ownedAvatarNames = userAvatars?.map((avatar) => avatar.name) || [];

  const newlyUnlockedAvatars: string[] = [];

  // Check each avatar to see if it should be auto-unlocked
  for (const avatar of avatarCharacters) {
    // Skip if already owned or if level requirement not met
    if (
      ownedAvatarNames.includes(avatar.name) ||
      userStatus.level < avatar.unlockLevel
    ) {
      continue;
    }

    // Auto-unlock if user has enough coins or if it's free
    if (avatar.price === 0 || userStatus.coin >= avatar.price) {
      newlyUnlockedAvatars.push(avatar.id);
    }
  }

  let updatedUserStatus = userStatus;

  // Update the database with newly unlocked avatars
  if (newlyUnlockedAvatars.length > 0) {
    const totalCost = newlyUnlockedAvatars.reduce((total, avatarId) => {
      const avatar = avatarCharacters.find((a) => a.id === avatarId);
      return total + (avatar?.price || 0);
    }, 0);

    try {
      // Deduct coins from user
      const { error: coinError } = await supabase
        .from("UserStatus")
        .update({
          coin: userStatus.coin - totalCost,
          updatedAt: new Date().toISOString(),
        })
        .eq("userId", email);

      if (coinError) {
        console.error("Failed to update coins:", coinError);
        throw new Error("Failed to deduct coins.");
      }

      // Create new avatars
      const avatarsToCreate = newlyUnlockedAvatars
        .map((avatarId) => {
          const avatar = avatarCharacters.find((a) => a.id === avatarId);
          if (!avatar) return null;

          return {
            name: avatar.name,
            image: avatar.image,
            description: avatar.description,
            type: avatar.type,
            hp: avatar.statBonus.hp,
            attack: avatar.statBonus.attack,
            defense: avatar.statBonus.defense,
            price: avatar.price,
            userId: email,
            equipped: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        })
        .filter(Boolean);

      if (avatarsToCreate.length > 0) {
        const { error: createError } = await supabase
          .from("Avatar")
          .insert(avatarsToCreate);

        if (createError) {
          console.error("Failed to create avatars:", createError);
          throw new Error("Failed to create avatars.");
        }
      }

      // Get updated user status
      const { data: updatedStatus, error: updateError } = await supabase
        .from("UserStatus")
        .select("*")
        .eq("userId", email)
        .single();

      if (!updateError && updatedStatus) {
        updatedUserStatus = updatedStatus;
      }
    } catch (error) {
      console.error("Error in autoUnlockAvatars transaction:", error);
      throw error;
    }
  }

  return {
    success: true,
    newlyUnlockedAvatars,
    totalCost: newlyUnlockedAvatars.reduce((total, avatarId) => {
      const avatar = avatarCharacters.find((a) => a.id === avatarId);
      return total + (avatar?.price || 0);
    }, 0),
    // Return updated user data directly
    userData: {
      level: updatedUserStatus.level,
      coin: updatedUserStatus.coin,
      selectedAvatar: updatedUserStatus.selectedAvatar || "warrior",
      unlockedAvatars: updatedUserStatus.unlockedAvatars || [],
    },
  };
};
