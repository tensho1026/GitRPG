import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, ScrollText, Sparkles, Swords, TrendingUp } from "lucide-react";
import { UserWithStatus } from "@/types/user/userStatus";
import Link from "next/link";

type UserStatusProps = {
  userStatus: UserWithStatus;
  remainingCommits: number;
  progressPercentage: number;
};

function UserStatus({
  userStatus,
  remainingCommits,
  progressPercentage,
}: UserStatusProps) {
  return (
    <Card className="guild-panel h-full rounded-none border-2 py-0">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="guild-section-title">
          <ScrollText className="h-5 w-5" /><h2>Next Quest</h2>
        </div>

        <div className="guild-quest-layout mb-5 flex-1">
          <div>
            <p className="guild-kicker mb-2">次の目標</p>
            <h3 className="guild-title mb-3 text-2xl sm:text-3xl">
              あと{remainingCommits}コミットで Lv.{(userStatus?.status?.level ?? 0) + 1}
            </h3>
            <p className="mb-5 max-w-xl text-sm leading-6 text-stone-300">
              GitHubで活動して次のレベルへ。進捗を確認するか、装備を整えて冒険に出よう。
            </p>

            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs text-stone-300">
              <span>レベル進捗</span>
              <strong className="text-amber-200">{Math.round(progressPercentage)}%</strong>
            </div>
            <div
              className="guild-progress"
              role="progressbar"
              aria-label="次のレベルまでの進捗"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercentage)}>
              <div style={{ width: `${progressPercentage}%` }} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/game" className="guild-button px-5">
                <Swords className="h-4 w-4" />冒険を始める
              </Link>
              <Link href="/grass" className="guild-button guild-button--stone px-5">
                <TrendingUp className="h-4 w-4" />活動を見る
              </Link>
            </div>
          </div>
          <div className="guild-quest-emblem" aria-hidden="true">
            <Flag className="h-14 w-14" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="guild-stat">
            <div className="guild-stat__value">Lv.{userStatus?.status?.level}</div>
            <div className="mt-1 text-[11px] text-stone-400">現在レベル</div>
          </div>
          <div className="guild-stat">
            <div className="guild-stat__value">{userStatus?.status?.commit}</div>
            <div className="mt-1 text-[11px] text-stone-400">総コミット</div>
          </div>
          <div className="guild-stat">
            <div className="flex items-center justify-center gap-1 guild-stat__value">
              <Sparkles className="h-4 w-4" />{remainingCommits}
            </div>
            <div className="mt-1 text-[11px] text-stone-400">次Lvまで</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserStatus;
