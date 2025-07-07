"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  unlockAvatar,
  autoUnlockAvatars,
} from "@/actions/user/avatar/unlockAvatar";
import { getUserAvatars } from "@/actions/user/avatar/getUserAvatars";
import { equipAvatar } from "@/actions/user/avatar/equipAvatar";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { avatarCharacters } from "@/data/avatar";
import type { Avatar as UserAvatar } from "@/types/user/userStatus";

interface PlayerAvatarData {
  level: number;
  coins: number;
  selectedAvatar: string;
  unlockedAvatars: string[];
}

type DisplayAvatar = {
  id: string;
  name: string;
  type: string;
  image: string;
  description: string;
  unlockLevel: number;
  price: number;
  statBonus: { hp: number; attack: number; defense: number };
  owned: boolean;
  equipped: boolean;
  dbId?: string;
};

export function useAvatarData() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerAvatarData>({
    level: 0,
    coins: 0,
    selectedAvatar: "warrior",
    unlockedAvatars: ["warrior"],
  });
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [coins, setCoins] = useState<number>(0);

  // Ref to ensure autoUnlock runs only once per session mount
  const autoUnlockCalledRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      setIsLoading(true);
      try {
        // @ts-ignore - NextAuth v4 user property compatibility
        const userEmail = session.user.email;

        /*
         * Fire all requests in parallel for better performance
         * - autoUnlockAvatars: unlocks if eligible, result not needed immediately
         * - getUserStatus, getUserAvatars, getCurrentCoin: required for UI
         */

        // Run autoUnlock just once
        if (!autoUnlockCalledRef.current) {
          try {
            await autoUnlockAvatars(userEmail);
          } finally {
            autoUnlockCalledRef.current = true;
          }
        }

        const [userStatus, avatars, currentCoins] = await Promise.all([
          getUserStatus(userEmail),
          getUserAvatars(userEmail),
          getCurrentCoin(userEmail),
        ]);

        setUserAvatars(avatars || []);

        // Use getCurrentCoin result as the primary source (same as item page)
        const finalCoins = currentCoins || 0;
        setCoins(finalCoins);

        // Use fresh database data for player data
        if (userStatus?.status) {
          const playerDataFromDB = {
            level: userStatus.status.level || 1,
            coins: userStatus.status.coin || finalCoins, // Use coin from userStatus, fallback to getCurrentCoin
            selectedAvatar: userStatus.status.selectedAvatar || "warrior",
            unlockedAvatars: userStatus.status.unlockedAvatars || ["warrior"],
          };

          setPlayerData(playerDataFromDB);
        } else {
          // Fallback to basic data if userStatus is not available
          setPlayerData({
            level: 1,
            coins: finalCoins,
            selectedAvatar: "warrior",
            unlockedAvatars: ["warrior"],
          });
        }
      } catch (error) {
        console.error("❌ [useAvatarData] Error occurred:", error);
        console.error(
          "❌ [useAvatarData] Error stack:",
          (error as Error).stack
        );

        // Set fallback values on error
        setCoins(0);
        setPlayerData({
          level: 1,
          coins: 0,
          selectedAvatar: "warrior",
          unlockedAvatars: ["warrior"],
        });
      } finally {
        setIsLoading(false);
      }
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [status, session]);

  // Prevent multiple initial fetches when status/session change repeatedly
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [status, fetchData]);

  const handleEquip = async (dbId: string) => {
    // Avoid duplicate requests while processing
    if (isProcessing) return;

    // @ts-ignore - NextAuth v4 user property compatibility
    if (!session?.user?.email) return;

    // If this avatar is already equipped, do nothing
    const currentEquipped = userAvatars.find(
      (avatar) => avatar.id === dbId && avatar.equipped
    );
    if (currentEquipped) return;

    setIsProcessing(true);
    try {
      // @ts-ignore - NextAuth v4 user property compatibility
      await equipAvatar(session.user.email, dbId);
      await fetchData(); // Refresh data after equipping
    } catch (error) {
      console.error("Equip failed:", error);
      alert((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockAvatar = async (avatarId: string) => {
    if (isProcessing) return; // prevent duplicate clicks

    // @ts-ignore - NextAuth v4 user property compatibility
    if (!session?.user?.email) return;

    // If already owned, skip
    const alreadyOwned = userAvatars.some(
      (avatar) =>
        avatar.name === avatarCharacters.find((c) => c.id === avatarId)?.name
    );
    if (alreadyOwned) return;

    setIsProcessing(true);
    try {
      // @ts-ignore - NextAuth v4 user property compatibility
      await unlockAvatar(session.user.email, avatarId);
      await fetchData(); // Refresh
    } catch (error) {
      console.error("Unlock failed:", error);
      alert((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create display avatars with ownership and equipment status
  const displayAvatars: DisplayAvatar[] = avatarCharacters.map((character) => {
    const userAvatar = userAvatars.find(
      (avatar) => avatar.name === character.name
    );
    return {
      ...character,
      owned: !!userAvatar,
      equipped: userAvatar?.equipped || false,
      dbId: userAvatar?.id,
    };
  });

  return {
    playerData,
    coins,
    isLoading,
    isProcessing,
    displayAvatars,
    handleEquip,
    handleUnlockAvatar,
  };
}
