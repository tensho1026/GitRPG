"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { ensureDefaultAvatar } from "@/lib/defaultAvatar";

import { db } from "../../../db/neon";
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

  try {
    const { data, error } = await db.rpc("unlock_avatar", {
      p_user_id: email,
      p_avatar_id: crypto.randomUUID(),
      p_name: avatarToUnlock.name,
      p_image: avatarToUnlock.image,
      p_description: avatarToUnlock.description,
      p_type: avatarToUnlock.type,
      p_hp: avatarToUnlock.statBonus.hp,
      p_attack: avatarToUnlock.statBonus.attack,
      p_defense: avatarToUnlock.statBonus.defense,
      p_price: avatarToUnlock.price,
      p_unlock_level: avatarToUnlock.unlockLevel,
    });

    if (error || !data?.avatar) {
      console.error("Failed to unlock avatar transaction:", error);
      throw new Error(error?.message || "Failed to unlock avatar.");
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
