"use server";

import { prisma } from "../../../../prisma/prisma";

export const getUserStatus = async (id: string) => {
  const userStatus = await prisma.users.findUnique({
    where: { id: id },
    include: {
      status: true,
      items: {
        where: {
          equipped: true,
        },
        select: {
          id: true,
          name: true,
          image: true,
          type: true,
          equipped: true,
        },
      },
    },
  });
  return userStatus;
};
