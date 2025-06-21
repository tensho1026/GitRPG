"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getUserCurrentItems } from "@/actions/item/getUserCurrentitems";
import { Items, Users } from "@/generated/prisma";
import { Sword, Calendar, Crown, User, Coins, Target } from "lucide-react";
import UserBasicInfo from "./UserBasicInfo";
import UserStatus from "./UserStatus";
import MyAvatar from "./MyAvatar";

export default function HomeScreen() {
  const { data: session, status } = useSession();
  const [userStatus, setUserStatus] = useState<
    | (Users & {
        status: {
          commit: number;
          level: number;
          coin: number;
          hp: number;
          attack: number;
          defense: number;
        } | null;
      })
    | null
  >(null);
  const [userItems, setUserItems] = useState<Items[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        session.accessToken
      ) {
        try {
          const statusResult = await getUserStatus(session.user.email);
          if (statusResult) {
            setUserStatus(statusResult);

            const items = await getUserCurrentItems(session.user.email);

            if (items) {
              setUserItems(items);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data on home screen:", error);
        }
      }
    };

    fetchData();
  }, [status, session]);

  const { currentLevel, remainingCommits, progressPercentage } = useMemo(() => {
    const totalCommits = userStatus?.status?.commit ?? 0;
    const { remainingCommits, percentage } =
      getRemainingCommitsToNextLevel(totalCommits);
    return {
      currentLevel: userStatus?.status?.level ?? 1,
      remainingCommits: remainingCommits,
      progressPercentage: percentage,
    };
  }, [userStatus]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/newhomepage.JPG)",
          zIndex: -1,
        }}
      />
      <div className="absolute inset-0" />

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* User Basic Information */}
          <UserBasicInfo
            userData={{
              name: userStatus?.name || "",
              username: session?.user?.email || "",
              avatar: userStatus?.image || "",
              githubUrl: `https://github.com/${userStatus?.name}`,
              registrationDate:
                userStatus?.createdAt?.toLocaleDateString() || "",
            }}
          />

          {/* User Status */}
          <UserStatus
            currentLevel={currentLevel}
            totalCommits={userStatus?.status?.commit ?? 0}
            coins={userStatus?.status?.coin ?? 0}
            remainingCommits={remainingCommits}
            progressPercentage={progressPercentage}
          />

          {/* Avatar Display */}
          <MyAvatar userItems={userItems} />
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Avatar Button */}
          <button
            onClick={() => (window.location.href = "/avatar")}
            className="p-6 border-4 font-bold pixel-text text-xl transform transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#7c3aed",
              borderColor: "#a78bfa",
              color: "white",
              boxShadow: "6px 6px 0px #5b21b6, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="w-8 h-8" />
              <span className="text-2xl">アバター</span>
            </div>
            <p className="text-purple-200 text-sm">
              キャラクター選択・カスタマイズ
            </p>
          </button>

          {/* Battle Status Button */}
          <button
            onClick={() => (window.location.href = "/battle")}
            className="p-6 border-4 font-bold pixel-text text-xl transform transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#ea580c",
              borderColor: "#fb923c",
              color: "white",
              boxShadow: "6px 6px 0px #c2410c, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Target className="w-8 h-8" />
              <span className="text-2xl">戦闘</span>
            </div>
            <p className="text-orange-200 text-sm">HP・攻撃力・防御力</p>
          </button>

          {/* Equipment Button */}
          <button
            onClick={() => (window.location.href = "/item")}
            className="p-6 border-4 font-bold pixel-text text-xl transform transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#f87171",
              color: "white",
              boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sword className="w-8 h-8" />
              <span className="text-2xl">装備</span>
            </div>
            <p className="text-red-200 text-sm">武器・防具の購入・装備</p>
          </button>

          {/* Grass Button */}
          <button
            onClick={() => (window.location.href = "/grass")}
            className="p-6 border-4 font-bold pixel-text text-xl transform transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#059669",
              borderColor: "#34d399",
              color: "white",
              boxShadow: "6px 6px 0px #047857, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="w-8 h-8" />
              <span className="text-2xl">草</span>
            </div>
            <p className="text-green-200 text-sm">コミット履歴・活動記録</p>
          </button>
        </div>
      </div>

      <style jsx>{`
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }
        .pixel-text {
          font-family: "Courier New", monospace;
          font-weight: bold;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
