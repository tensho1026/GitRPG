"use server";

import { prisma } from "../../../prisma/prisma";
import { revalidatePath } from "next/cache";

export const equipItem = async (email: string, itemDbId: string) => {
  if (!email) {
    throw new Error("User not authenticated");
  }

  const itemToEquip = await prisma.items.findUnique({
    where: { id: itemDbId, userId: email },
  });

  if (!itemToEquip) {
    throw new Error("Item not found or does not belong to user");
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Unequip all items of the same type if a new item is being equipped
      if (!itemToEquip.equipped) {
        await tx.items.updateMany({
          where: {
            userId: email,
            type: itemToEquip.type,
            equipped: true,
          },
          data: {
            equipped: false,
          },
        });
      }

      // Toggle equipped state for the selected item
      await tx.items.update({
        where: {
          id: itemDbId,
        },
        data: {
          equipped: !itemToEquip.equipped,
        },
      });
    });

    revalidatePath("/item");
  } catch (error) {
    console.error("Equip failed:", error);
    throw new Error("Failed to equip item.");
  }
};
