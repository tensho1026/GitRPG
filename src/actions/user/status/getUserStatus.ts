"use server";

import { supabase } from "../../../supabase/supabase.config";

export const getUserStatus = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("id, name, image, createdAt, updatedAt")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Failed to fetch user:", userError);
      throw new Error(`Failed to fetch user: ${userError.message}`);
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Get user status
    const { data: userStatus, error: statusError } = await supabase
      .from("UserStatus")
      .select("*")
      .eq("userId", userId)
      .single();

    if (statusError) {
      console.error("Failed to fetch user status:", statusError);
      throw new Error(`Failed to fetch user status: ${statusError.message}`);
    }

    if (!userStatus) {
      throw new Error("User status not found");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      status: {
        id: userStatus.id,
        userId: userStatus.userId,
        level: userStatus.level,
        commit: userStatus.commit,
        coin: userStatus.coin,
        hp: userStatus.hp,
        attack: userStatus.attack,
        defense: userStatus.defense,
        selectedAvatar: userStatus.selectedAvatar,
        unlockedAvatars: userStatus.unlockedAvatars,
        createdAt: userStatus.createdAt,
        updatedAt: userStatus.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error in getUserStatus:", error);
    throw error;
  }
};
