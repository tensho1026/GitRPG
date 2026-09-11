"use client";
import AvatarHeader from "./AvatarHeader";
import AvatarGrid from "./AvatarGrid";
import { useAvatarData } from "../hooks/useAvatarData";
import BackGround from "@/components/BackGround";
import Loading from "@/components/ Loading";
import { DataState, InlineError } from "@/app/components/DataState";

export default function Avatar() {
  const {
    playerData,
    coins,
    isLoading,
    isProcessing,
    displayAvatars,
    handleEquip,
    handleUnlockAvatar,
    error,
    actionError,
    retry,
  } = useAvatarData();

  // Show loading screen during initial data fetch
  if (isLoading) {
    return <Loading backgroundImage="newavatar.JPG" />;
  }

  if (error) {
    return (
      <DataState
        title="アバターデータを読み込めません"
        message={error}
        onRetry={retry}
      />
    );
  }

  return (
    <main className="guild-shell min-h-screen">
      <BackGround backgroundImage="newavatar.JPG" />

      {/* Processing overlay for actions */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="guild-panel p-7 text-lg font-bold text-amber-200">名鑑を更新中...</div>
        </div>
      )}

      <div className="guild-container font-mono">
        <div>
          {actionError && <InlineError message={actionError} />}
          <AvatarHeader level={playerData.level} coins={coins} />

          <AvatarGrid
            displayAvatars={displayAvatars}
            playerLevel={playerData.level}
            playerCoins={coins}
            isProcessing={isProcessing}
            onEquip={handleEquip}
            onUnlock={handleUnlockAvatar}
          />
        </div>
      </div>
    </main>
  );
}
