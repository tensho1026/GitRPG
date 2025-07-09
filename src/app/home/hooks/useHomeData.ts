import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { UserWithStatus, Item, Avatar } from "@/types/user/userStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getHomeData } from "@/actions/user/getHomeData";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { updateCommits } from "@/actions/github/updateCommits";
import { getCommitsAfterSignup } from "@/actions/github/getCommitsAfterSignup";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expInfo, setExpInfo] = useState({});
  const [battleStatus, setBattleStatus] = useState<any>(null);
  const [equippedAvatar, setEquippedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // @ts-ignore - NextAuth v4 user property compatibility
      if (status === "authenticated" && session?.user?.email) {
        try {
          setIsLoading(true);

          // 1. Fetch current home data (includes commit count & signup date)
          // @ts-ignore - NextAuth v4 user property compatibility
          const initialHomeData = await getHomeData(session.user.email);

          // Guard in case user data not found
          if (!initialHomeData) {
            throw new Error("Home data not found");
          }

          // 2. Fetch GitHub contributions only if accessToken is available
          let githubCommitCount = initialHomeData.status?.commit ?? 0;

          console.log("🔍 [DEBUG] Commit sync debug info:", {
            // @ts-ignore - NextAuth v4 accessToken property compatibility
            hasAccessToken: !!session.accessToken,
            userCreatedAt: initialHomeData.user?.createdAt,
            currentCommitInDB: initialHomeData.status?.commit,
            // @ts-ignore - NextAuth v4 user property compatibility
            userEmail: session.user.email,
          });

          if (
            // @ts-ignore - NextAuth v4 accessToken property compatibility
            session.accessToken &&
            initialHomeData.user?.createdAt
          ) {
            try {
              console.log(
                "🚀 [DEBUG] Fetching GitHub commits from date:",
                initialHomeData.user.createdAt
              );

              // Ensure the date is in proper ISO format for GitHub API
              const fromDate = new Date(
                initialHomeData.user.createdAt
              ).toISOString();
              console.log("📅 [DEBUG] Formatted fromDate:", fromDate);

              // Check if this is a new user (created within last 24 hours)
              const userCreatedDate = new Date(initialHomeData.user.createdAt);
              const now = new Date();
              const hoursSinceCreation =
                (now.getTime() - userCreatedDate.getTime()) / (1000 * 60 * 60);
              const isNewUser = hoursSinceCreation < 24;

              console.log("👶 [DEBUG] New user check:", {
                userCreatedDate: userCreatedDate.toISOString(),
                hoursSinceCreation,
                isNewUser,
                currentCommitInDB: initialHomeData.status?.commit,
              });

              let contributions;

              // For new users with 0 commits, try both methods
              if (isNewUser && initialHomeData.status?.commit === 0) {
                console.log(
                  "🔄 [DEBUG] Trying alternative method for new user"
                );

                try {
                  // First, get the GitHub username via API
                  console.log("🔍 [DEBUG] Fetching GitHub username");
                  const userResponse = await fetch(
                    "https://api.github.com/user",
                    {
                      headers: {
                        Authorization: `token ${session.accessToken}`,
                        Accept: "application/vnd.github.v3+json",
                      },
                    }
                  );

                  if (!userResponse.ok) {
                    throw new Error(
                      `GitHub user API error: ${userResponse.status}`
                    );
                  }

                  const githubUser = await userResponse.json();
                  const githubUsername = githubUser.login;

                  console.log(
                    "👤 [DEBUG] GitHub username retrieved:",
                    githubUsername
                  );

                  // Try the getCommitsAfterSignup method first for new users
                  // @ts-ignore - NextAuth v4 user property compatibility
                  const alternativeCommits = await getCommitsAfterSignup(
                    githubUsername,
                    // @ts-ignore - NextAuth v4 accessToken property compatibility
                    session.accessToken,
                    // @ts-ignore - NextAuth v4 user property compatibility
                    session.user.email
                  );

                  console.log(
                    "🎯 [DEBUG] Alternative method result:",
                    alternativeCommits
                  );

                  // Fallback to GraphQL method
                  contributions = await fetchTotalContributions(
                    // @ts-ignore - NextAuth v4 accessToken property compatibility
                    session.accessToken,
                    fromDate
                  );

                  console.log(
                    "📊 [DEBUG] GraphQL method result:",
                    contributions
                  );

                  // Use the higher value between the two methods
                  githubCommitCount = Math.max(
                    alternativeCommits || 0,
                    contributions.commits || 0
                  );

                  console.log(
                    "🏆 [DEBUG] Using max commit count:",
                    githubCommitCount
                  );
                } catch (alternativeError) {
                  console.warn(
                    "⚠️ [DEBUG] Alternative method failed, using GraphQL only:",
                    alternativeError
                  );

                  contributions = await fetchTotalContributions(
                    // @ts-ignore - NextAuth v4 accessToken property compatibility
                    session.accessToken,
                    fromDate
                  );
                  githubCommitCount = Math.max(0, contributions.commits || 0);
                }
              } else {
                // For existing users, use the standard GraphQL method
                contributions = await fetchTotalContributions(
                  // @ts-ignore - NextAuth v4 accessToken property compatibility
                  session.accessToken,
                  fromDate
                );
                githubCommitCount = Math.max(0, contributions.commits || 0);
              }

              console.log("📊 [DEBUG] Final GitHub API response:", {
                contributions,
                finalCommitCount: githubCommitCount,
                previousCommitCount: initialHomeData.status?.commit,
              });

              // 3. Update DB only if commit count changed
              if (githubCommitCount !== initialHomeData.status?.commit) {
                console.log(
                  "🔄 [DEBUG] Updating commit count from",
                  initialHomeData.status?.commit,
                  "to",
                  githubCommitCount
                );

                // @ts-ignore - NextAuth v4 user property compatibility
                await updateCommits(session.user.email, githubCommitCount);

                // Re-fetch home data after update
                // @ts-ignore - NextAuth v4 user property compatibility
                const refreshedData = await getHomeData(session.user.email);
                if (refreshedData) {
                  initialHomeData.status = refreshedData.status;
                  initialHomeData.battleStatus = refreshedData.battleStatus;
                  initialHomeData.userWithStatus = refreshedData.userWithStatus;
                  initialHomeData.items = refreshedData.items;
                  initialHomeData.equippedAvatar = refreshedData.equippedAvatar;
                }

                console.log("✅ [DEBUG] Commit count updated successfully");
              } else {
                console.log(
                  "ℹ️ [DEBUG] No commit count update needed (same value)"
                );
              }
            } catch (error) {
              console.error("❌ [DEBUG] Failed to sync commits:", error);
            }
          } else {
            console.warn(
              "⚠️ [DEBUG] Skipping GitHub sync - missing accessToken or createdAt"
            );
          }

          const homeData = initialHomeData;

          // Set user status data
          setUserStatus(homeData.userWithStatus);

          // Set user items
          setUserItems(homeData.items);

          // Set battle status
          setBattleStatus(homeData.battleStatus);

          // Set equipped avatar
          setEquippedAvatar(homeData.equippedAvatar);

          // Calculate EXP info
          const totalCommits = homeData.status?.commit ?? 0;
          const expData = getRemainingCommitsToNextLevel(totalCommits);
          setExpInfo(expData);
        } catch (error) {
          console.error("Failed to fetch user data on home screen:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  return {
    userStatus,
    userItems,
    isLoading,
    expInfo,
    battleStatus,
    equippedAvatar,
  };
};
