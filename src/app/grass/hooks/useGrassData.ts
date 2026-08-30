"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { fetchMonthlyContributions } from "@/actions/github/getCommitThisMonth";

type DailyContribution = {
  date: string;
  contributionCount: number;
};

export function useGrassData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    monthlyContributions: [] as DailyContribution[],
    thisMonthTotal: 0,
  });
  const requestIdRef = useRef(0);
  const userEmail = session?.user?.email ?? null;

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;
    const fetchData = async () => {
      if (status === "authenticated" && userEmail) {
        try {
          const contributionData = await fetchMonthlyContributions();

          if (cancelled || requestId !== requestIdRef.current) return;

          if (contributionData) {
            setUserData({
              monthlyContributions: contributionData.dailyContributions,
              thisMonthTotal: contributionData.totalContributions,
            });
          }
        } catch (error) {
          if (!cancelled && requestId === requestIdRef.current) {
            console.error("Failed to fetch contribution data:", error);
          }
        }
      } else if (status !== "authenticated") {
        setUserData({ monthlyContributions: [], thisMonthTotal: 0 });
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [status, userEmail]);

  return {
    monthlyContributions: userData.monthlyContributions,
    thisMonthTotal: userData.thisMonthTotal,
  };
}
