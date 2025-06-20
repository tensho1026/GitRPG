"use server";

import { prisma } from "../../../../prisma/prisma";

export const selectAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const userStatus = await prisma.userStatus.findUnique({
    where: { userId: email },
    select: { unlockedAvatars: true },
  });

  if (!userStatus) {
    throw new Error("User status not found.");
  }

  if (!userStatus.unlockedAvatars.includes(avatarId)) {
    throw new Error("You have not unlocked this avatar.");
  }

  await prisma.userStatus.update({
    where: { userId: email },
    data: {
      selectedAvatar: avatarId,
    },
  });

  return { success: true };
};
