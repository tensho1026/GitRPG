"use client";

import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface GrassHeaderProps {
  thisMonthTotal: number;
}

export default function GrassHeader({ thisMonthTotal }: GrassHeaderProps) {
  return (
    <div className="mb-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "#059669",
          borderColor: "#fbbf24",
          boxShadow: "6px 6px 0px #047857, 12px 12px 0px rgba(0,0,0,0.6)",
        }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/home" className="shrink-0">
              <button
                className="touch-target p-3 border-3 bg-green-600 border-green-400 text-white pixel-border hover:bg-green-500"
                style={{ boxShadow: "3px 3px 0px #047857" }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3 pixel-text break-words">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
              活動の草
            </h1>
          </div>
          <div
            className="touch-target flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border-3 text-green-900 font-bold"
            style={{
              backgroundColor: "#fbbf24",
              borderColor: "#f59e0b",
              boxShadow: "3px 3px 0px #d97706",
            }}>
            <TrendingUp className="w-5 h-5" />
            <span className="pixel-text">活動合計: {thisMonthTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
