import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getUserItems } from "@/actions/item/getUserItems";
import { UserWithStatus, Item } from "@/types/user/userStatus";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expInfo, setExpInfo] = useState({});
  const [battleStatus, setBattleStatus] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // @ts-ignore - NextAuth v4 user property compatibility
      if (status === "authenticated" && session?.user?.email) {
        try {
          setIsLoading(true);
          const [statusResult, battleStats, itemsResult] = await Promise.all([
            // @ts-ignore - NextAuth v4 user property compatibility
            getUserStatus(session.user.email),
            // @ts-ignore - NextAuth v4 user property compatibility
            getCurrentUserBattleStatus(session.user.email),
            // @ts-ignore - NextAuth v4 user property compatibility
            getUserItems(session.user.email),
          ]);

          if (statusResult) {
            setUserStatus(statusResult);

            // Calculate EXP info
            const totalCommits = statusResult.status?.commit ?? 0;
            const expData = getRemainingCommitsToNextLevel(totalCommits);
            setExpInfo(expData);
          }

          if (battleStats) {
            // @ts-ignore - Type compatibility issue
            setBattleStatus(battleStats);
          }

          if (itemsResult) {
            setUserItems(itemsResult);
          }
        } catch (error) {
          console.error("Failed to fetch user data on home screen:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  return { userStatus, userItems, isLoading, expInfo, battleStatus };
};
