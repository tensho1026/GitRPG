"use server";

import { supabase } from "../../../supabase/supabase.config";

export const getUserAvatars = async (userId: string) => {
  if (!userId) {
    console.error("getUserAvatars: User ID is not provided");
    return [];
  }

  try {
    const { data: avatars, error } = await supabase
      .from("Avatar")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Failed to fetch user avatars:", error);
      throw new Error(`Failed to fetch user avatars: ${error.message}`);
    }

    return avatars || [];
  } catch (error) {
    console.error("Error in getUserAvatars:", error);
    throw error;
  }
};

export const getEquippedAvatar = async (userId: string) => {
  if (!userId) {
    console.error("getEquippedAvatar: User ID is not provided");
    return null;
  }

  try {
    const { data: equippedAvatar, error } = await supabase
      .from("Avatar")
      .select("*")
      .eq("userId", userId)
      .eq("equipped", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - user has no equipped avatar
        return null;
      }
      console.error("Failed to fetch equipped avatar:", error);
      throw new Error(`Failed to fetch equipped avatar: ${error.message}`);
    }

    return equippedAvatar;
  } catch (error) {
    console.error("Error in getEquippedAvatar:", error);
    return null;
  }
};
