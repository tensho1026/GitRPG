"use client";

import ItemHeader from "./ItemHeader";
import ItemTabs from "./ItemTabs";
import ItemLayout from "./ItemLayout";
import { useItemData } from "../hooks/useItemData";
import BackGround from "@/components/BackGround";
import Loading from "@/components/ Loading";

export default function Item() {
  const {
    userItems,
    battleStatus,
    coins,
    selectedTab,
    setSelectedTab,
    fetchData,
    isLoading,
  } = useItemData();

  // Show loading screen during initial data fetch
  if (isLoading) {
    return <Loading backgroundImage="newitempage.JPG" />;
  }

  return (
    <div className="relative min-h-screen">
      <BackGround backgroundImage="newitempage.JPG" />

      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          <ItemHeader coins={coins} />
          <ItemTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
          <ItemLayout
            userItems={userItems}
            battleStatus={battleStatus.totalStats}
            selectedTab={selectedTab}
            onDataUpdate={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
