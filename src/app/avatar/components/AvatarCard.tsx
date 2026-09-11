"use client";

import { Coins, Heart, Lock, Shield, Star, Sword } from "lucide-react";
import Image from "next/image";

interface AvatarCardProps {
  character: { id: string; name: string; type: string; image: string; description: string; unlockLevel: number; price: number; statBonus: { hp: number; attack: number; defense: number }; owned: boolean; equipped: boolean; dbId?: string };
  playerLevel: number; playerCoins: number; isProcessing: boolean;
  onEquip: (dbId: string) => void; onUnlock: (avatarId: string) => void;
}

export default function AvatarCard({ character, playerLevel, playerCoins, isProcessing, onEquip, onUnlock }: AvatarCardProps) {
  const canUnlock = playerLevel >= character.unlockLevel && playerCoins >= character.price;
  const stats = [
    { label: "HP", value: character.statBonus.hp, icon: Heart },
    { label: "ATK", value: character.statBonus.attack, icon: Sword },
    { label: "DEF", value: character.statBonus.defense, icon: Shield },
  ];
  return (
    <article className={`guild-panel flex min-w-0 flex-col p-5 ${character.equipped ? "!border-emerald-400" : ""}`}>
      {character.equipped && <div className="guild-chip absolute -right-2 -top-2 z-10 h-10 w-10 p-0" aria-label="選択中"><Star size={18} /></div>}
      <div className="guild-inset mb-4 grid min-h-48 place-items-center overflow-hidden p-3">
        <Image src={character.image} alt={character.name} width={150} height={150} className="h-40 w-40 object-contain [image-rendering:pixelated]" />
      </div>
      <p className="guild-kicker">{character.type} / Lv.{character.unlockLevel}</p>
      <h3 className="guild-title mt-1 text-2xl">{character.name}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-stone-400">{character.description}</p>
      <div className="my-4 grid grid-cols-3 gap-2">
        {stats.map(({ label, value, icon: Icon }) => <div key={label} className="guild-stat p-2"><Icon className="mx-auto mb-1 h-4 w-4 text-amber-300" /><span className="block text-[10px] text-stone-400">{label}</span><b className="font-mono text-emerald-300">+{value}</b></div>)}
      </div>
      <div className="mt-auto border-t border-amber-800/40 pt-4">
        {!character.owned ? (
          <div>
            <div className="mb-3 flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-stone-400"><Lock size={15} />未解放</span><span className="flex items-center gap-1 text-amber-200"><Coins size={16} />{character.price.toLocaleString()}</span></div>
            <button type="button" onClick={() => onUnlock(character.id)} disabled={!canUnlock || isProcessing} className="guild-button w-full">Lv.{character.unlockLevel}で解放</button>
          </div>
        ) : (
          <button type="button" onClick={() => character.dbId && onEquip(character.dbId)} disabled={isProcessing || character.equipped} className="guild-button w-full">{character.equipped ? "選択中" : "この英雄を選ぶ"}</button>
        )}
      </div>
    </article>
  );
}
