"use server";

import { prisma } from "../../../../prisma/prisma";

// This would ideally come from a shared source, but for simplicity, we define it here.
const avatarCharacters = [
  { id: "warrior", unlockLevel: 1, price: 0 },
  { id: "guardian", unlockLevel: 5, price: 500 },
  { id: "mage", unlockLevel: 8, price: 800 },
];

export const unlockAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const avatarToUnlock = avatarCharacters.find((a) => a.id === avatarId);
  if (!avatarToUnlock) {
    throw new Error("Avatar not found.");
  }

  const userStatus = await prisma.userStatus.findUnique({
    where: { userId: email },
  });

  if (!userStatus) {
    throw new Error("User status not found.");
  }

  if (userStatus.unlockedAvatars.includes(avatarId)) {
    throw new Error("Avatar already unlocked.");
  }

  if (userStatus.level < avatarToUnlock.unlockLevel) {
    throw new Error("Level requirement not met.");
  }

  if (userStatus.coin < avatarToUnlock.price) {
    throw new Error("Not enough coins.");
  }

  await prisma.userStatus.update({
    where: { userId: email },
    data: {
      coin: {
        decrement: avatarToUnlock.price,
      },
      unlockedAvatars: {
        push: avatarId,
      },
    },
  });

  return { success: true };
};
