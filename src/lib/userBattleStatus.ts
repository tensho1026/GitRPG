import "server-only";

import { supabase } from "@/supabase/supabase.config";

export async function getUserBattleStatusById(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: userStatus, error: statusError } = await supabase
    .from("UserStatus")
    .select("*")
    .eq("userId", userId)
    .single();

  if (statusError || !userStatus) {
    throw new Error("Failed to fetch user status");
  }

  const { data: equippedItems, error: itemsError } = await supabase
    .from("Items")
    .select("*")
    .eq("userId", userId)
    .eq("equipped", true);

  if (itemsError) {
    throw new Error("Failed to fetch equipped items");
  }

  const { data: equippedAvatar, error: avatarError } = await supabase
    .from("Avatar")
    .select("*")
    .eq("userId", userId)
    .eq("equipped", true)
    .maybeSingle();

  if (avatarError) {
    throw new Error("Failed to fetch equipped avatar");
  }

  let totalHp = userStatus.hp;
  let totalAttack = userStatus.attack;
  let totalDefense = userStatus.defense;

  for (const item of equippedItems ?? []) {
    totalAttack += item.attack || 0;
    totalDefense += item.defense || 0;
  }

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
}
