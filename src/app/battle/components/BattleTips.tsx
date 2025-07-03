"use client";

import { Zap } from "lucide-react";

export default function BattleTips() {
  return (
    <div className="mt-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "#059669",
          borderColor: "#34d399",
          boxShadow: "6px 6px 0px #047857, 12px 12px 0px rgba(0,0,0,0.4)",
        }}>
        <h3 className="text-xl font-bold text-white pixel-text mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          戦闘のヒント
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-200 pixel-text">
          <div>
            <p className="font-bold mb-2">💡 攻撃力を上げるには:</p>
            <ul className="text-sm space-y-1">
              <li>• 武器を装備する</li>
              <li>• アバターを変更する</li>
              <li>• レベルアップする</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-2">🛡️ 防御力を上げるには:</p>
            <ul className="text-sm space-y-1">
              <li>• 防具を装備する</li>
              <li>• 守護者アバターを選択</li>
              <li>• レベルアップする</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
