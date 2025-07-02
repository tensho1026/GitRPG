"use server";

import { supabase } from "../../../supabase/supabase.config";

export const equipAvatar = async (userId: string, avatarId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!avatarId) {
    throw new Error("Avatar ID is required");
  }

  try {
    // Get the avatar to equip
    const { data: avatarToEquip, error: avatarError } = await supabase
      .from("Avatar")
      .select("*")
      .eq("id", avatarId)
      .eq("userId", userId)
      .single();

    if (avatarError || !avatarToEquip) {
      console.error("Failed to fetch avatar:", avatarError);
      throw new Error("Avatar not found or doesn't belong to user");
    }

    // Unequip all other avatars first
    const { error: unequipError } = await supabase
      .from("Avatar")
      .update({
        equipped: false,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId);

    if (unequipError) {
      console.error("Failed to unequip other avatars:", unequipError);
      throw new Error("Failed to unequip other avatars");
    }

    // Equip the selected avatar
    const { data: equippedAvatar, error: equipError } = await supabase
      .from("Avatar")
      .update({
        equipped: true,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", avatarId)
      .eq("userId", userId)
      .select()
      .single();

    if (equipError) {
      console.error("Failed to equip avatar:", equipError);
      throw new Error("Failed to equip avatar");
    }

    return {
      success: true,
      avatar: equippedAvatar,
    };
  } catch (error) {
    console.error("Error in equipAvatar:", error);
    throw error;
  }
};
