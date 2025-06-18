'use server'

import { prisma } from "../../../../../prisma/prisma";

export const getCurrentCoin = async (userId: string) => {
  const userStatus = await prisma.userStatus.findUnique({
    where: { userId },
  });
  return userStatus?.coin;
};