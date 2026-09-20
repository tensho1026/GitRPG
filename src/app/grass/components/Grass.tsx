"use client";

import GrassHeader from "./GrassHeader";
import MonthlyActivity from "./MonthlyActivity";
import { useGrassData } from "../hooks/useGrassData";
import BackGround from "@/components/BackGround";
import Loading from "@/components/ Loading";
import { DataState } from "@/app/components/DataState";
import GuildNavigation from "@/components/GuildNavigation";

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
    <main className="guild-shell min-h-screen pb-20 md:pb-0">
      <BackGround backgroundImage="/newhomepage.JPG" />

      <div className="guild-container font-mono">
        <div>
          <GrassHeader thisMonthTotal={thisMonthTotal} />
          <GuildNavigation />

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
    </main>
  );
}
