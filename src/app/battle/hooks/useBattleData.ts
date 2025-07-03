"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
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
    const fetchData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          setIsLoading(true);
          const [battleStats, userStatus] = await Promise.all([
            getCurrentUserBattleStatus(session.user.email),
            getUserStatus(session.user.email),
          ]);

          if (battleStats) {
            setBattleStatus(battleStats);
          }
          if (userStatus?.status?.level) {
            setUserLevel(userStatus.status.level);
          }
        } catch (error) {
          console.error("Failed to fetch battle data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  return {
    battleStatus,
    userLevel,
    isLoading,
  };
}
