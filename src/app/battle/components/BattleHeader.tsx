"use client";

import { Target, Zap, Heart } from "lucide-react";

interface BattleHeaderProps {
  userLevel: number;
  totalHp: number;
}

export default function BattleHeader({
  userLevel,
  totalHp,
}: BattleHeaderProps) {
  return (
    <div className="mb-4"><div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div><p className="guild-kicker">Training Hall</p><h1 className="guild-title flex items-center gap-2 text-2xl sm:text-3xl"><Target className="h-6 w-6" />戦闘能力</h1></div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
            <div
              className="guild-chip">
              <Zap className="w-5 h-5" />
              <span>Lv.{userLevel}</span>
            </div>
            <div
              className="guild-chip">
              <Heart className="w-5 h-5" />
              <span>HP: {totalHp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
