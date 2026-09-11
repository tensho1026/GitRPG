"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";

import { supabase } from "../../../supabase/supabase.config";

export const equipAvatar = async (userId: string, avatarId: string) => {
  await assertAuthenticatedUser(userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!avatarId) {
    throw new Error("Avatar ID is required");
  }

  try {
    const { data, error } = await supabase.rpc("equip_avatar", {
      p_user_id: userId,
      p_avatar_id: avatarId,
    });

    if (error || !data?.avatar) {
      console.error("Failed to equip avatar transaction:", error);
      throw new Error(error?.message || "Failed to equip avatar");
    }

    return {
      success: true,
      avatar: data.avatar,
    };
  } catch (error) {
    console.error("Error in equipAvatar:", error);
    throw error;
  }
};
