"use server";

import { prisma } from "../../../../prisma/prisma";

export const getAvatarData = async (email: string) => {
  if (!email) {
    throw new Error("User email is not provided");
  }

  try {
    // Get user status (level and coin)
    const userStatus = await prisma.userStatus.findUnique({
      where: { userId: email },
      select: {
        level: true,
        coin: true,
      },
    });

    if (!userStatus) {
      throw new Error("User status not found");
    }

    // Get equipped avatar
    const equippedAvatar = await prisma.avatar.findFirst({
      where: {
        userId: email,
        equipped: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
      },
    });

    // Get all user avatars (unlocked avatars)
    const userAvatars = await prisma.avatar.findMany({
      where: { userId: email },
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
        equipped: true,
      },
    });

    return {
      level: userStatus.level,
      coin: userStatus.coin,
      selectedAvatar: equippedAvatar,
      unlockedAvatars: userAvatars,
    };
  } catch (error) {
    console.error("Error fetching avatar data:", error);
    throw new Error("Failed to fetch avatar data.");
  }
};
