"use client";

import ItemHeader from "./components/ItemHeader";
import ItemTabs from "./components/ItemTabs";
import ItemLayout from "./components/ItemLayout";
import { useItemData } from "./hooks/useItemData";
import BackGround from "@/components/BackGround";

export default function ItemPage() {
  const {
    userItems,
    battleStatus,
    coins,
    selectedTab,
    setSelectedTab,
    fetchData,
  } = useItemData();

  return (
    <div>
      <BackGround backgroundImage="newitempage.JPG" />

      <div className="relative min-h-screen p-4 font-mono">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto">
            <ItemHeader coins={coins} />
            <ItemTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
            <ItemLayout
              userItems={userItems}
              battleStatus={battleStatus}
              selectedTab={selectedTab}
              onDataUpdate={fetchData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
