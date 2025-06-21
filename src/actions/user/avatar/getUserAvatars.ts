"use server";

import { prisma } from "../../../../prisma/prisma";

export const getUserAvatars = async (email: string) => {
  if (!email) {
    throw new Error("User email is not provided");
  }

  try {
    const avatars = await prisma.avatar.findMany({
      where: { userId: email },
      orderBy: { createdAt: "asc" },
    });

    console.log("🔍 Fetched avatars:", avatars);
    return avatars;
  } catch (error) {
    console.error("Error fetching user avatars:", error);
    throw new Error("Failed to fetch user avatars.");
  }
};

export const getEquippedAvatar = async (email: string) => {
  if (!email) {
    throw new Error("User email is not provided");
  }

  try {
    const equippedAvatar = await prisma.avatar.findFirst({
      where: { userId: email, equipped: true },
    });

    console.log("🔍 Fetched equipped avatar:", equippedAvatar);
    return equippedAvatar;
  } catch (error) {
    console.error("Error fetching equipped avatar:", error);
    throw new Error("Failed to fetch equipped avatar.");
  }
};
