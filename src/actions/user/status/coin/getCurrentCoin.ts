"use server";

import { prisma } from "../../../../lib/prisma";

export const getCurrentCoin = async (userId: string) => {
  const userStatus = await prisma.userStatus.findUnique({
    where: { userId },
  });
  return userStatus?.coin;
};
