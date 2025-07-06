"use server";

import { supabase } from "../../supabase/supabase.config";

export const getHomeData = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get user data with all relations in one query
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select(
        `
        id,
        name,
        image,
        createdAt,
        updatedAt,
        status:UserStatus!inner(
          id,
          userId,
          level,
          commit,
          coin,
          hp,
          attack,
          defense,
          selectedAvatar,
          unlockedAvatars,
          createdAt,
          updatedAt
        ),
        items:Items(
          id,
          equipmentId,
          name,
          image,
          description,
          type,
          attack,
          defense,
          price,
          equipped,
          userId,
          createdAt,
          updatedAt
        ),
        avatar:Avatar(
          id,
          name,
          image,
          description,
          type,
          hp,
          attack,
          defense,
          price,
          equipped,
          userId,
          createdAt,
          updatedAt
        )
      `
      )
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Failed to fetch user data:", userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    if (!userData) {
      throw new Error("User not found");
    }

    // Extract data from the response
    const user = {
      id: userData.id,
      name: userData.name,
      image: userData.image,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    // UserStatus should be a single object, not an array
    const userStatus = Array.isArray(userData.status)
      ? userData.status[0]
      : userData.status;
    const items = userData.items || [];
    const avatars = userData.avatar || [];

    // Find equipped avatar
    const equippedAvatar = avatars.find((avatar) => avatar.equipped) || null;

    // Find equipped items
    const equippedItems = items.filter((item) => item.equipped);

    // Calculate battle stats (base stats + equipped bonuses)
    let totalHp = userStatus?.hp || 100;
    let totalAttack = userStatus?.attack || 10;
    let totalDefense = userStatus?.defense || 5;

    // Add item bonuses
    equippedItems.forEach((item) => {
      totalAttack += item.attack || 0;
      totalDefense += item.defense || 0;
    });

    // Add avatar bonuses
    if (equippedAvatar) {
      totalHp += equippedAvatar.hp || 0;
      totalAttack += equippedAvatar.attack || 0;
      totalDefense += equippedAvatar.defense || 0;
    }

    // Return consolidated data
    return {
      // Basic user info
      user,

      // User status
      status: userStatus,

      // Items
      items,
      equippedItems,

      // Avatar
      avatars,
      equippedAvatar,

      // Battle stats
      battleStatus: {
        userId: userData.id,
        level: userStatus?.level || 1,
        baseStats: {
          hp: userStatus?.hp || 100,
          attack: userStatus?.attack || 10,
          defense: userStatus?.defense || 5,
        },
        totalStats: {
          hp: totalHp,
          attack: totalAttack,
          defense: totalDefense,
        },
        equippedItems,
        equippedAvatar,
        coin: userStatus?.coin || 0,
        commit: userStatus?.commit || 0,
      },

      // Combined user data for compatibility
      userWithStatus: {
        user,
        status: userStatus,
      },
    };
  } catch (error) {
    console.error("Error in getHomeData:", error);
    throw error;
  }
};
