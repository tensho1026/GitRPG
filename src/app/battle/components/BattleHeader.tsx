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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/home")}
              className="p-3 border-3 bg-orange-600 border-orange-400 text-white pixel-border hover:bg-orange-500"
              style={{ boxShadow: "3px 3px 0px #c2410c" }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
              <Target className="w-10 h-10" />
              戦闘ステータス
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <Zap className="w-5 h-5" />
              <span className="pixel-text">Lv.{userLevel}</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
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
