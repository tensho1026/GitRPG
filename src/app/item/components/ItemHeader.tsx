"use client";

import { ArrowLeft, Sword, Coins } from "lucide-react";
import Link from "next/link";

interface ItemHeaderProps {
  coins: number;
}

export default function ItemHeader({ coins }: ItemHeaderProps) {
  return (
    <div className="mb-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderColor: "#fbbf24",
          boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.6)",
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <button
                className="p-3 border-3 bg-gray-800/80 text-white pixel-border hover:bg-gray-700/80"
                style={{
                  borderColor: "#fbbf24",
                  boxShadow: "3px 3px 0px #d97706",
                }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
              <Sword className="w-10 h-10" />
              装備・アイテム
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-red-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <Coins className="w-5 h-5" />
              <span className="pixel-text">{coins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
