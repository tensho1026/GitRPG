"use client";

import { Zap } from "lucide-react";

export default function BattleTips() {
  return (
    <div className="mt-6">
      <div className="parchment-panel p-6 text-stone-800">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
          <Zap className="w-6 h-6" />
          戦闘のヒント
        </h3>
        <div className="grid grid-cols-1 gap-4 text-stone-700 md:grid-cols-2">
          <div>
            <p className="mb-2 font-bold">攻撃力を上げるには:</p>
            <ul className="text-sm space-y-1">
              <li>• 武器を装備する</li>
              <li>• アバターを変更する</li>
              <li>• レベルアップする</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-bold">防御力を上げるには:</p>
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
