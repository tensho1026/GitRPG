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
    <div>
      <BackGround backgroundImage="newavatar.JPG" />
      <LoadingOverlay isProcessing={isProcessing} />

      <div className="min-h-screen p-4 font-mono max-w-6xl mx-auto relative z-10">
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
  );
}
