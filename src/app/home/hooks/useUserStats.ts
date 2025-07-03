import { useMemo } from "react";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { UserWithStatus, Item } from "@/types/user/userStatus";

export const useUserStats = (
  userStatus: UserWithStatus | null,
  userItems: Item[] = []
) => {
  return useMemo(() => {
    const totalCommits = userStatus?.status?.commit ?? 0;
    const { remainingCommits, percentage } =
      getRemainingCommitsToNextLevel(totalCommits);

    return {
      currentLevel: userStatus?.status?.level ?? 1,
      totalCommits,
      remainingCommits,
      progressPercentage: percentage,
      coins: userStatus?.status?.coin ?? 0,
      items: userItems,
    };
  }, [userStatus, userItems]);
};
