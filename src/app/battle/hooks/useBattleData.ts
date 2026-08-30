"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
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
  const requestIdRef = useRef(0);
  const userEmail = session?.user?.email ?? null;

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;
    const fetchUserData = async () => {
      if (status === "loading") {
        setIsLoading(true);
        return;
      }

      if (status === "authenticated" && userEmail) {
        setIsLoading(true);
        try {
          const battleStats = await getCurrentUserBattleStatus(userEmail);

          if (cancelled || requestId !== requestIdRef.current) return;

          if (battleStats) {
            setBattleStatus(battleStats);
            setUserLevel(battleStats.level ?? 1);
          }
        } catch (error) {
          console.error("❌ [useBattleData] Failed to fetch user data:", error);
        } finally {
          if (!cancelled && requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      } else {
        if (cancelled || requestId !== requestIdRef.current) return;
        setBattleStatus({
          userId: "",
          level: 1,
          baseStats: { hp: 0, attack: 0, defense: 0 },
          totalStats: { hp: 0, attack: 0, defense: 0 },
          equippedItems: [],
          equippedAvatar: null,
          coin: 0,
          commit: 0,
        });
        setUserLevel(1);
        setIsLoading(false);
      }
    };

    void fetchUserData();
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [status, userEmail]);

  return {
    battleStatus,
    userLevel,
    isLoading,
  };
}
