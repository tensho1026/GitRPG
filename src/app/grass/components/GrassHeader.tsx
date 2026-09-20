"use client";

import { Calendar, TrendingUp } from "lucide-react";

interface GrassHeaderProps {
  thisMonthTotal: number;
}

export default function GrassHeader({ thisMonthTotal }: GrassHeaderProps) {
  return (
    <div className="mb-4">
      <div className="guild-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div><p className="guild-kicker">Activity Map</p><h1 className="guild-title flex items-center gap-2 text-2xl sm:text-3xl"><Calendar className="h-6 w-6" />冒険の足跡</h1></div>
          </div>
          <div
            className="guild-chip">
            <TrendingUp className="w-5 h-5" />
            <span>活動合計: {thisMonthTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
