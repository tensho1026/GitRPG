import { UserWithStatus } from "@/types/user/userStatus";
import { Coins, Crown, User } from "lucide-react";
import React from "react";

function Header({
  currentLevel,
  userStatus,
}: {
  currentLevel: number;
  userStatus: UserWithStatus;
}) {
  return (
    <div className="mb-6">
      <div
        className="border-4 p-6 pixel-border"
        style={{
          backgroundColor: "#1e40af",
          borderColor: "#fbbf24",
          boxShadow: "6px 6px 0px #1e3a8a, 12px 12px 0px rgba(0,0,0,0.6)",
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
              <Crown className="w-10 h-10" />
              RPG ダッシュボード
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-blue-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <User className="w-5 h-5" />
              <span className="pixel-text">Lv.{currentLevel}</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 border-3 text-blue-900 font-bold"
              style={{
                backgroundColor: "#fbbf24",
                borderColor: "#f59e0b",
                boxShadow: "3px 3px 0px #d97706",
              }}>
              <Coins className="w-5 h-5" />
              <span className="pixel-text">
                {userStatus?.status?.coin ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
