"use server";

import { getAuthenticatedGitHubAccessToken } from "@/lib/authenticatedUser";

export const fetchTotalContributions = async (
  fromDate: string,
  toDate: string
): Promise<number> => {
  const accessToken = await getAuthenticatedGitHubAccessToken();

  const query = `
    query ($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
        }
      }
    }
  `;

  // GitHub limits a collection to one year and includes both endpoints.
  const windowMs = 365 * 24 * 60 * 60 * 1000;
  const end = Date.parse(toDate);
  let total = 0;
  for (let start = Math.floor(Date.parse(fromDate) / 1000) * 1000; start <= end;) {
    // Leave one second between inclusive endpoints at the API's precision.
    const stop = Math.min(start + windowMs - 1000, end);
    total += await fetchWindow(new Date(start).toISOString(), new Date(stop).toISOString());
    start = stop + 1000;
  }
  return total;

  async function fetchWindow(from: string, to: string): Promise<number> {
    try {
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
          variables: { from, to },
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "GitHubの権限が不足しているか、APIのレート制限に達しました。ログインし直して権限を更新してください。"
        );
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(`GitHub API GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      const commits = json.data?.viewer?.contributionsCollection?.totalCommitContributions;
      if (!Number.isSafeInteger(commits) || commits < 0) {
        throw new Error("Invalid commit count from GitHub");
      }

      return commits;
    } catch (error) {
      console.error("Error in fetchTotalContributions:", error);
      throw error;
    }
  }
};
