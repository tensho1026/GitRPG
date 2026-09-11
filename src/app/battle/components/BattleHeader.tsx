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
    <div className="mb-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "#ea580c",
          borderColor: "#fbbf24",
          boxShadow: "6px 6px 0px #c2410c, 12px 12px 0px rgba(0,0,0,0.6)",
        }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="ホームへ戻る"
              onClick={() => router.push("/home")}
              className="touch-target p-3 border-3 bg-orange-600 border-orange-400 text-white pixel-border hover:bg-orange-500"
              style={{ boxShadow: "3px 3px 0px #c2410c" }}>
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3 pixel-text break-words">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
              戦闘ステータス
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
            <div
              className="touch-target flex items-center justify-center gap-2 px-2 sm:px-4 py-2 border-3 text-orange-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <Zap className="w-5 h-5" />
              <span className="pixel-text">Lv.{userLevel}</span>
            </div>
            <div
              className="touch-target flex items-center justify-center gap-2 px-2 sm:px-4 py-2 border-3 text-orange-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <Heart className="w-5 h-5" />
              <span className="pixel-text">HP: {totalHp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
