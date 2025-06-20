"use server";

import { prisma } from "../../../prisma/prisma";
import { equipmentData } from "@/data/equipment";
import { revalidatePath } from "next/cache";

export const purchaseItem = async (email: string, itemId: string) => {
  if (!email) {
    throw new Error("User not authenticated");
  }

  const itemToPurchase = equipmentData.find((item) => item.id === itemId);

  if (!itemToPurchase) {
    throw new Error("Item not found");
  }

  const user = await prisma.users.findUnique({
    where: { id: email },
    include: { status: true, items: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userOwnsItem = user.items.some((item) => item.equipmentId === itemId);

  if (userOwnsItem) {
    throw new Error("Item already owned");
  }

  if ((user.status?.coin ?? 0) < itemToPurchase.price) {
    throw new Error("Not enough coins");
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (user.status) {
        await tx.userStatus.update({
          where: { userId: email },
          data: {
            coin: {
              decrement: itemToPurchase.price,
            },
          },
        });
      } else {
        throw new Error("User status not found");
      }

      await tx.items.create({
        data: {
          userId: email,
          equipmentId: itemToPurchase.id,
          name: itemToPurchase.name,
          image: itemToPurchase.image,
          description: itemToPurchase.description,
          type: itemToPurchase.type,
          attack: itemToPurchase.attack,
          defense: itemToPurchase.defense,
          price: itemToPurchase.price,
          equipped: false,
        },
      });
    });

    revalidatePath("/item");
  } catch (error) {
    console.error("Purchase failed:", error);
    throw new Error("Failed to purchase item.");
  }
};
