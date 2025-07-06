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
    const fetchUserData = async () => {
      console.log("🔍 [useBattleData] Starting fetch with status:", status);

      if (status === "authenticated" && session?.user?.email) {
        console.log(
          "🔍 [useBattleData] User authenticated, fetching data for:",
          session.user.email
        );

        try {
          const [statusResult, battleStats] = await Promise.all([
            getUserStatus(session.user.email),
            getCurrentUserBattleStatus(session.user.email),
          ]);

          console.log("🔍 [useBattleData] Status result:", statusResult);
          console.log("🔍 [useBattleData] Battle stats:", battleStats);

          if (statusResult) {
            setUserLevel(statusResult.status?.level ?? 1);
          }

          if (battleStats) {
            setBattleStatus(battleStats);
          }

          console.log("✅ [useBattleData] Data fetch completed successfully");
        } catch (error) {
          console.error("❌ [useBattleData] Failed to fetch user data:", error);
        } finally {
          console.log("🔍 [useBattleData] Setting loading to false");
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        console.log("⚠️ [useBattleData] User not authenticated");
        setIsLoading(false);
      } else {
        console.log(
          "⏳ [useBattleData] Still loading authentication status..."
        );
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
