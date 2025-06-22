"use client";


import { Sword, Shield, Heart, Star, Coins, Lock } from "lucide-react";
import Image from "next/image";

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

interface AvatarCardProps {
  character: {
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
  playerLevel: number;
  playerCoins: number;
  isProcessing: boolean;
  onEquip: (dbId: string) => void;
  onUnlock: (avatarId: string) => void;
}

export default function AvatarCard({
  character,
  playerLevel,
  playerCoins,
  isProcessing,
  onEquip,
  onUnlock,
}: AvatarCardProps) {
  const colors = typeColors[character.type as keyof typeof typeColors];
  const canUnlock =
    playerLevel >= character.unlockLevel && playerCoins >= character.price;

  return (
    <div
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
              <p>Your Level: {playerLevel}</p>
              <p>Your Coins: {playerCoins}</p>
              <p>Can Unlock: {canUnlock ? "Yes" : "No"}</p>
            </div>
          </div>
          {canUnlock && (
            <button
              onClick={() => onUnlock(character.id)}
              disabled={isProcessing}
              className="px-6 py-3 border-4 font-bold pixel-text text-lg"
              style={{
                backgroundColor: "#22c55e",
                borderColor: "#16a34a",
                color: "white",
                boxShadow: "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)",
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
            {Object.entries(character.statBonus).map(([stat, value]) => (
              <div key={stat} className="flex items-center justify-between">
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
            ))}
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
              onClick={() => character.dbId && onEquip(character.dbId)}
              disabled={isProcessing}
              className="w-full p-4 border-4 font-bold pixel-text text-lg"
              style={{
                backgroundColor: character.equipped ? "#10b981" : "#3b82f6",
                borderColor: character.equipped ? "#059669" : "#2563eb",
                color: "white",
                boxShadow: character.equipped
                  ? "4px 4px 0px #047857, 8px 8px 0px rgba(0,0,0,0.4)"
                  : "4px 4px 0px #1d4ed8, 8px 8px 0px rgba(0,0,0,0.4)",
              }}>
              {character.equipped ? "選択中" : "選択する"}
            </button>
          ) : (
            <button
              onClick={() => onUnlock(character.id)}
              disabled={!canUnlock || isProcessing}
              className="w-full p-4 border-4 font-bold pixel-text text-lg"
              style={{
                backgroundColor: canUnlock ? "#22c55e" : "#6b7280",
                borderColor: canUnlock ? "#16a34a" : "#4b5563",
                color: "white",
                boxShadow: canUnlock
                  ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                  : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                cursor: canUnlock && !isProcessing ? "pointer" : "not-allowed",
              }}>
              解放する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
