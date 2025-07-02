"use server";

import { prisma } from "../../../lib/prisma";
import { getUserCurrentItems } from "../../item/getUserCurrentitems";

export const getCurrentUserBattleStatus = async (email: string) => {
  if (!email) {
    return { hp: 0, attack: 0, defense: 0 };
  }

  try {
    // Get user status
    const userStatus = await prisma.userStatus.findUnique({
      where: { userId: email },
      select: {
        hp: true,
        attack: true,
        defense: true,
      },
    });

    if (!userStatus) {
      return { hp: 0, attack: 0, defense: 0 };
    }

    // Get equipped avatar
    const equippedAvatar = await prisma.avatar.findFirst({
      where: { userId: email, equipped: true },
      select: {
        hp: true,
        attack: true,
        defense: true,
      },
    });

    // Get equipped items
    const equippedItems = await getUserCurrentItems(email);

    // Calculate item bonuses
    const itemAttack = equippedItems.reduce(
      (acc, item) => acc + (item.attack ?? 0),
      0
    );
    const itemDefense = equippedItems.reduce(
      (acc, item) => acc + (item.defense ?? 0),
      0
    );

    // Calculate avatar bonuses
    const avatarHp = equippedAvatar?.hp ?? 0;
    const avatarAttack = equippedAvatar?.attack ?? 0;
    const avatarDefense = equippedAvatar?.defense ?? 0;

    // Calculate total stats
    const totalHp = userStatus.hp + avatarHp;
    const totalAttack = userStatus.attack + itemAttack + avatarAttack;
    const totalDefense = userStatus.defense + itemDefense + avatarDefense;

    return {
      hp: totalHp,
      attack: totalAttack,
      defense: totalDefense,
    };
  } catch (error) {
    console.error("Error fetching user's battle status:", error);
    return { hp: 0, attack: 0, defense: 0 };
  }
};
