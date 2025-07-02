"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchMonthlyContributions } from "@/actions/github/getCommitThisMonth";
import { getUserStatus } from "@/actions/user/status/getUserStatus";

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
        session?.user?.email &&
        // @ts-ignore - NextAuth v4 accessToken property compatibility
        session.accessToken
      ) {
        try {
          const statusResult = await getUserStatus(session.user.email);
          if (statusResult) {
            const contributionData = await fetchMonthlyContributions(
              // @ts-ignore - NextAuth v4 accessToken property compatibility
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

  return {
    monthlyCommits: userData.monthlyCommits,
    thisMonthTotal: userData.thisMonthTotal,
  };
}
