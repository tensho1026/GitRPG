import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { UserWithStatus, Item, Avatar } from "@/types/user/userStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getHomeData } from "@/actions/user/getHomeData";
import { updateCommits } from "@/actions/github/updateCommits";
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expInfo, setExpInfo] = useState({});
  const [battleStatus, setBattleStatus] = useState<any>(null);
  const [equippedAvatar, setEquippedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      const user = session?.user;
      const userEmail = user?.email;
      if (status !== "authenticated" || !user || !userEmail) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);

        await saveUserToDatabase({
          id: userEmail,
          name: user.name || userEmail,
          image: user.image || "",
        });

        if (cancelled) return;

        let homeData = await getHomeData(userEmail);
        if (!homeData) {
          throw new Error("Home data not found");
        }

        // The server action obtains both the session token and the commit count
        // from trusted server-side sources. The browser never submits a count.
        try {
          await updateCommits();
          if (!cancelled) {
            const refreshedData = await getHomeData(userEmail);
            if (refreshedData) {
              homeData = refreshedData;
            }
          }
        } catch (error) {
          // The app remains usable when GitHub is temporarily unavailable.
          console.error("Failed to sync commits:", error);
        }

        if (cancelled) return;

        setUserStatus(homeData.userWithStatus);
        setUserItems(homeData.items);
        setBattleStatus(homeData.battleStatus);
        setEquippedAvatar(homeData.equippedAvatar);

        const totalCommits = homeData.status?.commit ?? 0;
        setExpInfo(getRemainingCommitsToNextLevel(totalCommits));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch user data on home screen:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchUserData();
    return () => {
      cancelled = true;
    };
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
