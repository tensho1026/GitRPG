"use server";

import { assertAuthenticatedUser } from "@/lib/authenticatedUser";
import { getUserBattleStatusById } from "@/lib/userBattleStatus";

export const getCurrentUserBattleStatus = async (userId: string) => {
  await assertAuthenticatedUser(userId);
  return getUserBattleStatusById(userId);
};
