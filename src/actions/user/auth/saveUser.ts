"use server";

import { prisma } from "../../../../prisma/prisma";

export const saveUserToDatabase = async (user: {
  email: string;
  name: string | null;
  image: string | null;
}) => {
  await prisma.users.upsert({
    where: { id: user.email },
    create: {
      id: user.email,
      name: user.name ?? "",
      image: user.image ?? "",
    },
    update: {
      name: user.name ?? "",
      image: user.image ?? "",
    },
  });
};
