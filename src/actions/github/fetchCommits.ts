"use server";

import { getAuthenticatedGitHubAccessToken } from "@/lib/authenticatedUser";

export type GitHubContributions = {
  commits: number;
  issues: number;
  pullRequests: number;
  reviews: number;
  repositories: number;
};

export const fetchTotalContributions = async (
  fromDate: string
): Promise<GitHubContributions> => {
  const accessToken = await getAuthenticatedGitHubAccessToken();

  const query = `
    query ($from: DateTime!) {
      viewer {
        contributionsCollection(from: $from) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
        }
      }
    }
  `;

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
        variables: {
          from: fromDate,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GitHub API GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    if (!json.data || !json.data.viewer || !json.data.viewer.contributionsCollection) {
      throw new Error("Invalid response structure from GitHub API");
    }

    const data = json.data.viewer.contributionsCollection;

    const result: GitHubContributions = {
      commits: data.totalCommitContributions ?? 0,
      issues: data.totalIssueContributions ?? 0,
      pullRequests: data.totalPullRequestContributions ?? 0,
      reviews: data.totalPullRequestReviewContributions ?? 0,
      repositories: data.totalRepositoryContributions ?? 0,
    };

    return result;
  } catch (error) {
    console.error("Error in fetchTotalContributions:", error);
    throw error;
  }
};
