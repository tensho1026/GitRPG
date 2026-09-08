"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  fetchMonthlyContributions,
  type MonthlyContributions,
} from "@/actions/github/getCommitThisMonth";

const EMPTY_MONTHLY_CONTRIBUTIONS: MonthlyContributions = {
  totalContributions: 0,
  totalCommits: 0,
  totalIssues: 0,
  totalPullRequests: 0,
  totalReviews: 0,
  dailyContributions: [],
};

export function useGrassData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<MonthlyContributions>(
    EMPTY_MONTHLY_CONTRIBUTIONS
  );
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
            setUserData(contributionData);
          }
        } catch (error) {
          if (!cancelled && requestId === requestIdRef.current) {
            console.error("Failed to fetch contribution data:", error);
          }
        }
      } else if (status !== "authenticated") {
        setUserData(EMPTY_MONTHLY_CONTRIBUTIONS);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [status, userEmail]);

  return {
    monthlyContributions: userData.dailyContributions,
    thisMonthTotal: userData.totalContributions,
    totalCommits: userData.totalCommits,
    totalIssues: userData.totalIssues,
    totalPullRequests: userData.totalPullRequests,
    totalReviews: userData.totalReviews,
  };
}
