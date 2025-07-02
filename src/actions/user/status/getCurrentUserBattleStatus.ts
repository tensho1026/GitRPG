"use server";

import { supabase } from "../../../supabase/supabase.config";

export const getCurrentUserBattleStatus = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Get user base status
    const { data: userStatus, error: statusError } = await supabase
      .from("UserStatus")
      .select("*")
      .eq("userId", userId)
      .single();

    if (statusError || !userStatus) {
      console.error("Failed to fetch user status:", statusError);
      throw new Error("Failed to fetch user status");
    }

    // Get equipped items
    const { data: equippedItems, error: itemsError } = await supabase
      .from("Items")
      .select("*")
      .eq("userId", userId)
      .eq("equipped", true);

    if (itemsError) {
      console.error("Failed to fetch equipped items:", itemsError);
      throw new Error("Failed to fetch equipped items");
    }

    // Get equipped avatar
    const { data: equippedAvatar, error: avatarError } = await supabase
      .from("Avatar")
      .select("*")
      .eq("userId", userId)
      .eq("equipped", true)
      .single();

    // Avatar is optional, so don't throw error if not found
    if (avatarError && avatarError.code !== "PGRST116") {
      console.error("Failed to fetch equipped avatar:", avatarError);
    }

    // Calculate total stats
    let totalHp = userStatus.hp;
    let totalAttack = userStatus.attack;
    let totalDefense = userStatus.defense;

    // Add item bonuses
    if (equippedItems && equippedItems.length > 0) {
      for (const item of equippedItems) {
        totalAttack += item.attack || 0;
        totalDefense += item.defense || 0;
      }
    }

    // Add avatar bonuses
    if (equippedAvatar) {
      totalHp += equippedAvatar.hp || 0;
      totalAttack += equippedAvatar.attack || 0;
      totalDefense += equippedAvatar.defense || 0;
    }

    return {
      userId: userStatus.userId,
      level: userStatus.level,
      baseStats: {
        hp: userStatus.hp,
        attack: userStatus.attack,
        defense: userStatus.defense,
      },
      totalStats: {
        hp: totalHp,
        attack: totalAttack,
        defense: totalDefense,
      },
      equippedItems: equippedItems || [],
      equippedAvatar: equippedAvatar || null,
      coin: userStatus.coin,
      commit: userStatus.commit,
    };
  } catch (error) {
    console.error("Error in getCurrentUserBattleStatus:", error);
    throw error;
  }
};
