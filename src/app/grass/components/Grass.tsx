"use client";

import GrassHeader from "./GrassHeader";
import MonthlyActivity from "./MonthlyActivity";
import { useGrassData } from "../hooks/useGrassData";
import BackGround from "@/components/BackGround";
import Loading from "@/components/ Loading";
import { DataState } from "@/app/components/DataState";

export default function Grass() {
  const {
    monthlyContributions,
    thisMonthTotal,
    totalCommits,
    totalIssues,
    totalPullRequests,
    totalReviews,
    isLoading,
    error,
    retry,
  } = useGrassData();

  if (isLoading) return <Loading backgroundImage="/newhomepage.JPG" />;
  if (error) {
    return (
      <DataState
        title="活動データを読み込めません"
        message={error}
        onRetry={retry}
      />
    );
  }

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
              totalCommits={totalCommits}
              totalIssues={totalIssues}
              totalPullRequests={totalPullRequests}
              totalReviews={totalReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
