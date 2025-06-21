"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Sword, Coins } from "lucide-react";
import EquipmentShop from "@/components/item/Item";
import EquipmentStatus from "@/components/home/EquipmentStatus";
import CombatStatus from "@/components/home/CombatStatus";
import { getUserCurrentItems } from "@/actions/item/getUserCurrentitems";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { Items } from "@/generated/prisma";

export default function ItemPage() {
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

  return (
    <div
      className="relative min-h-screen p-4 font-mono bg-cover bg-center"
      style={{
        backgroundImage: "url(/newitempage.JPG)",
      }}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
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
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderColor: "#fbbf24",
                boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.6)",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => (window.location.href = "/home")}
                    className="p-3 border-3 bg-gray-800/80 text-white pixel-border hover:bg-gray-700/80"
                    style={{
                      borderColor: "#fbbf24",
                      boxShadow: "3px 3px 0px #d97706",
                    }}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
                    <Sword className="w-10 h-10" />
                    装備・アイテム
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 px-4 py-2 border-3 text-red-900 font-bold"
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
          {/* -------- Tabs -------- */}
          <div className="mb-6">
            <div
              className="grid grid-cols-4 gap-4 p-4 pixel-border"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderColor: "#fbbf24",
              }}>
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
                  className="p-4 border-4 font-bold text-white pixel-text text-lg"
                  style={{
                    backgroundColor:
                      selectedTab === tab.value ? tab.color : "#4b5563",
                    borderColor:
                      selectedTab === tab.value ? "#ffffff" : "#6b7280",
                    boxShadow:
                      selectedTab === tab.value
                        ? `4px 4px 0px ${tab.shadow}, 8px 8px 0px rgba(0,0,0,0.4)`
                        : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Left and Right Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
            {/* Left Side - Equipment Status and Combat Status (30%) */}
            <div className="xl:col-span-3 space-y-6">
              <EquipmentStatus userItems={userItems} />
              <CombatStatus
                hp={battleStatus.hp}
                attack={battleStatus.attack}
                defense={battleStatus.defense}
              />
            </div>

            {/* Right Side - Equipment Shop (70%) */}
            <div className="xl:col-span-7">
              <EquipmentShop
                selectedTab={selectedTab}
                onDataUpdate={fetchData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
