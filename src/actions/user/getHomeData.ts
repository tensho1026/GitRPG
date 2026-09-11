"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { supabase } from "../../supabase/supabase.config";

export const getHomeData = async (userId: string) => {
  await assertAuthenticatedUser(userId);

  try {
    // The home screen only needs equipped data. Inventory pages own the full
    // Items/Avatar queries, so never transfer or scan the complete inventory
    // as part of the initial dashboard request.
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
          name,
          image,
          type,
          attack,
          defense,
          equipped,
          userId
        ),
        avatar:Avatar(
          id,
          name,
          image,
          type,
          hp,
          attack,
          defense,
          equipped,
          userId
        )
      `
      )
      .eq("id", userId)
      .eq("items.equipped", true)
      .eq("avatar.equipped", true)
      .single();

    if (userError) {
      console.error("Failed to fetch user data:", userError);
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    if (!userData) {
      throw new Error("User not found");
    }

    const user = {
      id: userData.id,
      name: userData.name,
      image: userData.image,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    const userStatus = Array.isArray(userData.status)
      ? userData.status[0]
      : userData.status;
    const equippedItems = userData.items || [];
    const equippedAvatars = userData.avatar || [];
    const equippedAvatar = equippedAvatars[0] || null;

    // Calculate battle stats (base stats + equipped bonuses)
    let totalHp = userStatus?.hp ?? 100;
    let totalAttack = userStatus?.attack ?? 10;
    let totalDefense = userStatus?.defense ?? 5;

    // Add item bonuses
    equippedItems.forEach((item) => {
      totalAttack += item.attack ?? 0;
      totalDefense += item.defense ?? 0;
    });

    // Add avatar bonuses
    if (equippedAvatar) {
      totalHp += equippedAvatar.hp ?? 0;
      totalAttack += equippedAvatar.attack ?? 0;
      totalDefense += equippedAvatar.defense ?? 0;
    }

    // Return consolidated data
    return {
      // Basic user info
      user,

      // User status
      status: userStatus,

      // Items
      // Kept under the existing property name for the home component API;
      // unlike the inventory action, this contains equipped items only.
      items: equippedItems,
      equippedItems,

      // Avatar
      avatars: equippedAvatars,
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
