"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Debug session information
  console.log("🔍 [useAvatarData] Session debug:", {
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
      "🔍 [useAvatarData] fetchData called with session status:",
      status
    );

    // Wait for session to load
    if (status === "loading") {
      console.log("⏳ [useAvatarData] Session is still loading, waiting...");
      return;
    }

    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      setIsLoading(true);
      try {
        // @ts-ignore - NextAuth v4 user property compatibility
        const userEmail = session.user.email;

        console.log("🔍 [useAvatarData] Fetching data for user:", userEmail);

        // First, try to auto-unlock any avatars that the user is now eligible for
        console.log("🔄 [useAvatarData] Calling autoUnlockAvatars...");
        const autoUnlockResult = await autoUnlockAvatars(userEmail);
        console.log(
          "✅ [useAvatarData] autoUnlockAvatars result:",
          autoUnlockResult
        );

        // Get fresh user status data directly from database
        console.log("🔄 [useAvatarData] Calling getUserStatus...");
        const userStatus = await getUserStatus(userEmail);
        console.log("✅ [useAvatarData] getUserStatus result:", userStatus);

        console.log("🔄 [useAvatarData] Calling getUserAvatars...");
        const avatars = await getUserAvatars(userEmail);
        console.log("✅ [useAvatarData] getUserAvatars result:", avatars);

        console.log("🔄 [useAvatarData] Calling getCurrentCoin...");
        const currentCoins = await getCurrentCoin(userEmail);
        console.log("✅ [useAvatarData] getCurrentCoin result:", currentCoins);

        console.log("🔍 [useAvatarData] All data received:", {
          userStatus,
          avatars,
          currentCoins,
          autoUnlockResult,
        });

        setUserAvatars(avatars || []);

        // Use getCurrentCoin result as the primary source (same as item page)
        const finalCoins = currentCoins || 0;
        setCoins(finalCoins);
        console.log("💰 [useAvatarData] Setting coins to:", finalCoins);

        // Use fresh database data for player data
        if (userStatus?.status) {
          const playerDataFromDB = {
            level: userStatus.status.level || 1,
            coins: userStatus.status.coin || finalCoins, // Use coin from userStatus, fallback to getCurrentCoin
            selectedAvatar: userStatus.status.selectedAvatar || "warrior",
            unlockedAvatars: userStatus.status.unlockedAvatars || ["warrior"],
          };

          console.log(
            "📊 [useAvatarData] UserStatus coin value:",
            userStatus.status.coin
          );
          console.log(
            "📊 [useAvatarData] UserStatus level value:",
            userStatus.status.level
          );

          setPlayerData(playerDataFromDB);

          console.log(
            "✅ [useAvatarData] Player data set from database:",
            playerDataFromDB
          );
        } else {
          console.warn(
            "⚠️ [useAvatarData] userStatus or userStatus.status is null/undefined"
          );
          console.log("🔍 [useAvatarData] userStatus object:", userStatus);

          // Fallback to basic data if userStatus is not available
          setPlayerData({
            level: 1,
            coins: finalCoins,
            selectedAvatar: "warrior",
            unlockedAvatars: ["warrior"],
          });
        }

        console.log("✅ [useAvatarData] Final state - Coins:", finalCoins);
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
      console.log("❌ [useAvatarData] User is not authenticated");
      setIsLoading(false);
    } else {
      console.log("⚠️ [useAvatarData] Unexpected status or missing email");
      console.log("🔍 [useAvatarData] Session status:", {
        status,
        session: !!session,
        userEmail: session?.user?.email,
        hasUser: !!session?.user,
      });
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    console.log("🎯 [useAvatarData] useEffect triggered");
    fetchData();
  }, [fetchData]);

  const handleEquip = async (dbId: string) => {
    // @ts-ignore - NextAuth v4 user property compatibility
    if (!session?.user?.email) return;
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
    // @ts-ignore - NextAuth v4 user property compatibility
    if (!session?.user?.email) return;
    setIsProcessing(true);
    try {
      // @ts-ignore - NextAuth v4 user property compatibility
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
    isLoading,
    isProcessing,
    displayAvatars,
    handleEquip,
    handleUnlockAvatar,
  };
}
