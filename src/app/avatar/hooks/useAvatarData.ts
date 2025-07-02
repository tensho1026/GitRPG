"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  unlockAvatar,
  autoUnlockAvatars,
} from "@/actions/user/avatar/unlockAvatar";
import { getUserAvatars } from "@/actions/user/avatar/getUserAvatars";
import { equipAvatar } from "@/actions/user/avatar/equipAvatar";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
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
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerAvatarData>({
    level: 0,
    coins: 0,
    selectedAvatar: "warrior",
    unlockedAvatars: ["warrior"],
  });
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [coins, setCoins] = useState<number>(0);

  const fetchData = async () => {
    if (session?.user?.email) {
      setIsProcessing(true);
      try {
        // First, try to auto-unlock any avatars that the user is now eligible for
        const autoUnlockResult = await autoUnlockAvatars(session.user.email);

        // Fetch user avatars and coins
        const [avatars, currentCoins] = await Promise.all([
          getUserAvatars(session.user.email),
          getCurrentCoin(session.user.email),
        ]);

        setUserAvatars(avatars || []);
        setCoins(currentCoins || 0);

        // Use the updated user data from autoUnlockAvatars
        const userData = autoUnlockResult.userData;

        setPlayerData({
          level: userData.level,
          coins: userData.coin,
          selectedAvatar: userData.selectedAvatar,
          unlockedAvatars: userData.unlockedAvatars,
        });
      } catch (error) {
        console.error("❌ Failed to fetch avatar data:", error);
        alert((error as Error).message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleEquip = async (dbId: string) => {
    if (!session?.user?.email) return;
    setIsProcessing(true);
    try {
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
    if (!session?.user?.email) return;
    setIsProcessing(true);
    try {
      await unlockAvatar(session.user.email, avatarId);
      await fetchData(); // Refresh data after unlocking
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
    isProcessing,
    displayAvatars,
    handleEquip,
    handleUnlockAvatar,
  };
}
