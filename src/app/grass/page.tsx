"use client";

import GrassHeader from "./components/GrassHeader";
import MonthlyActivity from "./components/MonthlyActivity";
import { useGrassData } from "./hooks/useGrassData";
import BackGround from "@/components/BackGround";

export default function GrassPage() {
  const { monthlyCommits, thisMonthTotal } = useGrassData();

  return (
    <div>
      <BackGround backgroundImage="/newhomepage.JPG" />

      <div
        className="min-h-screen p-4 font-mono max-w-6xl mx-auto relative z-10"
        style={{
          backgroundColor: "#059669",
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}>
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
  );
}
