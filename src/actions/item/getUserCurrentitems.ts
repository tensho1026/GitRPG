"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { getUserCurrentItemsById } from "@/lib/userItems";

export const getUserCurrentItems = async (userId: string) => {
  await assertAuthenticatedUser(userId);
  return getUserCurrentItemsById(userId);
};
