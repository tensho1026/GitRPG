"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { getUserCurrentItems } from "@/actions/item/getUserCurrentitems";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { Items } from "@/generated/prisma";

export function useItemData() {
  const { data: session, status } = useSession();
  const [userItems, setUserItems] = useState<Items[]>([]);
  const [battleStatus, setBattleStatus] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
  });
  const [coins, setCoins] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState("all");

  const fetchData = useCallback(async () => {
    if (status === "authenticated" && session?.user?.email) {
      try {
        const [items, battleStats, currentCoins] = await Promise.all([
          getUserCurrentItems(session.user.email),
          getCurrentUserBattleStatus(session.user.email),
          getCurrentCoin(session.user.email),
        ]);

        if (items) {
          setUserItems(items);
        }
        if (battleStats) {
          setBattleStatus(battleStats);
        }
        if (currentCoins) {
          setCoins(currentCoins);
        }
      } catch (error) {
        console.error("Failed to fetch user items:", error);
      }
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
  };
}
