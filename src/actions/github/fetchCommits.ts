"use server";

import { GITHUB_REAUTH_MESSAGE } from "./syncConstants";
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

      if (response.status === 401) {
        throw new Error(GITHUB_REAUTH_MESSAGE);
      }

      const json = await response.json().catch(() => null);
      const errors: { type?: string; message?: string }[] =
        Array.isArray(json?.errors) ? json.errors : [];
      if (!response.ok || errors.length > 0 || !json) {
        console.error("GitHub contribution query failed", {
          status: response.status,
          requestId: response.headers.get("x-github-request-id"),
          errorTypes: errors.map((error) => error.type),
        });

        const rateLimited =
          response.status === 429 ||
          response.headers.get("retry-after") !== null ||
          response.headers.get("x-ratelimit-remaining") === "0" ||
          errors.some((error) => error.type === "RATE_LIMITED") ||
          [json?.message, ...errors.map((error) => error.message)].some(
            (message) => typeof message === "string" && /rate limit/i.test(message)
          );
        if (rateLimited) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const resetSeconds = Number(response.headers.get("x-ratelimit-reset"));
          const waitSeconds = Math.max(
            retryAfter,
            response.headers.get("x-ratelimit-remaining") === "0"
              ? resetSeconds - Date.now() / 1000
              : 0
          );
          const wait = Number.isFinite(waitSeconds) && waitSeconds > 0
            ? `${Math.ceil(waitSeconds / 60)}分ほど`
            : "しばらく";
          throw new Error(`GitHub APIの利用制限に達しました。${wait}待ってから再試行してください。`);
        }

        if (response.headers.get("x-github-sso")?.startsWith("required")) {
          throw new Error("GitHub組織のSSO認証が必要です。GitHubで組織のSSOを認証してから再試行してください。");
        }

        if (response.status === 403 || errors.some((error) => error.type === "FORBIDDEN")) {
          throw new Error("GitHubが同期リクエストを拒否しました。GitHubの設定でGit-RPGへのアクセス権を確認してください。");
        }

        throw new Error("GitHubからコミットを取得できませんでした。時間をおいて再試行してください。");
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
