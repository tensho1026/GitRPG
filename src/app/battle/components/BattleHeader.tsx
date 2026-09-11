"use client";

import { ArrowLeft, Target, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface BattleHeaderProps {
  userLevel: number;
  totalHp: number;
}

export default function BattleHeader({
  userLevel,
  totalHp,
}: BattleHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-4"><div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="ホームへ戻る"
              onClick={() => router.push("/home")}
              className="guild-button guild-button--stone h-11 w-11 p-0">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
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
