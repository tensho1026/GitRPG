"use server";

import { prisma } from "../../../../prisma/prisma";
import { getUserCurrentItems } from "../../item/getUserCurrentitems";

export const getCurrentUserBattleStatus = async (email: string) => {
  if (!email) {
    return { hp: 0, attack: 0, defense: 0 };
  }

  try {
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

    const equippedItems = await getUserCurrentItems(email);

    const itemAttack = equippedItems.reduce(
      (acc, item) => acc + (item.attack ?? 0),
      0
    );
    const itemDefense = equippedItems.reduce(
      (acc, item) => acc + (item.defense ?? 0),
      0
    );

    const totalAttack = userStatus.attack + itemAttack;
    const totalDefense = userStatus.defense + itemDefense;

    return {
      hp: userStatus.hp,
      attack: totalAttack,
      defense: totalDefense,
    };
  } catch (error) {
    console.error("Error fetching user's battle status:", error);
    return { hp: 0, attack: 0, defense: 0 };
  }
};
