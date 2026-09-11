import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Star, TrendingUp } from "lucide-react";
import { UserWithStatus } from "@/types/user/userStatus";

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
    <div className="lg:col-span-2">
      <Card className="guild-panel h-full rounded-none border-2 py-0">
        <CardContent className="p-6">
          <div className="guild-section-title">
            <TrendingUp className="w-5 h-5" /><h2>Guild Status</h2>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="guild-stat">
              <div className="guild-stat__value text-2xl">
                Lv.{userStatus?.status?.level}
              </div>
              <div className="mt-1 text-xs text-stone-400">
                現在のレベル
              </div>
            </div>

            <div className="guild-stat">
              <div className="guild-stat__value">
                {userStatus?.status?.commit}
              </div>
              <div className="mt-1 text-xs text-stone-400">
                総コミット
              </div>
            </div>

            <div className="guild-stat">
              <div className="flex items-center justify-center mb-1">
                <Coins className="mr-1 w-5 h-5 text-amber-300" />
                <span className="guild-stat__value">
                  {userStatus?.status?.coin}
                </span>
              </div>
              <div className="mt-1 text-xs text-stone-400">
                所持コイン
              </div>
            </div>
          </div>

          <div className="guild-inset p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="mr-2 w-5 h-5 text-amber-300" />
              <span className="text-sm text-stone-300">
                次のレベルまで
              </span>
            </div>
            <div className="text-center mb-3">
              <span className="guild-title text-lg">
                あと{remainingCommits}コミット！
              </span>
            </div>
            <div className="guild-progress">
              <div
                style={{
                  width: `${progressPercentage}%`,
                }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserStatus;
