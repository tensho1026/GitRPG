"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { fetchMonthlyContributions } from "@/actions/github/getCommitThisMonth";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import MonthlyActivity from "@/app/grass/components/MonthlyActivity";

type DailyCommit = {
  date: string;
  contributionCount: number;
};

export default function GrassPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    monthlyCommits: [] as DailyCommit[],
    thisMonthTotal: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        session.accessToken
      ) {
        try {
          const statusResult = await getUserStatus(session.user.email);
          if (statusResult) {
            const contributionData = await fetchMonthlyContributions(
              session.accessToken,
              statusResult.createdAt
            );

            if (contributionData) {
              setUserData({
                monthlyCommits: contributionData.dailyCommits,
                thisMonthTotal: contributionData.totalCommits,
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch contribution data:", error);
        }
      }
    };

    fetchData();
  }, [status, session]);

  return (
    <div
      className="min-h-screen p-4 font-mono"
      style={{
        backgroundColor: "#059669",
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 2px, transparent 2px)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      }}>
      <style jsx>{`
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }
        .pixel-text {
          font-family: "Courier New", monospace;
          font-weight: bold;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                <span className="pixel-text">
                  今月: {userData.thisMonthTotal}コミット
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grass Display */}
        <div className="lg:col-span-3">
          <MonthlyActivity
            monthlyCommits={userData.monthlyCommits}
            thisMonthTotal={userData.thisMonthTotal}
          />
        </div>
      </div>
    </div>
  );
}
