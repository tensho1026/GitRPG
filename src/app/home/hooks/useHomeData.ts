import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { UserWithStatus, Item, Avatar } from "@/types/user/userStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getHomeData } from "@/actions/user/getHomeData";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expInfo, setExpInfo] = useState({});
  const [battleStatus, setBattleStatus] = useState<any>(null);
  const [equippedAvatar, setEquippedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // @ts-ignore - NextAuth v4 user property compatibility
      if (status === "authenticated" && session?.user?.email) {
        try {
          setIsLoading(true);

          // Use the consolidated getHomeData function
          // @ts-ignore - NextAuth v4 user property compatibility
          const homeData = await getHomeData(session.user.email);

          if (homeData) {
            // Set user status data
            setUserStatus(homeData.userWithStatus);

            // Set user items
            setUserItems(homeData.items);

            // Set battle status
            setBattleStatus(homeData.battleStatus);

            // Set equipped avatar
            setEquippedAvatar(homeData.equippedAvatar);

            // Calculate EXP info
            const totalCommits = homeData.status?.commit ?? 0;
            const expData = getRemainingCommitsToNextLevel(totalCommits);
            setExpInfo(expData);
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

  return {
    userStatus,
    userItems,
    isLoading,
    expInfo,
    battleStatus,
    equippedAvatar,
  };
};
