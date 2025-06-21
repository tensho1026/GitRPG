import { useMemo } from "react";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { UserWithStatus } from "@/types/user/userStatus";

export const useUserStats = (userStatus: UserWithStatus | null) => {
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
    };
  }, [userStatus]);
};
