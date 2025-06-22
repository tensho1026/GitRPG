"use client";

import GrassHeader from "./components/GrassHeader";
import MonthlyActivity from "./components/MonthlyActivity";
import { useGrassData } from "./hooks/useGrassData";
import BackGround from "@/components/BackGround";

export default function GrassPage() {
  const { monthlyCommits, thisMonthTotal } = useGrassData();

  return (
    <div className="relative min-h-screen">
      <BackGround backgroundImage="/newhomepage.JPG" />

      <div className="relative z-10 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          <GrassHeader thisMonthTotal={thisMonthTotal} />

          {/* Grass Display */}
          <div className="lg:col-span-3">
            <MonthlyActivity
              monthlyCommits={monthlyCommits}
              thisMonthTotal={thisMonthTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
