export type GitHubContributions = {
  commits: number;
  issues: number;
  pullRequests: number;
  reviews: number;
  repositories: number;
};

export const fetchTotalContributions = async (
  accessToken: string,
  fromDate: string
): Promise<GitHubContributions> => {
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

  const json = await response.json();
  const data = json.data.viewer.contributionsCollection;

  return {
    commits: data.totalCommitContributions || 0,
    issues: data.totalIssueContributions || 0,
    pullRequests: data.totalPullRequestContributions || 0,
    reviews: data.totalPullRequestReviewContributions || 0,
    repositories: data.totalRepositoryContributions || 0,
  };
};
