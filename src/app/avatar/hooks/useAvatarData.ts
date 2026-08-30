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
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";
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

  // Keep the one-time initialization scoped to the signed-in account, not the
  // lifetime of this component. The session can change without a remount.
  const autoUnlockUserRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const userEmail = session?.user?.email ?? null;

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    // Wait for session to load
    if (status === "loading") {
      return;
    }

    if (status === "authenticated" && userEmail) {
      setIsLoading(true);
      try {
        // Ensure legacy/directly-created accounts have their default avatar.
        if (autoUnlockUserRef.current !== userEmail) {
          await saveUserToDatabase({
            id: userEmail,
            name: session?.user?.name || userEmail,
            image: session?.user?.image || "",
          });
          await autoUnlockAvatars(userEmail);
          autoUnlockUserRef.current = userEmail;
        }

        const [userStatus, avatars, currentCoins] = await Promise.all([
          getUserStatus(userEmail),
          getUserAvatars(userEmail),
          getCurrentCoin(userEmail),
        ]);

        if (requestId !== requestIdRef.current) return;

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

        if (requestId === requestIdRef.current) {
          // Set fallback values on error
          setCoins(0);
          setPlayerData({
            level: 1,
            coins: 0,
            selectedAvatar: "warrior",
            unlockedAvatars: ["warrior"],
          });
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    } else if (status === "unauthenticated") {
      setUserAvatars([]);
      setCoins(0);
      setPlayerData({
        level: 1,
        coins: 0,
        selectedAvatar: "warrior",
        unlockedAvatars: ["warrior"],
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [status, userEmail, session?.user?.name, session?.user?.image]);

  // Prevent duplicate initial fetches while still refetching after an account
  // switch in the same mounted application.
  const fetchedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userEmail) {
      if (fetchedUserRef.current !== userEmail) {
        fetchedUserRef.current = userEmail;
        void fetchData();
      }
    } else if (status === "unauthenticated") {
      fetchedUserRef.current = null;
      autoUnlockUserRef.current = null;
    }
    return () => {
      requestIdRef.current += 1;
    };
  }, [status, userEmail, fetchData]);

  const handleEquip = async (dbId: string) => {
    // Avoid duplicate requests while processing
    if (isProcessing) return;

    if (!userEmail) return;

    // If this avatar is already equipped, do nothing
    const currentEquipped = userAvatars.find(
      (avatar) => avatar.id === dbId && avatar.equipped
    );
    if (currentEquipped) return;

    setIsProcessing(true);
    try {
      await equipAvatar(userEmail, dbId);
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

    if (!userEmail) return;

    // If already owned, skip
    const alreadyOwned = userAvatars.some(
      (avatar) =>
        avatar.name === avatarCharacters.find((c) => c.id === avatarId)?.name
    );
    if (alreadyOwned) return;

    setIsProcessing(true);
    try {
      await unlockAvatar(userEmail, avatarId);
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
