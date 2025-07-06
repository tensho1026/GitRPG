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

  try {
    // Upsert user in Users table
    const { data: user, error: userError } = await supabase
      .from("Users")
      .upsert(
        {
          id: userData.id,
          name: userData.name,
          image: userData.image,
          updatedAt: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
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

    // Create UserStatus if it doesn't exist
    if (!existingStatus) {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data: userStatus, error: statusError } = await supabase
        .from("UserStatus")
        .insert(insertData)
        .select("id, userId, level, coin");

      if (statusError) {
        console.error("Failed to create user status:", statusError);
        console.error("Insert data was:", insertData);
        throw new Error(`Failed to create user status: ${statusError.message}`);
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error in saveUserToDatabase:", error);
    throw error;
  }
};
