"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import type { BattleStatus } from "@/types/user/userStatus";

export function useBattleData() {
  const { data: session, status } = useSession();
  const [battleStatus, setBattleStatus] = useState<BattleStatus>({
    userId: "",
    level: 1,
    baseStats: { hp: 0, attack: 0, defense: 0 },
    totalStats: { hp: 0, attack: 0, defense: 0 },
    equippedItems: [],
    equippedAvatar: null,
    coin: 0,
    commit: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const battleStats = await getCurrentUserBattleStatus(
            session.user.email
          );

          if (battleStats) {
            setBattleStatus(battleStats);
            setUserLevel(battleStats.level ?? 1);
          }
        } catch (error) {
          console.error("❌ [useBattleData] Failed to fetch user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  return {
    battleStatus,
    userLevel,
    isLoading,
  };
}
