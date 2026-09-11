"use client";

import ItemHeader from "./ItemHeader";
import ItemTabs from "./ItemTabs";
import ItemLayout from "./ItemLayout";
import { useItemData } from "../hooks/useItemData";
import BackGround from "@/components/BackGround";
import Loading from "@/components/ Loading";
import { DataState } from "@/app/components/DataState";

export default function Item() {
  const {
    userItems,
    battleStatus,
    coins,
    selectedTab,
    setSelectedTab,
    fetchData,
    isLoading,
    error,
    retry,
  } = useItemData();

  // Show loading screen during initial data fetch
  if (isLoading) {
    return <Loading backgroundImage="newitempage.JPG" />;
  }

  if (error) {
    return (
      <DataState
        title="装備データを読み込めません"
        message={error}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackGround backgroundImage="newitempage.JPG" />

      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 p-3 sm:p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          <ItemHeader coins={coins} />
          <ItemTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
          <ItemLayout
            userItems={userItems}
            coins={coins}
            battleStatus={battleStatus.totalStats}
            selectedTab={selectedTab}
            onDataUpdate={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
