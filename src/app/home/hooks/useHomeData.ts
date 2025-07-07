import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { UserWithStatus, Item, Avatar } from "@/types/user/userStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getHomeData } from "@/actions/user/getHomeData";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { updateCommits } from "@/actions/github/updateCommits";

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

          // 1. Fetch current home data (includes commit count & signup date)
          // @ts-ignore - NextAuth v4 user property compatibility
          const initialHomeData = await getHomeData(session.user.email);

          // Guard in case user data not found
          if (!initialHomeData) {
            throw new Error("Home data not found");
          }

          // 2. Fetch GitHub contributions only if accessToken is available
          let githubCommitCount = initialHomeData.status?.commit ?? 0;

          if (
            // @ts-ignore - NextAuth v4 accessToken property compatibility
            session.accessToken &&
            initialHomeData.user?.createdAt
          ) {
            try {
              const contributions = await fetchTotalContributions(
                // @ts-ignore - NextAuth v4 accessToken property compatibility
                session.accessToken,
                initialHomeData.user.createdAt
              );
              githubCommitCount = contributions.commits;

              // 3. Update DB only if commit count changed
              if (githubCommitCount !== initialHomeData.status?.commit) {
                // @ts-ignore - NextAuth v4 user property compatibility
                await updateCommits(session.user.email, githubCommitCount);

                // Re-fetch home data after update
                // @ts-ignore - NextAuth v4 user property compatibility
                const refreshedData = await getHomeData(session.user.email);
                if (refreshedData) {
                  initialHomeData.status = refreshedData.status;
                  initialHomeData.battleStatus = refreshedData.battleStatus;
                  initialHomeData.userWithStatus = refreshedData.userWithStatus;
                  initialHomeData.items = refreshedData.items;
                  initialHomeData.equippedAvatar = refreshedData.equippedAvatar;
                }
              }
            } catch (error) {
              console.error("Failed to sync commits:", error);
            }
          }

          const homeData = initialHomeData;

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
