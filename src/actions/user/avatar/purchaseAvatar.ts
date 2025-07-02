"use server";

import { prisma } from "../../../lib/prisma";
import { avatarCharacters } from "@/data/avatar";

export const purchaseAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const avatarToPurchase = avatarCharacters.find((a) => a.id === avatarId);
  if (!avatarToPurchase) {
    throw new Error("Avatar not found.");
  }

  const userStatus = await prisma.userStatus.findUnique({
    where: { userId: email },
  });

  if (!userStatus) {
    throw new Error("User status not found.");
  }

  // Check if user already has this avatar
  const existingAvatar = await prisma.avatar.findFirst({
    where: {
      userId: email,
      name: avatarToPurchase.name,
    },
  });

  if (existingAvatar) {
    throw new Error("Avatar already owned.");
  }

  // Check if user has enough coins
  if (userStatus.coin < avatarToPurchase.price) {
    throw new Error("Not enough coins.");
  }

  // Check if user meets level requirement
  if (userStatus.level < avatarToPurchase.unlockLevel) {
    throw new Error("Level requirement not met.");
  }

  // Purchase the avatar
  await prisma.$transaction([
    // Deduct coins from user
    prisma.userStatus.update({
      where: { userId: email },
      data: {
        coin: {
          decrement: avatarToPurchase.price,
        },
      },
    }),
    // Add avatar to user's collection
    prisma.avatar.create({
      data: {
        name: avatarToPurchase.name,
        image: avatarToPurchase.image,
        description: avatarToPurchase.description,
        type: avatarToPurchase.type,
        hp: avatarToPurchase.statBonus.hp,
        attack: avatarToPurchase.statBonus.attack,
        defense: avatarToPurchase.statBonus.defense,
        price: avatarToPurchase.price,
        userId: email,
      },
    }),
  ]);

  return { success: true };
};
