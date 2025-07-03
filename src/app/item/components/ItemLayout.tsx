"use client";

import React from "react";
import BackGround from "../../../components/BackGround";
import { useItemData } from "../hooks/useItemData";
import type { Item } from "@/types/user/userStatus";
import ItemTabs from "./ItemTabs";
import EquipmentStatus from "./EquipmentStatus";
import CombatStatus from "./CombatStatus";
import EquipmentShop from "./EquipmentShop";

interface ItemLayoutProps {
  userItems: Item[];
  battleStatus: {
    hp: number;
    attack: number;
    defense: number;
  };
  selectedTab: string;
  onDataUpdate: () => Promise<void>;
}

export default function ItemLayout({
  userItems,
  battleStatus,
  selectedTab,
  onDataUpdate,
}: ItemLayoutProps) {
  return (
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
        <EquipmentShop selectedTab={selectedTab} onDataUpdate={onDataUpdate} />
      </div>
    </div>
  );
}
