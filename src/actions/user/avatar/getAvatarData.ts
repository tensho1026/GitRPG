"use server";

import { supabase } from "../../../supabase/supabase.config";

export const getAvatarData = async (email: string) => {
  if (!email) {
    throw new Error("User email is not provided");
  }

  try {
    const { data: userStatus, error } = await supabase
      .from("UserStatus")
      .select("level, coin, selectedAvatar, unlockedAvatars")
      .eq("userId", email)
      .single();

    if (error) {
      console.error("Error fetching user status:", error);
      throw new Error("Failed to fetch user status.");
    }

    if (!userStatus) {
      throw new Error("User status not found");
    }

    return {
      level: userStatus.level,
      coin: userStatus.coin,
      selectedAvatar: userStatus.selectedAvatar,
      unlockedAvatars: userStatus.unlockedAvatars,
    };
  } catch (error) {
    console.error("Error fetching avatar data:", error);
    throw new Error("Failed to fetch avatar data.");
  }
};
