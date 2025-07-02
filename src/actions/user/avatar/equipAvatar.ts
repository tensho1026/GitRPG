"use server";

import { prisma } from "../../../lib/prisma";

export const equipAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  // First, unequip all avatars
  await prisma.avatar.updateMany({
    where: { userId: email },
    data: { equipped: false },
  });

  // Then equip the selected avatar
  await prisma.avatar.update({
    where: { id: avatarId },
    data: { equipped: true },
  });

  return { success: true };
};
