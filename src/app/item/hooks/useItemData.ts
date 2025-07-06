"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getUserItems } from "@/actions/item/getUserItems";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import type { Item, BattleStatus } from "@/types/user/userStatus";

export function useItemData() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [userItems, setUserItems] = useState<Item[]>([]);
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
  const [coins, setCoins] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState("all");

  // Debug session information (for comparison with avatar page)
  console.log("🔍 [useItemData] Session debug:", {
    status,
    session,
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    sessionKeys: session ? Object.keys(session) : null,
    userKeys: session?.user ? Object.keys(session.user) : null,
  });

  const fetchData = useCallback(async () => {
    console.log(
      "🔍 [useItemData] fetchData called with session status:",
      status
    );

    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      try {
        setIsLoading(true);
        // @ts-ignore - NextAuth v4 user property compatibility
        const userEmail = session.user.email;

        console.log("🔍 [useItemData] Fetching data for user:", userEmail);

        const [items, battleStats, currentCoins] = await Promise.all([
          getUserItems(userEmail),
          getCurrentUserBattleStatus(userEmail),
          getCurrentCoin(userEmail),
        ]);

        console.log("🔍 [useItemData] Raw data received:", {
          items,
          battleStats,
          currentCoins,
        });

        if (items) {
          setUserItems(items);
          console.log("✅ [useItemData] User items set:", items);
        }

        if (battleStats) {
          setBattleStatus(battleStats);
          console.log("✅ [useItemData] Battle status set:", battleStats);
        }

        if (currentCoins !== null && currentCoins !== undefined) {
          setCoins(currentCoins);
          console.log("✅ [useItemData] Coins set:", currentCoins);
        }
      } catch (error) {
        console.error("❌ [useItemData] Failed to fetch user items:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("⚠️ [useItemData] Not authenticated or missing email:", {
        status,
        hasEmail: !!session?.user?.email,
        hasSession: !!session,
      });
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    userItems,
    battleStatus,
    coins,
    selectedTab,
    setSelectedTab,
    fetchData,
    isLoading,
  };
}
