"use server";

export const fetchMonthlyContributions = async (
  accessToken: string,
  userCreatedAt?: Date
) => {
  const today = new Date();
  let fromDate = new Date(today.getFullYear(), today.getMonth(), 1);

  // If the user was created this month, fetch commits from their creation date.
  if (
    userCreatedAt &&
    userCreatedAt.getFullYear() === today.getFullYear() &&
    userCreatedAt.getMonth() === today.getMonth()
  ) {
    fromDate = userCreatedAt;
  }

  const query = `
    query ($from: DateTime!) {
      viewer {
        contributionsCollection(from: $from) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
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
    },
    body: JSON.stringify({
      query,
      variables: {
        from: fromDate.toISOString(),
      },
    }),
  });

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

  const currentMonthStr = today.toISOString().slice(0, 7);

  // Flatten to a list of days and filter to the current month
  const dailyCommits = data.contributionCalendar.weeks
    .flatMap(
      (week: {
        contributionDays: { date: string; contributionCount: number }[];
      }) => week.contributionDays
    )
    .filter((day: { date: string; contributionCount: number }) =>
      day.date.startsWith(currentMonthStr)
    );

  // Calculate the total commits for the current month from the filtered list
  const totalCommitsThisMonth = dailyCommits.reduce(
    (acc: number, day: { contributionCount: number }) =>
      acc + day.contributionCount,
    0
  );

  return {
    totalCommits: totalCommitsThisMonth,
    issues: data.totalIssueContributions,
    pullRequests: data.totalPullRequestContributions,
    reviews: data.totalPullRequestReviewContributions,
    repositories: data.totalRepositoryContributions,
    dailyCommits,
  };
};
