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
    <div className="relative min-h-screen">
      <BackGround backgroundImage="newavatar.JPG" />

      {/* Processing overlay for actions */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-bold pixel-text animate-pulse">
            処理中...
          </div>
        </div>
      )}

      <div className="relative z-10 p-3 sm:p-4 font-mono">
        <div className="max-w-6xl mx-auto">
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
    </div>
  );
}
