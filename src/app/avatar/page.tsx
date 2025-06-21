"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  User,
  Sword,
  Shield,
  Heart,
  Crown,
  Star,
  Coins,
  Lock,
} from "lucide-react";
import Image from "next/image";
import {
  unlockAvatar,
  autoUnlockAvatars,
} from "@/actions/user/avatar/unlockAvatar";
import { getUserAvatars } from "@/actions/user/avatar/getUserAvatars";
import { equipAvatar } from "@/actions/user/avatar/equipAvatar";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { avatarCharacters } from "@/data/avatar";
import type { Avatar as UserAvatar } from "@/generated/prisma";

const typeColors = {
  warrior: { bg: "#dc2626", border: "#fbbf24", shadow: "#991b1b" },
  guardian: { bg: "#2563eb", border: "#60a5fa", shadow: "#1d4ed8" },
  mage: { bg: "#7c3aed", border: "#a78bfa", shadow: "#5b21b6" },
};

const statIcons = {
  hp: <Heart className="w-5 h-5 text-green-400" />,
  attack: <Sword className="w-5 h-5 text-red-400" />,
  defense: <Shield className="w-5 h-5 text-blue-400" />,
};

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

export default function AvatarSelection() {
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
        console.log("🔄 Starting avatar data fetch...");
        console.log("User email:", session.user.email);

        // First, try to auto-unlock any avatars that the user is now eligible for
        console.log("🔓 Attempting auto-unlock...");
        const autoUnlockResult = await autoUnlockAvatars(session.user.email);
        console.log("Auto-unlock result:", autoUnlockResult);

        // If new avatars were unlocked, show a notification
        if (autoUnlockResult.newlyUnlockedAvatars.length > 0) {
          const unlockedNames = autoUnlockResult.newlyUnlockedAvatars
            .map(
              (id) => avatarCharacters.find((avatar) => avatar.id === id)?.name
            )
            .filter(Boolean)
            .join(", ");

          console.log("🎉 Showing unlock notification for:", unlockedNames);
          alert(
            `🎉 新しいアバターが解放されました！\n${unlockedNames}\n\nコスト: ${autoUnlockResult.totalCost}コイン`
          );
        } else {
          console.log("ℹ️ No new avatars were unlocked");
        }

        // Fetch user avatars and coins
        const [avatars, currentCoins] = await Promise.all([
          getUserAvatars(session.user.email),
          getCurrentCoin(session.user.email),
        ]);

        setUserAvatars(avatars || []);
        setCoins(currentCoins || 0);

        // Use the updated user data from autoUnlockAvatars
        console.log("📊 Using updated user data from auto-unlock result");
        const userData = autoUnlockResult.userData;
        console.log("User data received:", userData);

        setPlayerData({
          level: userData.level,
          coins: userData.coin,
          selectedAvatar: userData.selectedAvatar,
          unlockedAvatars: userData.unlockedAvatars,
        });

        console.log("✅ Player data updated:", {
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

  return (
    <div
      className="min-h-screen p-4 font-mono"
      style={{
        backgroundImage: "url(/newavatar.JPG)",
        zIndex: -1,
      }}>
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <p className="text-white text-3xl font-bold pixel-text animate-pulse">
            ... PROCESSING ...
          </p>
        </div>
      )}
      <style jsx>{`
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }
        .pixel-text {
          font-family: "Courier New", monospace;
          font-weight: bold;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#7c3aed",
              borderColor: "#fbbf24",
              boxShadow: "6px 6px 0px #5b21b6, 12px 12px 0px rgba(0,0,0,0.6)",
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => (window.location.href = "/home")}
                  className="p-3 border-3 bg-purple-600 border-purple-400 text-white pixel-border hover:bg-purple-500"
                  style={{ boxShadow: "3px 3px 0px #4c1d95" }}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
                  <Crown className="w-10 h-10" />
                  アバター選択
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 border-3 text-purple-900 font-bold"
                  style={{
                    backgroundColor: "#fbbf24",
                    borderColor: "#f59e0b",
                    boxShadow: "3px 3px 0px #d97706",
                  }}>
                  <User className="w-5 h-5" />
                  <span className="pixel-text">Lv.{playerData.level}</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
                  style={{
                    backgroundColor: "#fbbf24",
                    borderColor: "#f59e0b",
                    boxShadow: "3px 3px 0px #d97706",
                  }}>
                  <Coins className="w-5 h-5" />
                  <span className="pixel-text">{coins.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {displayAvatars.map((character) => {
            const colors =
              typeColors[character.type as keyof typeof typeColors];
            const canUnlock =
              playerData.level >= character.unlockLevel &&
              coins >= character.price;

            // Debug logging
            console.log(`🔍 Avatar: ${character.name}`);
            console.log(`  - User level: ${playerData.level}`);
            console.log(`  - Required level: ${character.unlockLevel}`);
            console.log(`  - User coins: ${coins}`);
            console.log(`  - Required coins: ${character.price}`);
            console.log(
              `  - Level requirement met: ${
                playerData.level >= character.unlockLevel
              }`
            );
            console.log(
              `  - Coin requirement met: ${coins >= character.price}`
            );
            console.log(`  - Can unlock: ${canUnlock}`);
            console.log(`  - Already owned: ${character.owned}`);

            return (
              <div
                key={character.id}
                className="relative pixel-border flex flex-col cursor-pointer transform transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "#1f2937",
                  borderWidth: "6px",
                  borderColor: character.owned ? "#10b981" : "#6b7280",
                  boxShadow: character.owned
                    ? "6px 6px 0px #059669, 12px 12px 0px rgba(0,0,0,0.5)"
                    : "4px 4px 0px #374151, 8px 8px 0px rgba(0,0,0,0.4)",
                  opacity: !character.owned ? 0.8 : 1,
                }}>
                {/* Selection Indicator */}
                {character.equipped && (
                  <div
                    className="absolute -top-4 -right-4 w-12 h-12 border-4 border-white flex items-center justify-center pixel-border z-10"
                    style={{
                      backgroundColor: colors.bg,
                      boxShadow: `4px 4px 0px ${colors.shadow}`,
                    }}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Lock Overlay */}
                {!character.owned && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
                    <div className="text-center mb-4">
                      <div
                        className="w-20 h-20 mx-auto mb-4 border-4 border-red-400 bg-red-600 flex items-center justify-center pixel-border"
                        style={{ boxShadow: "4px 4px 0px #dc2626" }}>
                        <Lock className="w-12 h-12 text-white" />
                      </div>
                      <span className="text-red-400 font-bold pixel-text text-xl">
                        LOCKED
                      </span>
                      <p className="text-red-300 pixel-text text-sm mt-2">
                        Lv.{character.unlockLevel} で解放
                      </p>
                      {/* Debug info display */}
                      <div className="text-xs text-gray-400 mt-2">
                        <p>Your Level: {playerData.level}</p>
                        <p>Your Coins: {coins}</p>
                        <p>Can Unlock: {canUnlock ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    {canUnlock && (
                      <button
                        onClick={() => handleUnlockAvatar(character.id)}
                        disabled={isProcessing}
                        className="px-6 py-3 border-4 font-bold pixel-text text-lg"
                        style={{
                          backgroundColor: "#22c55e",
                          borderColor: "#16a34a",
                          color: "white",
                          boxShadow:
                            "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)",
                        }}>
                        解放する
                      </button>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 flex flex-col h-full">
                  {/* Character Image */}
                  <div className="mb-6 flex justify-center">
                    <div
                      className="border-4 p-4 pixel-border"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        boxShadow: `4px 4px 0px ${colors.shadow}, 8px 8px 0px rgba(0,0,0,0.3)`,
                      }}>
                      <Image
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        className="pixel-border"
                        style={{
                          imageRendering: "pixelated",
                          borderWidth: "2px",
                          borderColor: "#ffffff",
                        }}
                        width={120}
                        height={120}
                      />
                    </div>
                  </div>

                  {/* Character Info */}
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold text-white pixel-text mb-3">
                      {character.name}
                    </h3>
                    <p className="text-white text-opacity-90 text-sm pixel-text leading-relaxed">
                      {character.description}
                    </p>
                  </div>

                  {/* Level Up Bonus */}
                  <div className="mb-6">
                    <div className="space-y-3">
                      {Object.entries(character.statBonus).map(
                        ([stat, value]) => (
                          <div
                            key={stat}
                            className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-200 text-sm pixel-text">
                              {statIcons[stat as keyof typeof statIcons]}
                              <span>
                                {stat === "hp"
                                  ? "HP"
                                  : stat === "attack"
                                  ? "攻撃力"
                                  : "防御力"}
                              </span>
                            </div>
                            <span className="text-green-300 font-bold text-lg pixel-text">
                              +{value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div
                    className="border-t-3 pt-4 mt-auto"
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                    {character.price > 0 && !character.owned && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Coins className="w-6 h-6 text-yellow-300" />
                        <span className="font-bold text-white text-xl pixel-text">
                          {character.price.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {character.owned ? (
                      <button
                        onClick={() =>
                          character.dbId && handleEquip(character.dbId)
                        }
                        disabled={isProcessing}
                        className="w-full p-4 border-4 font-bold pixel-text text-lg"
                        style={{
                          backgroundColor: character.equipped
                            ? "#10b981"
                            : "#3b82f6",
                          borderColor: character.equipped
                            ? "#059669"
                            : "#2563eb",
                          color: "white",
                          boxShadow: character.equipped
                            ? "4px 4px 0px #047857, 8px 8px 0px rgba(0,0,0,0.4)"
                            : "4px 4px 0px #1d4ed8, 8px 8px 0px rgba(0,0,0,0.4)",
                        }}>
                        {character.equipped ? "選択中" : "選択する"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockAvatar(character.id)}
                        disabled={!canUnlock || isProcessing}
                        className="w-full p-4 border-4 font-bold pixel-text text-lg"
                        style={{
                          backgroundColor: canUnlock ? "#22c55e" : "#6b7280",
                          borderColor: canUnlock ? "#16a34a" : "#4b5563",
                          color: "white",
                          boxShadow: canUnlock
                            ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                            : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                          cursor:
                            canUnlock && !isProcessing
                              ? "pointer"
                              : "not-allowed",
                        }}>
                        解放する
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
