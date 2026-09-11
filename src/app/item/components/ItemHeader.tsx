"use client";

import { ArrowLeft, Sword, Coins } from "lucide-react";
import Link from "next/link";

interface ItemHeaderProps {
  coins: number;
}

export default function ItemHeader({ coins }: ItemHeaderProps) {
  return (
    <div className="mb-4"><div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/home" aria-label="ホームへ戻る" className="shrink-0">
              <span
                aria-label="ホームへ戻る"
                className="guild-button guild-button--stone h-11 w-11 p-0 focus-visible:outline-2 focus-visible:outline-yellow-300">
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </span>
            </Link>
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
