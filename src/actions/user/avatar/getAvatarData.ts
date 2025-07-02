"use server";

import { prisma } from "../../../lib/prisma";

export const getAvatarData = async (email: string) => {
  if (!email) {
    throw new Error("User email is not provided");
  }

  try {
    const userStatus = await prisma.userStatus.findUnique({
      where: { userId: email },
      select: {
        level: true,
        coin: true,
        selectedAvatar: true,
        unlockedAvatars: true,
      },
    });

    if (!userStatus) {
      throw new Error("User status not found");
    }

    return {
      level: userStatus.level,
      coin: userStatus.coin,
      selectedAvatar: userStatus.selectedAvatar,
      unlockedAvatars: userStatus.unlockedAvatars,
    };
  } catch (error) {
    console.error("Error fetching avatar data:", error);
    throw new Error("Failed to fetch avatar data.");
  }
};
