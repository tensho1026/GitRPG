"use client";

import { Sword, Shield, LucideIcon } from "lucide-react";

interface BattleStatsCardProps {
  type: "attack" | "defense";
  value: number;
  title: string;
  description: string;
}

export default function BattleStatsCard({
  type,
  value,
  title,
  description,
}: BattleStatsCardProps) {
  const isAttack = type === "attack";
  const Icon: LucideIcon = isAttack ? Sword : Shield;

  const textColor = isAttack ? "text-red-300" : "text-sky-300";

  return (
    <div className="guild-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${textColor}`} />
        <h2 className="guild-title text-2xl">{title}</h2>
      </div>
      <div className="text-center">
        <div className={`mb-2 font-mono text-6xl font-black ${textColor}`}>
          {value}
        </div>
        <p className="text-stone-400">{description}</p>
      </div>
    </div>
  );
}
