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
      <Card className="bg-gradient-to-b from-blue-800/95 to-blue-900/95 border-4 border-cyan-400 shadow-2xl pixel-border h-full">
        <CardContent className="p-6">
          <div className="flex items-center mb-10">
            <TrendingUp className="w-6 h-6 text-cyan-300 mr-2" />
            <h2 className="text-cyan-200 text-lg pixel-text font-bold">
              📊 現在のステータス
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-20">
            <div className="bg-blue-700/60 p-4 rounded pixel-border border-2 border-cyan-400 text-center">
              <div className="text-cyan-300 text-2xl pixel-text font-bold">
                Lv.{userStatus?.status?.level}
              </div>
              <div className="text-blue-200 text-xs pixel-text">
                ✅ 現在のレベル
              </div>
            </div>

            <div className="bg-blue-700/60 p-4 rounded pixel-border border-2 border-cyan-400 text-center">
              <div className="text-cyan-300 text-xl pixel-text font-bold">
                {userStatus?.status?.commit}
              </div>
              <div className="text-blue-200 text-xs pixel-text">
                💻 総コミット数
              </div>
            </div>

            <div className="bg-yellow-600/80 p-4 rounded pixel-border border-2 border-yellow-400 text-center">
              <div className="flex items-center justify-center mb-1">
                <Coins className="w-5 h-5 text-yellow-200 mr-1" />
                <span className="text-yellow-100 text-xl pixel-text font-bold">
                  {userStatus?.status?.coin}
                </span>
              </div>
              <div className="text-yellow-200 text-xs pixel-text">
                🪙 コイン数
              </div>
            </div>
          </div>

          <div className="bg-purple-700/60 p-4 rounded pixel-border border-2 border-purple-400">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-purple-300 mr-2" />
              <span className="text-purple-200 text-sm pixel-text">
                次のレベルまで
              </span>
            </div>
            <div className="text-center mb-3">
              <span className="text-purple-100 text-lg pixel-text font-bold">
                あと{remainingCommits}コミット！
              </span>
            </div>
            <div className="w-full bg-purple-800 rounded-full h-3 border border-purple-400">
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-300 h-full rounded-full"
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
