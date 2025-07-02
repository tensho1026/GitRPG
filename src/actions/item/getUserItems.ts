"use server";

import { prisma } from "../../lib/prisma";

export const getUserItems = async (email: string) => {
  if (!email) {
    return [];
  }
  try {
    const items = await prisma.items.findMany({
      where: {
        userId: email,
      },
    });
    return items;
  } catch (error) {
    console.error("Error fetching user items:", error);
    return [];
  }
};
