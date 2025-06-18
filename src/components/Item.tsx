"use client";

import { useState } from "react";
import {
  Sword,
  Shield,
  Zap,
  Flame,
  Snowflake,
  Leaf,
  Lock,
  Star,
  Coins,
  ShoppingCart,
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "armor" | "accessory";
  rarity: "common" | "rare" | "epic" | "legendary";
  attack?: number;
  defense?: number;
  magic?: number;
  element?: "fire" | "water" | "earth" | "lightning";
  price: number;
  owned: boolean;
  equipped: boolean;
  level: number;
  description: string;
}

const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "魔法の剣",
    type: "weapon",
    rarity: "epic",
    attack: 85,
    magic: 45,
    element: "fire",
    price: 1200,
    owned: true,
    equipped: true,
    level: 5,
    description: "古代の魔法が込められた強力な剣",
  },
  {
    id: "2",
    name: "竜鱗の盾",
    type: "armor",
    rarity: "legendary",
    defense: 120,
    magic: 30,
    element: "fire",
    price: 2500,
    owned: true,
    equipped: false,
    level: 7,
    description: "伝説の竜の鱗で作られた最強の盾",
  },
  {
    id: "3",
    name: "雷神の指輪",
    type: "accessory",
    rarity: "rare",
    attack: 25,
    magic: 60,
    element: "lightning",
    price: 800,
    owned: false,
    equipped: false,
    level: 3,
    description: "雷の力を宿した神秘的な指輪",
  },
  {
    id: "4",
    name: "氷結の杖",
    type: "weapon",
    rarity: "epic",
    attack: 45,
    magic: 95,
    element: "water",
    price: 1800,
    owned: false,
    equipped: false,
    level: 6,
    description: "氷の魔法を極めた者だけが使える杖",
  },
  {
    id: "5",
    name: "森の守護鎧",
    type: "armor",
    rarity: "rare",
    defense: 75,
    magic: 40,
    element: "earth",
    price: 1000,
    owned: true,
    equipped: false,
    level: 4,
    description: "森の精霊に祝福された軽量な鎧",
  },
  {
    id: "6",
    name: "闇の短剣",
    type: "weapon",
    rarity: "legendary",
    attack: 110,
    magic: 20,
    price: 3000,
    owned: false,
    equipped: false,
    level: 8,
    description: "闇の力を操る伝説の暗殺者の武器",
  },
];

const rarityStyles = {
  common: {
    bg: "#6b7280",
    border: "#9ca3af",
    shadow: "#4b5563",
  },
  rare: {
    bg: "#3b82f6",
    border: "#60a5fa",
    shadow: "#1d4ed8",
  },
  epic: {
    bg: "#8b5cf6",
    border: "#a78bfa",
    shadow: "#7c3aed",
  },
  legendary: {
    bg: "#f59e0b",
    border: "#fbbf24",
    shadow: "#d97706",
  },
};

const typeIcons = {
  weapon: <Sword className="w-4 h-4 pixelated" />,
  armor: <Shield className="w-4 h-4 pixelated" />,
  accessory: <Star className="w-4 h-4 pixelated" />,
};

export default function EquipmentShop() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [coins, setCoins] = useState(5000);
  const [equipment, setEquipment] = useState(equipmentData);

  const handlePurchase = (id: string) => {
    const item = equipment.find((eq) => eq.id === id);
    if (item && coins >= item.price) {
      setCoins(coins - item.price);
      setEquipment(
        equipment.map((eq) => (eq.id === id ? { ...eq, owned: true } : eq))
      );
    }
  };

  const handleEquip = (id: string) => {
    const item = equipment.find((eq) => eq.id === id);
    if (item && item.owned) {
      setEquipment(
        equipment.map((eq) => {
          if (eq.type === item.type) {
            return { ...eq, equipped: eq.id === id };
          }
          return eq;
        })
      );
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    if (selectedTab === "all") return true;
    return item.type === selectedTab;
  });

  return (
    <div className="min-h-screen p-4 font-mono pixel-text bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            className="bg-orange-500 border-4 p-6 pixel-border"
            style={{
              borderColor: "#fbbf24",
              borderStyle: "solid",
              borderImage: "none",
              boxShadow: "4px 4px 0px #d97706, 8px 8px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 pixel-text">
                <ShoppingCart className="w-8 h-8 pixelated" />
                装備ショップ
              </h1>
              <div
                className="flex items-center gap-3 bg-yellow-400 px-6 py-3 border-2 text-orange-900 font-bold text-lg"
                style={{
                  borderColor: "#fbbf24",
                  borderStyle: "solid",
                  borderImage: "none",
                  boxShadow: "2px 2px 0px #d97706",
                }}>
                <Coins className="w-6 h-6 pixelated" />
                <span className="pixel-text">{coins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                value: "all",
                label: "すべて",
                color: "#8b5cf6",
                shadow: "#7c3aed",
              },
              {
                value: "weapon",
                label: "武器",
                color: "#ef4444",
                shadow: "#dc2626",
              },
              {
                value: "armor",
                label: "防具",
                color: "#3b82f6",
                shadow: "#1d4ed8",
              },
              {
                value: "accessory",
                label: "アクセサリー",
                color: "#22c55e",
                shadow: "#16a34a",
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className="p-4 border-3 font-bold text-white pixel-text"
                style={{
                  backgroundColor:
                    selectedTab === tab.value ? tab.color : "#4b5563",
                  borderColor:
                    selectedTab === tab.value ? "#ffffff" : "#6b7280",
                  borderStyle: "solid",
                  borderImage: "none",
                  boxShadow:
                    selectedTab === tab.value
                      ? `2px 2px 0px ${tab.shadow}, 4px 4px 0px rgba(0,0,0,0.3)`
                      : "2px 2px 0px #374151",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="relative pixel-border"
              style={{
                backgroundColor: rarityStyles[item.rarity].bg,
                borderColor: rarityStyles[item.rarity].border,
                borderWidth: "4px",
                borderStyle: "solid",
                borderImage: "none",
                boxShadow: `4px 4px 0px ${
                  rarityStyles[item.rarity].shadow
                }, 8px 8px 0px rgba(0,0,0,0.4)`,
                opacity: !item.owned ? 0.7 : 1,
              }}>
              {/* Rarity Banner */}
              <div
                className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white pixel-text"
                style={{
                  backgroundColor: rarityStyles[item.rarity].shadow,
                  borderLeft: `2px solid ${rarityStyles[item.rarity].border}`,
                  borderBottom: `2px solid ${rarityStyles[item.rarity].border}`,
                }}>
                {item.rarity.toUpperCase()}
              </div>

              {/* Lock Overlay */}
              {!item.owned && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10"
                  style={{ backdropFilter: "none" }}>
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-white pixelated mx-auto mb-2" />
                    <span className="text-white font-bold pixel-text">
                      LOCKED
                    </span>
                  </div>
                </div>
              )}

              {/* Equipped Badge - 位置を下に移動 */}
              {item.equipped && (
                <div
                  className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 text-xs font-bold pixel-text border-2"
                  style={{
                    borderColor: "#fbbf24",
                    borderStyle: "solid",
                    borderImage: "none",
                    boxShadow: "2px 2px 0px #d97706",
                  }}>
                  EQUIPPED
                </div>
              )}

              <div className="p-5">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {typeIcons[item.type]}
                    <h3 className="text-lg font-bold text-white pixel-text">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="bg-black bg-opacity-40 text-white px-2 py-1 text-sm font-bold pixel-text border"
                      style={{
                        borderColor: "rgba(255,255,255,0.3)",
                        borderStyle: "solid",
                        borderImage: "none",
                      }}>
                      LV.{item.level}
                    </span>
                    {item.element && (
                      <div
                        className="flex items-center bg-black bg-opacity-40 px-2 py-1 border"
                        style={{
                          borderColor: "rgba(255,255,255,0.3)",
                          borderStyle: "solid",
                          borderImage: "none",
                        }}>
                        {item.element === "fire" && (
                          <Flame className="w-4 h-4 text-red-300 pixelated" />
                        )}
                        {item.element === "water" && (
                          <Snowflake className="w-4 h-4 text-blue-300 pixelated" />
                        )}
                        {item.element === "earth" && (
                          <Leaf className="w-4 h-4 text-green-300 pixelated" />
                        )}
                        {item.element === "lightning" && (
                          <Zap className="w-4 h-4 text-yellow-300 pixelated" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-white text-opacity-90 text-sm mb-4 pixel-text leading-relaxed">
                  {item.description}
                </p>

                {/* Stats */}
                <div className="space-y-3 mb-5">
                  {item.attack && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Sword className="w-4 h-4 text-red-300 pixelated" />
                        <span>攻撃力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-3 bg-black bg-opacity-50 border overflow-hidden"
                          style={{
                            borderColor: "rgba(255,255,255,0.3)",
                            borderStyle: "solid",
                            borderImage: "none",
                          }}>
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(item.attack / 120) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-bold text-sm w-8 text-right pixel-text">
                          {item.attack}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.defense && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Shield className="w-4 h-4 text-blue-300 pixelated" />
                        <span>防御力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-3 bg-black bg-opacity-50 border overflow-hidden"
                          style={{
                            borderColor: "rgba(255,255,255,0.3)",
                            borderStyle: "solid",
                            borderImage: "none",
                          }}>
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(item.defense / 120) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-bold text-sm w-8 text-right pixel-text">
                          {item.defense}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.magic && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Star className="w-4 h-4 text-purple-300 pixelated" />
                        <span>魔法力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-3 bg-black bg-opacity-50 border overflow-hidden"
                          style={{
                            borderColor: "rgba(255,255,255,0.3)",
                            borderStyle: "solid",
                            borderImage: "none",
                          }}>
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(item.magic / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-bold text-sm w-8 text-right pixel-text">
                          {item.magic}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Actions */}
                <div
                  className="border-t-2 pt-4"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    borderStyle: "solid",
                  }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-yellow-300 pixelated" />
                    <span className="font-bold text-white text-lg pixel-text">
                      {item.price.toLocaleString()}
                    </span>
                  </div>

                  {!item.owned ? (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={coins < item.price}
                      className="w-full p-3 border-3 font-bold pixel-text"
                      style={{
                        backgroundColor:
                          coins >= item.price ? "#22c55e" : "#6b7280",
                        borderColor:
                          coins >= item.price ? "#16a34a" : "#4b5563",
                        color: "white",
                        borderStyle: "solid",
                        borderImage: "none",
                        boxShadow:
                          coins >= item.price
                            ? "2px 2px 0px #15803d, 4px 4px 0px rgba(0,0,0,0.3)"
                            : "2px 2px 0px #374151",
                        cursor: coins >= item.price ? "pointer" : "not-allowed",
                      }}>
                      BUY
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="w-full p-3 border-3 font-bold pixel-text"
                      style={{
                        backgroundColor: item.equipped ? "#6b7280" : "#3b82f6",
                        borderColor: item.equipped ? "#4b5563" : "#1d4ed8",
                        color: "white",
                        borderStyle: "solid",
                        borderImage: "none",
                        boxShadow: item.equipped
                          ? "2px 2px 0px #374151"
                          : "2px 2px 0px #1e40af, 4px 4px 0px rgba(0,0,0,0.3)",
                        cursor: "pointer",
                      }}>
                      {item.equipped ? "EQUIPPED" : "EQUIP"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
