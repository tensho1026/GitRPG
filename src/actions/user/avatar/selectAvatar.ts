"use server";

import { prisma } from "../../../../prisma/prisma";

export const selectAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  // Check if user owns the avatar
  const userAvatar = await prisma.avatar.findFirst({
    where: {
      id: avatarId,
      userId: email,
    },
  });

  if (!userAvatar) {
    throw new Error("You have not unlocked this avatar.");
  }

  try {
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Unequip all currently equipped avatars for this user
      await tx.avatar.updateMany({
        where: {
          userId: email,
          equipped: true,
        },
        data: { equipped: false },
      });

      // Equip the selected avatar
      await tx.avatar.update({
        where: { id: avatarId },
        data: { equipped: true },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error selecting avatar:", error);
    throw new Error("Failed to select avatar.");
  }
};
