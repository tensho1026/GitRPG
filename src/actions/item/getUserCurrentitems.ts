"use server";

import { prisma } from "../../../prisma/prisma";

export const getUserCurrentItems = async (email: string) => {
  if (!email) {
    return [];
  }
  try {
    const items = await prisma.items.findMany({
      where: {
        userId: email,
        equipped: true,
      },
    });
    return items;
  } catch (error) {
    console.error("Error fetching user's current items:", error);
    console.log('ss')
    return [];
  }
};
