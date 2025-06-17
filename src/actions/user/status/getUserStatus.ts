'use server'

import { prisma } from "../../../../prisma/prisma";

export const getUserStatus = async (id: string) => {
  const userStatus = await prisma.users.findUnique({
    where: { id: id },
    include: {
      status: true,
    },
  });
  return userStatus;
};