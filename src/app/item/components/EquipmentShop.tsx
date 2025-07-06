"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Sword, Shield, Star, Coins, Lock } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { equipmentData } from "@/data/equipment";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { getUserItems } from "@/actions/item/getUserItems";
import { purchaseItem } from "@/actions/item/purchaseItem";
import { equipItem } from "@/actions/item/equipItem";
import type { Item as UserItem } from "@/types/user/userStatus";
import type { Equipment } from "@/types/equipment/equipment";

type DisplayEquipment = Equipment & {
  dbId?: string;
};

/* ---------- アイコン ---------- */
const typeIcons = {
  weapon: <Sword className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
  armor: <Shield className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
  accessory: (
    <Star className="w-4 h-4" style={{ imageRendering: "pixelated" }} />
  ),
};

/* ---------- メインコンポーネント ---------- */
export default function EquipmentShop({
  selectedTab,
  onDataUpdate,
}: {
  selectedTab: string;
  onDataUpdate?: () => Promise<void>;
}) {
  const [coins, setCoins] = useState<number>(0);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        setIsProcessing(true);
        const userEmail = session.user.email;
        try {
          const [currentCoin, items] = await Promise.all([
            getCurrentCoin(userEmail),
            getUserItems(userEmail),
          ]);
          setCoins(currentCoin || 0);
          setUserItems(items);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    fetchData();
  }, [session]);

  const equipmentToDisplay = useMemo((): DisplayEquipment[] => {
    return equipmentData.map((staticItem) => {
      const userItem = userItems.find(
        (item) => item.equipmentId === staticItem.id
      );
      return {
        ...staticItem,
        owned: !!userItem,
        equipped: userItem?.equipped || false,
        dbId: userItem?.id,
      };
    });
  }, [userItems]);

  const handlePurchase = async (equipmentId: string) => {
    if (!session?.user?.email) return;
    setIsProcessing(true);
    try {
      await purchaseItem(session.user.email, equipmentId);
      const [currentCoin, items] = await Promise.all([
        getCurrentCoin(session.user.email),
        getUserItems(session.user.email),
      ]);
      setCoins(currentCoin || 0);
      setUserItems(items);

      // Call parent's update function to refresh equipment status and combat status
      if (onDataUpdate) {
        await onDataUpdate();
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEquip = async (dbId: string | undefined) => {
    if (!dbId || !session?.user?.email) return;
    setIsProcessing(true);
    try {
      await equipItem(session.user.email, dbId);
      const items = await getUserItems(session.user.email);
      setUserItems(items);

      // Call parent's update function to refresh equipment status and combat status
      if (onDataUpdate) {
        await onDataUpdate();
      }
    } catch (error) {
      console.error("Equip failed:", error);
      alert((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEquipment = equipmentToDisplay.filter((item) => {
    if (selectedTab === "all") return true;
    return item.type === selectedTab;
  });

  return (
    <div
      className="font-mono relative"
      style={{
        fontFamily: '"Courier New", monospace',
        fontSize: "14px",
        imageRendering: "pixelated",
      }}>
      {/* {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <p className="text-white text-3xl font-bold pixel-text animate-pulse">
            ... PROCESSING ...
          </p>
        </div>
      )} */}

      <div className="max-w-7xl mx-auto">
        {/* -------- Equipment Grid -------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="relative pixel-border flex flex-col h-full"
              style={{
                backgroundColor: "#1f2937",
                borderWidth: "5px",
                borderColor: item.owned ? "#10b981" : "#6b7280",
                boxShadow: item.owned
                  ? "6px 6px 0px #059669, 12px 12px 0px rgba(0,0,0,0.5)"
                  : "4px 4px 0px #374151, 8px 8px 0px rgba(0,0,0,0.4)",
                opacity: !item.owned ? 0.8 : 1,
              }}>
              {/* ------------ Lock Overlay ------------ */}
              {!item.owned && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    backdropFilter: "none",
                  }}>
                  <div className="text-center mb-4">
                    <Lock
                      className="w-20 h-20 text-red-400 mx-auto mb-3"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-red-400 font-bold pixel-text text-xl">
                      LOCKED
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={coins < item.price || isProcessing}
                    className="px-6 py-3 border-4 font-bold pixel-text text-lg"
                    style={{
                      backgroundColor:
                        coins >= item.price ? "#22c55e" : "#6b7280",
                      borderColor: coins >= item.price ? "#16a34a" : "#4b5563",
                      color: "white",
                      boxShadow:
                        coins >= item.price
                          ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                          : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                      cursor:
                        coins >= item.price && !isProcessing
                          ? "pointer"
                          : "not-allowed",
                    }}>
                    購入する
                  </button>
                </div>
              )}

              {/* ------------ Card Body ------------ */}
              <div className="p-6 flex flex-col h-full">
                {/* Equipment Image */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="border-3 p-3"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#6b7280",
                      boxShadow:
                        "2px 2px 0px #1f2937, 4px 4px 0px rgba(0,0,0,0.3)",
                    }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="pixel-border"
                      style={{
                        imageRendering: "pixelated",
                        borderWidth: "2px",
                        borderColor: "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {typeIcons[item.type as keyof typeof typeIcons]}
                    <h3 className="text-xl font-bold text-white pixel-text">
                      {item.name}
                    </h3>
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
                        <Sword
                          className="w-5 h-5 text-red-300"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span>攻撃力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-4 border-2 overflow-hidden"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderColor: "rgba(255,255,255,0.4)",
                          }}>
                          <div
                            className="h-full"
                            style={{
                              width: `${(item.attack / 120) * 100}%`,
                              backgroundColor: "#ef4444",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                            }}
                          />
                        </div>
                        <span className="text-white font-bold text-lg w-10 text-right pixel-text">
                          {item.attack}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.defense && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Shield
                          className="w-5 h-5 text-blue-300"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span>防御力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-4 border-2 overflow-hidden"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderColor: "rgba(255,255,255,0.4)",
                          }}>
                          <div
                            className="h-full"
                            style={{
                              width: `${(item.defense / 120) * 100}%`,
                              backgroundColor: "#3b82f6",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                            }}
                          />
                        </div>
                        <span className="text-white font-bold text-lg w-10 text-right pixel-text">
                          {item.defense}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------ Price & Actions ------------ */}
                <div
                  className="border-t-3 pt-4 mt-auto"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Coins
                      className="w-6 h-6 text-yellow-300"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="font-bold text-white text-xl pixel-text">
                      {item.price.toLocaleString()}
                    </span>
                  </div>

                  {!item.owned ? (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={coins < item.price || isProcessing}
                      className="w-full p-4 border-4 font-bold pixel-text text-lg"
                      style={{
                        backgroundColor:
                          coins >= item.price ? "#22c55e" : "#6b7280",
                        borderColor:
                          coins >= item.price ? "#16a34a" : "#4b5563",
                        color: "white",
                        boxShadow:
                          coins >= item.price
                            ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                            : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                        cursor:
                          coins >= item.price && !isProcessing
                            ? "pointer"
                            : "not-allowed",
                      }}>
                      購入する
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item.dbId)}
                      disabled={isProcessing}
                      className="w-full p-4 border-4 font-bold pixel-text text-lg"
                      style={{
                        backgroundColor: item.equipped ? "#6b7280" : "#3b82f6",
                        borderColor: item.equipped ? "#4b5563" : "#1d4ed8",
                        color: "white",
                        boxShadow: item.equipped
                          ? "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)"
                          : "4px 4px 0px #1e40af, 8px 8px 0px rgba(0,0,0,0.4)",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                      }}>
                      {item.equipped ? "装備中" : "装備"}
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
