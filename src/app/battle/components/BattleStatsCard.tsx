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

  const cardStyle = {
    backgroundColor: isAttack ? "#dc2626" : "#2563eb",
    borderColor: isAttack ? "#f87171" : "#60a5fa",
    boxShadow: `6px 6px 0px ${
      isAttack ? "#991b1b" : "#1d4ed8"
    }, 12px 12px 0px rgba(0,0,0,0.4)`,
  };

  const textColor = isAttack ? "text-red-200" : "text-blue-200";
  const descriptionColor = isAttack ? "text-red-300" : "text-blue-300";

  return (
    <div className="border-4 p-6 pixel-border" style={cardStyle}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${textColor}`} />
        <h2 className="text-2xl font-bold text-white pixel-text">{title}</h2>
      </div>
      <div className="text-center">
        <div className={`text-6xl font-bold ${textColor} pixel-text mb-2`}>
          {value}
        </div>
        <p className={`${descriptionColor} pixel-text`}>{description}</p>
      </div>
    </div>
  );
}
