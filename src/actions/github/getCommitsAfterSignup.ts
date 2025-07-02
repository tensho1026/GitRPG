"use server";

import { supabase } from "../../supabase/supabase.config";

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      date: string;
    };
  };
}

export const getCommitsAfterSignup = async (
  username: string,
  githubAccessToken: string,
  userId: string
): Promise<number> => {
  if (!username || !githubAccessToken || !userId) {
    throw new Error("Username, GitHub access token, and user ID are required");
  }

  try {
    // Get user signup date
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("createdAt")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("Failed to fetch user signup date:", userError);
      throw new Error("Failed to fetch user signup date");
    }

    const signupDate = new Date(user.createdAt);
    console.log(
      `Fetching commits for ${username} after signup date: ${signupDate.toISOString()}`
    );

    let totalCommits = 0;
    let page = 1;
    const perPage = 100;

    while (true) {
      console.log(`Fetching page ${page} of commits...`);

      const response = await fetch(
        `https://api.github.com/users/${username}/events?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `token ${githubAccessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "GitHub-RPG-App",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          console.error("GitHub API rate limit exceeded");
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const events = await response.json();

      if (!Array.isArray(events) || events.length === 0) {
        console.log(`No more events found on page ${page}`);
        break;
      }

      // Filter push events and count commits after signup
      let commitsOnPage = 0;
      for (const event of events) {
        if (event.type === "PushEvent" && event.payload?.commits) {
          const eventDate = new Date(event.created_at);
          if (eventDate > signupDate) {
            const commits = event.payload.commits.filter((commit: any) => {
              const commitDate = new Date(
                commit.author?.date || event.created_at
              );
              return commitDate > signupDate;
            });
            commitsOnPage += commits.length;
          }
        }
      }

      totalCommits += commitsOnPage;
      console.log(
        `Found ${commitsOnPage} commits on page ${page}, total: ${totalCommits}`
      );

      // If we got fewer events than per_page, we've reached the end
      if (events.length < perPage) {
        break;
      }

      page++;

      // Safety limit to prevent infinite loops
      if (page > 10) {
        console.log("Reached page limit, stopping");
        break;
      }
    }

    console.log(
      `Total commits found for ${username} after signup: ${totalCommits}`
    );
    return totalCommits;
  } catch (error) {
    console.error("Error in getCommitsAfterSignup:", error);
    throw error;
  }
};
