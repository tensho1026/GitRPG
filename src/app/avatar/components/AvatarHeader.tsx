"use client";

import { ArrowLeft, User, Crown, Coins } from "lucide-react";
import Link from "next/link";

interface AvatarHeaderProps {
  level: number;
  coins: number;
}

export default function AvatarHeader({ level, coins }: AvatarHeaderProps) {
  return (
    <div className="mb-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "#7c3aed",
          borderColor: "#fbbf24",
          boxShadow: "6px 6px 0px #5b21b6, 12px 12px 0px rgba(0,0,0,0.6)",
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <button
                className="p-3 border-3 bg-purple-600 border-purple-400 text-white pixel-border hover:bg-purple-500"
                style={{ boxShadow: "3px 3px 0px #4c1d95" }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
              <Crown className="w-10 h-10" />
              アバター選択
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-purple-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <User className="w-5 h-5" />
              <span className="pixel-text">Lv.{level}</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
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
