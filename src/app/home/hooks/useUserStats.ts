import { useMemo } from "react";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { UserWithStatus, HomeItem } from "@/types/user/userStatus";

export const useUserStats = (
  userStatus: UserWithStatus | null,
  userItems: HomeItem[] = []
) => {
  return useMemo(() => {
    const totalCommits = userStatus?.status?.commit ?? 0;
    const { remainingCommits, percentage } =
      getRemainingCommitsToNextLevel(totalCommits);

    return {
      remainingCommits,
      progressPercentage: percentage,
      items: userItems,
    };
  }, [userStatus, userItems]);
};
