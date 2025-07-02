"use server";

import { supabase } from "../../../supabase/supabase.config";

export const selectAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const { data: userStatus, error: userStatusError } = await supabase
    .from("UserStatus")
    .select("unlockedAvatars")
    .eq("userId", email)
    .single();

  if (userStatusError || !userStatus) {
    console.error("Failed to fetch user status:", userStatusError);
    throw new Error("User status not found.");
  }

  if (!userStatus.unlockedAvatars.includes(avatarId)) {
    throw new Error("You have not unlocked this avatar.");
  }

  const { error: updateError } = await supabase
    .from("UserStatus")
    .update({
      selectedAvatar: avatarId,
      updatedAt: new Date().toISOString(),
    })
    .eq("userId", email);

  if (updateError) {
    console.error("Failed to update selected avatar:", updateError);
    throw new Error("Failed to select avatar.");
  }

  return { success: true };
};
