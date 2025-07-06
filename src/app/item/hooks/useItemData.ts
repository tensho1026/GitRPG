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

  const fetchData = useCallback(async () => {
    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      try {
        setIsLoading(true);
        // @ts-ignore - NextAuth v4 user property compatibility
        const userEmail = session.user.email;

        const [items, battleStats, currentCoins] = await Promise.all([
          getUserItems(userEmail),
          getCurrentUserBattleStatus(userEmail),
          getCurrentCoin(userEmail),
        ]);

        if (items) {
          setUserItems(items);
        }

        if (battleStats) {
          setBattleStatus(battleStats);
        }

        if (currentCoins !== null && currentCoins !== undefined) {
          setCoins(currentCoins);
        }
      } catch (error) {
        console.error("❌ [useItemData] Failed to fetch user items:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
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
