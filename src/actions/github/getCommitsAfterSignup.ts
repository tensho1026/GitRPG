"use server";

import {
  getAuthenticatedGitHubAccessToken,
  getAuthenticatedUserId,
} from "@/lib/authenticatedUser";
import { supabase } from "../../supabase/supabase.config";

export const getCommitsAfterSignup = async (): Promise<number> => {
  const userId = await getAuthenticatedUserId();
  const githubAccessToken = await getAuthenticatedGitHubAccessToken();

  try {
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitHub-RPG-App",
      },
    });

    if (!githubUserResponse.ok) {
      throw new Error(
        `GitHub user API error: ${githubUserResponse.status} ${githubUserResponse.statusText}`
      );
    }

    const githubUser = await githubUserResponse.json();
    if (typeof githubUser.login !== "string" || githubUser.login.length === 0) {
      throw new Error("GitHub username not found");
    }

    const username = githubUser.login;

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
    if (Number.isNaN(signupDate.getTime())) {
      throw new Error("Invalid user signup date");
    }

    let totalCommits = 0;
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(
          username
        )}/events?page=${page}&per_page=${perPage}`,
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
        break;
      }

      // Filter push events and count commits after signup
      let commitsOnPage = 0;
      let reachedSignup = false;
      for (const event of events) {
        const eventDate = new Date(event.created_at);
        if (!Number.isNaN(eventDate.getTime()) && eventDate <= signupDate) {
          reachedSignup = true;
          break;
        }

        if (
          event.type === "PushEvent" &&
          Array.isArray(event.payload?.commits)
        ) {
          if (!Number.isNaN(eventDate.getTime())) {
            const commits = event.payload.commits.filter((commit: any) => {
              const commitDate = new Date(
                commit.author?.date || event.created_at
              );
              return !Number.isNaN(commitDate.getTime()) && commitDate > signupDate;
            });
            commitsOnPage += commits.length;
          }
        }
      }

      totalCommits += commitsOnPage;

      // Events are newest first, so older pages cannot contain post-signup
      // activity after this point.
      if (reachedSignup || events.length < perPage) {
        break;
      }

      page++;

      // Safety limit to prevent infinite loops
      if (page > 10) {
        break;
      }
    }

    return totalCommits;
  } catch (error) {
    console.error("Error in getCommitsAfterSignup:", error);
    throw error;
  }
};
