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
  console.log("🔧 [DEBUG] fetchTotalContributions called with:", {
    hasAccessToken: !!accessToken,
    fromDate,
  });

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
      },
      body: JSON.stringify({
        query,
        variables: {
          from: fromDate,
        },
      }),
    });

    console.log("🌐 [DEBUG] GitHub GraphQL API response status:", response.status);

    if (!response.ok) {
      console.error("❌ [DEBUG] GitHub API response not ok:", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    console.log("📋 [DEBUG] GitHub API raw response:", JSON.stringify(json, null, 2));

    if (json.errors) {
      console.error("❌ [DEBUG] GitHub API returned errors:", json.errors);
      throw new Error(`GitHub API GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    if (!json.data || !json.data.viewer || !json.data.viewer.contributionsCollection) {
      console.error("❌ [DEBUG] Invalid response structure:", json);
      throw new Error("Invalid response structure from GitHub API");
    }

    const data = json.data.viewer.contributionsCollection;

    const result = {
      commits: data.totalCommitContributions || 0,
      issues: data.totalIssueContributions || 0,
      pullRequests: data.totalPullRequestContributions || 0,
      reviews: data.totalPullRequestReviewContributions || 0,
      repositories: data.totalRepositoryContributions || 0,
    };

    console.log("✅ [DEBUG] Processed GitHub contributions:", result);

    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Error in fetchTotalContributions:", error);
    throw error;
  }
};
