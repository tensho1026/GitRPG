"use client";

import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/home")}
              className="p-3 border-3 bg-green-600 border-green-400 text-white pixel-border hover:bg-green-500"
              style={{ boxShadow: "3px 3px 0px #047857" }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
              <Calendar className="w-10 h-10" />
              コミット草
            </h1>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 border-3 text-green-900 font-bold"
            style={{
              backgroundColor: "#fbbf24",
              borderColor: "#f59e0b",
              boxShadow: "3px 3px 0px #d97706",
            }}>
            <TrendingUp className="w-5 h-5" />
            <span className="pixel-text">今月: {thisMonthTotal}コミット</span>
          </div>
        </div>
      </div>
    </div>
  );
}
