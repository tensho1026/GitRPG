"use client";

import AvatarHeader from "./components/AvatarHeader";
import AvatarGrid from "./components/AvatarGrid";
import LoadingOverlay from "./components/LoadingOverlay";
import { useAvatarData } from "./hooks/useAvatarData";
import BackGround from "@/components/BackGround";

export default function AvatarSelection() {
  const {
    playerData,
    coins,
    isProcessing,
    displayAvatars,
    handleEquip,
    handleUnlockAvatar,
  } = useAvatarData();

  return (
    <div className="relative min-h-screen">
      <BackGround backgroundImage="newavatar.JPG" />
      <LoadingOverlay isProcessing={isProcessing} />

      <div className="relative z-10 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
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
