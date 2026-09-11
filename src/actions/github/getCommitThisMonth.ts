"use server";

import {
  getAuthenticatedGitHubAccessToken,
  getAuthenticatedUserId,
} from "@/lib/authenticatedUser";
import { db } from "../../db/neon";

export type DailyContribution = {
  date: string;
  contributionCount: number;
};

export type MonthlyContributions = {
  totalContributions: number;
  totalCommits: number;
  totalIssues: number;
  totalPullRequests: number;
  totalReviews: number;
  dailyContributions: DailyContribution[];
};

export const fetchMonthlyContributions = async () => {
  const userId = await getAuthenticatedUserId();
  const accessToken = await getAuthenticatedGitHubAccessToken();
  const today = new Date();
  let fromDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );

  const { data: user } = await db
    .from("Users")
    .select("createdAt")
    .eq("id", userId)
    .maybeSingle();
  const userCreatedAt = user?.createdAt;

  // If the user was created this month, fetch activity from their creation date.
  if (userCreatedAt) {
    // Convert string to Date if necessary
    const createdDate =
      typeof userCreatedAt === "string"
        ? new Date(userCreatedAt)
        : userCreatedAt;

    if (
      !Number.isNaN(createdDate.getTime()) &&
      createdDate.getUTCFullYear() === today.getUTCFullYear() &&
      createdDate.getUTCMonth() === today.getUTCMonth()
    ) {
      fromDate = createdDate;
    }
  }

  const query = `
    query ($from: DateTime!) {
      viewer {
        contributionsCollection(from: $from) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "GitHub-RPG-App",
    },
    cache: "no-store",
    body: JSON.stringify({
      query,
      variables: {
        from: fromDate.toISOString(),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error("GitHub API Errors:", json.errors);
    throw new Error("Failed to fetch data from GitHub API.");
  }

  if (!json.data || !json.data.viewer) {
    console.error("Invalid data structure in GitHub API response:", json);
    throw new Error("Invalid data structure in GitHub API response.");
  }

  const data = json.data.viewer.contributionsCollection;
  if (!data || !Array.isArray(data.contributionCalendar?.weeks)) {
    throw new Error("Invalid contribution data from GitHub API.");
  }

  const currentMonthStr = today.toISOString().slice(0, 7);

  // Flatten to a list of days and filter to the current month
  const dailyContributions: DailyContribution[] = data.contributionCalendar.weeks
    .flatMap(
      (week: {
        contributionDays?: DailyContribution[];
      }) => week.contributionDays ?? []
    )
    .filter((day: DailyContribution) =>
      day.date.startsWith(currentMonthStr)
    );

  // contributionCount is the total GitHub activity for a day (commits,
  // issues, pull requests, and reviews), so keep the monthly total consistent
  // with the calendar rather than labelling it as commit-only data.
  const totalContributionsThisMonth = dailyContributions.reduce(
    (total: number, day: DailyContribution) =>
      total + day.contributionCount,
    0
  );

  const toNonNegativeInteger = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
      ? value
      : 0;

  const result: MonthlyContributions = {
    totalContributions: totalContributionsThisMonth,
    totalCommits: toNonNegativeInteger(data.totalCommitContributions),
    totalIssues: toNonNegativeInteger(data.totalIssueContributions),
    totalPullRequests: toNonNegativeInteger(
      data.totalPullRequestContributions
    ),
    totalReviews: toNonNegativeInteger(
      data.totalPullRequestReviewContributions
    ),
    dailyContributions,
  };

  return result;
};
