"use server";

import { prisma } from "../../../../lib/prisma";

export const reduceCoin = async (userId: string, amount: number) => {
  await prisma.userStatus.update({
    where: { userId },
    data: { coin: { decrement: amount } },
  });
};
