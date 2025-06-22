"use client";

import AvatarCard from "./AvatarCard";

interface AvatarGridProps {
  displayAvatars: Array<{
    id: string;
    name: string;
    type: string;
    image: string;
    description: string;
    unlockLevel: number;
    price: number;
    statBonus: { hp: number; attack: number; defense: number };
    owned: boolean;
    equipped: boolean;
    dbId?: string;
  }>;
  playerLevel: number;
  playerCoins: number;
  isProcessing: boolean;
  onEquip: (dbId: string) => void;
  onUnlock: (avatarId: string) => void;
}

export default function AvatarGrid({
  displayAvatars,
  playerLevel,
  playerCoins,
  isProcessing,
  onEquip,
  onUnlock,
}: AvatarGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {displayAvatars.map((character) => (
        <AvatarCard
          key={character.id}
          character={character}
          playerLevel={playerLevel}
          playerCoins={playerCoins}
          isProcessing={isProcessing}
          onEquip={onEquip}
          onUnlock={onUnlock}
        />
      ))}
    </div>
  );
}
