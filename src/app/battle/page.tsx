"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Sword, Shield, Heart, Zap, Target } from "lucide-react";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import CombatStatus from "@/app/item/components/CombatStatus";

export default function BattlePage() {
  const { data: session, status } = useSession();
  const [battleStatus, setBattleStatus] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  console.log("aaaaa");

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const [battleStats, userStatus] = await Promise.all([
            getCurrentUserBattleStatus(session.user.email),
            getUserStatus(session.user.email),
          ]);

          if (battleStats) {
            setBattleStatus(battleStats);
          }
          if (userStatus?.status?.level) {
            setUserLevel(userStatus.status.level);
          }
        } catch (error) {
          console.error("Failed to fetch battle data:", error);
        }
      }
    };

    fetchData();
  }, [status, session]);

  return (
    <div
      className="min-h-screen p-4 font-mono"
      style={{
        background:
          "linear-gradient(45deg, #ea580c 0%, #f97316 25%, #fb923c 50%, #fdba74 75%, #fed7aa 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 8s ease infinite",
      }}>
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#ea580c",
              borderColor: "#fbbf24",
              boxShadow: "6px 6px 0px #c2410c, 12px 12px 0px rgba(0,0,0,0.6)",
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => (window.location.href = "/home")}
                  className="p-3 border-3 bg-orange-600 border-orange-400 text-white pixel-border hover:bg-orange-500"
                  style={{ boxShadow: "3px 3px 0px #c2410c" }}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
                  <Target className="w-10 h-10" />
                  戦闘ステータス
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
                  style={{
                    backgroundColor: "#fbbf24",
                    borderColor: "#f59e0b",
                    boxShadow: "3px 3px 0px #d97706",
                  }}>
                  <Zap className="w-5 h-5" />
                  <span className="pixel-text">Lv.{userLevel}</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 border-3 text-orange-900 font-bold"
                  style={{
                    backgroundColor: "#fbbf24",
                    borderColor: "#f59e0b",
                    boxShadow: "3px 3px 0px #d97706",
                  }}>
                  <Heart className="w-5 h-5" />
                  <span className="pixel-text">HP: {battleStatus.hp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Status Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Combat Status Card */}
          <div className="lg:col-span-2">
            <CombatStatus
              hp={battleStatus.hp}
              attack={battleStatus.attack}
              defense={battleStatus.defense}
            />
          </div>

          {/* Battle Info Cards */}
          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#f87171",
              boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center gap-3 mb-4">
              <Sword className="w-8 h-8 text-red-200" />
              <h2 className="text-2xl font-bold text-white pixel-text">
                攻撃力
              </h2>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-red-200 pixel-text mb-2">
                {battleStatus.attack}
              </div>
              <p className="text-red-300 pixel-text">敵に与えるダメージ</p>
            </div>
          </div>

          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#2563eb",
              borderColor: "#60a5fa",
              boxShadow: "6px 6px 0px #1d4ed8, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-200" />
              <h2 className="text-2xl font-bold text-white pixel-text">
                防御力
              </h2>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-200 pixel-text mb-2">
                {battleStatus.defense}
              </div>
              <p className="text-blue-300 pixel-text">受けるダメージ軽減</p>
            </div>
          </div>
        </div>

        {/* Battle Tips */}
        <div className="mt-6">
          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#059669",
              borderColor: "#34d399",
              boxShadow: "6px 6px 0px #047857, 12px 12px 0px rgba(0,0,0,0.4)",
            }}>
            <h3 className="text-xl font-bold text-white pixel-text mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              戦闘のヒント
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-200 pixel-text">
              <div>
                <p className="font-bold mb-2">💡 攻撃力を上げるには:</p>
                <ul className="text-sm space-y-1">
                  <li>• 武器を装備する</li>
                  <li>• アバターを変更する</li>
                  <li>• レベルアップする</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">🛡️ 防御力を上げるには:</p>
                <ul className="text-sm space-y-1">
                  <li>• 防具を装備する</li>
                  <li>• 守護者アバターを選択</li>
                  <li>• レベルアップする</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
