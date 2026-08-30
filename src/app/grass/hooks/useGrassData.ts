"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchMonthlyContributions } from "@/actions/github/getCommitThisMonth";

type DailyCommit = {
  date: string;
  contributionCount: number;
};

export function useGrassData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    monthlyCommits: [] as DailyCommit[],
    thisMonthTotal: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email
      ) {
        try {
          const contributionData = await fetchMonthlyContributions();

          if (contributionData) {
            setUserData({
              monthlyCommits: contributionData.dailyCommits,
              thisMonthTotal: contributionData.totalCommits,
            });
          }
        } catch (error) {
          console.error("Failed to fetch contribution data:", error);
        }
      }
    };

    fetchData();
  }, [status, session]);

  return {
    monthlyCommits: userData.monthlyCommits,
    thisMonthTotal: userData.thisMonthTotal,
  };
}
