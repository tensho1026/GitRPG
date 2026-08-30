"use server";

import {
  getAuthenticatedGitHubAccessToken,
  getAuthenticatedUserId,
} from "@/lib/authenticatedUser";
import { supabase } from "../../supabase/supabase.config";

export const fetchMonthlyContributions = async () => {
  const userId = await getAuthenticatedUserId();
  const accessToken = await getAuthenticatedGitHubAccessToken();
  const today = new Date();
  let fromDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );

  const { data: user } = await supabase
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
  const dailyContributions = data.contributionCalendar.weeks
    .flatMap(
      (week: {
        contributionDays?: { date: string; contributionCount: number }[];
      }) => week.contributionDays ?? []
    )
    .filter((day: { date: string; contributionCount: number }) =>
      day.date.startsWith(currentMonthStr)
    );

  // contributionCount is the total GitHub activity for a day (commits,
  // issues, pull requests, and reviews), so keep the monthly total consistent
  // with the calendar rather than labelling it as commit-only data.
  const totalContributionsThisMonth = dailyContributions.reduce(
    (total: number, day: { contributionCount: number }) =>
      total + day.contributionCount,
    0
  );

  return {
    totalContributions: totalContributionsThisMonth,
    dailyContributions,
  };
};
