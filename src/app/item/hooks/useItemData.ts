"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getUserItems } from "@/actions/item/getUserItems";
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
  const requestIdRef = useRef(0);
  const userEmail = session?.user?.email ?? null;

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (status === "authenticated" && userEmail) {
      try {
        setIsLoading(true);

        const [items, battleStats] = await Promise.all([
          getUserItems(userEmail),
          getCurrentUserBattleStatus(userEmail),
        ]);

        if (requestId !== requestIdRef.current) return;

        setUserItems(items || []);
        setBattleStatus(battleStats);
        setCoins(battleStats.coin ?? 0);
      } catch (error) {
        console.error("❌ [useItemData] Failed to fetch user items:", error);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    } else if (status === "unauthenticated") {
      setUserItems([]);
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
      setCoins(0);
      setIsLoading(false);
    }
  }, [status, userEmail]);

  useEffect(() => {
    void fetchData();
    return () => {
      requestIdRef.current += 1;
    };
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
