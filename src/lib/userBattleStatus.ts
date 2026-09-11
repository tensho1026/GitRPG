import "server-only";

import { db } from "@/db/neon";
import type { Avatar, Item } from "@/types/user/userStatus";

export async function getUserBattleStatusById(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: userStatus, error: statusError } = await db
    .from("UserStatus")
    .select("userId, level, commit, coin, hp, attack, defense")
    .eq("userId", userId)
    .single();

  if (statusError || !userStatus) {
    throw new Error("Failed to fetch user status");
  }

  const { data: equippedItemsData, error: itemsError } = await db
    .from("Items")
    .select("id, equipmentId, name, image, description, type, attack, defense, price, equipped, userId, createdAt, updatedAt")
    .eq("userId", userId)
    .eq("equipped", true);

  if (itemsError) {
    throw new Error("Failed to fetch equipped items");
  }

  const equippedItems = (Array.isArray(equippedItemsData)
    ? equippedItemsData
    : []) as Item[];

  const { data: equippedAvatarData, error: avatarError } = await db
    .from("Avatar")
    .select("id, name, image, description, type, hp, attack, defense, price, equipped, userId, createdAt, updatedAt")
    .eq("userId", userId)
    .eq("equipped", true)
    .limit(1)
    .maybeSingle();

  if (avatarError) {
    throw new Error("Failed to fetch equipped avatar");
  }

  const equippedAvatar = (equippedAvatarData || null) as Avatar | null;

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
