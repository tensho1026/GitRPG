"use server";

import { supabase } from "../../../supabase/supabase.config";

interface UserData {
  id: string;
  name: string;
  image: string;
}

export const saveUserToDatabase = async (userData: UserData) => {
  if (!userData?.id) {
    console.error("User ID is missing:", userData);
    throw new Error("User ID is required");
  }

  console.log("👤 [DEBUG] Saving user to database:", {
    userId: userData.id,
    userName: userData.name,
    hasImage: !!userData.image,
  });

  try {
    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("Users")
      .select("id, createdAt")
      .eq("id", userData.id)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking existing user:", userCheckError);
      throw new Error(
        `Failed to check existing user: ${userCheckError.message}`
      );
    }

    const isNewUser = !existingUser;
    const currentTime = new Date().toISOString();

    console.log("🆔 [DEBUG] User existence check:", {
      isNewUser,
      existingUserId: existingUser?.id,
      existingCreatedAt: existingUser?.createdAt,
    });

    // Upsert user in Users table
    const upsertData = {
      id: userData.id,
      name: userData.name,
      image: userData.image,
      updatedAt: currentTime,
      // Only set createdAt for new users
      ...(isNewUser && { createdAt: currentTime }),
    };

    console.log("📝 [DEBUG] Upserting user with data:", upsertData);

    const { data: user, error: userError } = await supabase
      .from("Users")
      .upsert(upsertData, {
        onConflict: "id",
      })
      .select();

    if (userError) {
      console.error("Failed to upsert user:", userError);
      throw new Error(`Failed to save user: ${userError.message}`);
    }

    // Check if UserStatus exists
    const { data: existingStatus, error: statusCheckError } = await supabase
      .from("UserStatus")
      .select("id")
      .eq("userId", userData.id)
      .single();

    if (statusCheckError && statusCheckError.code !== "PGRST116") {
      console.error("Error checking user status:", statusCheckError);
      throw new Error(
        `Failed to check user status: ${statusCheckError.message}`
      );
    }

    console.log("🔍 [DEBUG] UserStatus check result:", {
      existingStatus: !!existingStatus,
      errorCode: statusCheckError?.code,
    });

    // Create UserStatus if it doesn't exist
    if (!existingStatus) {
      const currentTime = new Date().toISOString();
      const insertData = {
        id: crypto.randomUUID(),
        userId: userData.id,
        level: 1,
        commit: 0,
        coin: 100,
        hp: 100,
        attack: 10,
        defense: 5,
        selectedAvatar: null,
        unlockedAvatars: [],
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      console.log("🆕 [DEBUG] Creating new UserStatus:", {
        userId: userData.id,
        createdAt: currentTime,
        initialCommits: insertData.commit,
      });

      const { data: userStatus, error: statusError } = await supabase
        .from("UserStatus")
        .insert(insertData)
        .select("id, userId, level, coin");

      if (statusError) {
        console.error("Failed to create user status:", statusError);
        console.error("Insert data was:", insertData);
        throw new Error(`Failed to create user status: ${statusError.message}`);
      }

      console.log("✅ [DEBUG] UserStatus created successfully:", userStatus);
    } else {
      console.log("ℹ️ [DEBUG] UserStatus already exists, skipping creation");
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error in saveUserToDatabase:", error);
    throw error;
  }
};
