import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { UserWithStatus, HomeItem, HomeAvatar } from "@/types/user/userStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getHomeData } from "@/actions/user/getHomeData";
import { updateCommits } from "@/actions/github/updateCommits";
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<HomeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [expInfo, setExpInfo] = useState({});
  const [battleStatus, setBattleStatus] = useState<any>(null);
  const [equippedAvatar, setEquippedAvatar] = useState<HomeAvatar | null>(null);
  const userEmail = session?.user?.email ?? null;
  const userName = session?.user?.name ?? null;
  const userImage = session?.user?.image ?? null;

  const loadHomeData = async () => {
    if (!userEmail) return;
    const homeData = await getHomeData(userEmail);
    if (!homeData) throw new Error("Home data not found");

    setUserStatus(homeData.userWithStatus);
    setUserItems(homeData.items);
    setBattleStatus(homeData.battleStatus);
    setEquippedAvatar(homeData.equippedAvatar);
    setSyncError(
      homeData.status?.syncStatus === "error"
        ? homeData.status.syncError || "GitHub同期に失敗しました"
        : null
    );
    const totalCommits = homeData.status?.commit ?? 0;
    setExpInfo(getRemainingCommitsToNextLevel(totalCommits));
  };

  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      if (status !== "authenticated" || !userEmail) {
        if (!cancelled) {
          setUserStatus(null);
          setUserItems([]);
          setBattleStatus(null);
          setEquippedAvatar(null);
          setError(null);
          setSyncError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await saveUserToDatabase({
          id: userEmail,
          name: userName || userEmail,
          image: userImage || "",
        });

        if (cancelled) return;

        // The server action obtains both the session token and the commit count
        // from trusted server-side sources. The browser never submits a count.
        try {
          await updateCommits();
        } catch (error) {
          // The app remains usable when GitHub is temporarily unavailable.
          console.error("Failed to sync commits:", error);
        }

        if (cancelled) return;

        await loadHomeData();
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "ホームデータを取得できませんでした"
          );
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
  }, [status, userEmail, userName, userImage]);

  const retrySync = async () => {
    if (!userEmail) return;
    setSyncError(null);
    try {
      await updateCommits({ force: true });
      await loadHomeData();
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "GitHub同期に失敗しました"
      );
      try {
        await loadHomeData();
      } catch {
        // Keep the existing dashboard visible until the regular retry works.
      }
    }
  };

  const retry = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      await loadHomeData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ホームデータを取得できませんでした"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userStatus,
    userItems,
    isLoading,
    expInfo,
    battleStatus,
    equippedAvatar,
    retrySync,
    retry,
    error,
    syncError,
  };
};
