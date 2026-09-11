"use client";

import { signIn } from "next-auth/react";

export default function GitHubPermissionNotice() {
  const includePrivate =
    process.env.NEXT_PUBLIC_GITHUB_INCLUDE_PRIVATE_CONTRIBUTIONS === "true";

  return (
    <div className="guild-inset mt-4 p-3 text-left text-xs text-stone-400">
      <p className="font-bold text-amber-200">GitHub権限について</p>
      <p className="mt-1 leading-5">
        プロフィールとメールアドレスを使ってログインし、公開Contributionを取得します。
        {includePrivate
          ? "非公開リポジトリのContributionも取得する設定です。"
          : "非公開リポジトリは対象外です。"}
      </p>
      <button
        type="button"
        onClick={() =>
          void signIn(
            "github",
            { callbackUrl: "/home" },
            { prompt: "consent" }
          )
        }
        className="mt-2 min-h-10 text-amber-200 underline hover:text-white focus-visible:outline-2 focus-visible:outline-yellow-300">
        権限を確認して再認証
      </button>
    </div>
  );
}
