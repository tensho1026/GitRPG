"use client";

import { Sword, Coins } from "lucide-react";

interface ItemHeaderProps {
  coins: number;
}

export default function ItemHeader({ coins }: ItemHeaderProps) {
  return (
    <div className="mb-4"><div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div><p className="guild-kicker">Guild Smithy</p><h1 className="guild-title flex items-center gap-2 text-2xl sm:text-3xl"><Sword className="h-6 w-6" />鍛冶屋・装備</h1></div>
          </div>
          <div className="flex items-center">
            <div
              className="guild-chip">
              <Coins className="w-5 h-5" />
              <span>{coins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
