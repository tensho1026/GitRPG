"use client";

import GrassHeader from "./GrassHeader";
import MonthlyActivity from "./MonthlyActivity";
import { useGrassData } from "../hooks/useGrassData";
import BackGround from "@/components/BackGround";

export default function Grass() {
  const { monthlyContributions, thisMonthTotal } = useGrassData();

  return (
    <div className="relative min-h-screen">
      <BackGround backgroundImage="/newhomepage.JPG" />

      <div className="relative z-10 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          <GrassHeader thisMonthTotal={thisMonthTotal} />

          {/* Grass Display */}
          <div className="lg:col-span-3">
            <MonthlyActivity
              monthlyContributions={monthlyContributions}
              thisMonthTotal={thisMonthTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
