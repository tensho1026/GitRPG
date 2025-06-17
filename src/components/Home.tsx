"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Github,
  Calendar,
  Coins,
  Zap,
  Sword,
  Shield,
  Shirt,
  Star,
  TrendingUp,
  MapPin,
  User,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomeScreen() {
  const { data: session } = useSession();
  // const maxCommitsInDay = Math.max(...userData.weeklyCommits)
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  // Mock data - replace with real user data
  const userData = {
    name: `冒険者${session?.user?.name}`,
    username: session?.user?.email,
    avatar: session?.user?.image,
    githubUrl: `https://github.com/${session?.user?.name}`,
    registrationDate: "2024年1月15日",
    level: 12,
    totalCommits: 247,
    coins: 1850,
    commitsToNextLevel: 23,
    equippedItems: {
      weapon: "魔法の剣",
      armor: "竜鱗の鎧",
      accessory: "知恵の指輪",
    },
    totalItems: 15,
    weeklyCommits: [2, 0, 5, 3, 1, 4, 6], // Last 7 days
    thisWeekTotal: 21,
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/overworld-bg.png')",
          imageRendering: "pixelated",
        }}
      />
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Top Row - User Info (small) + Status (large) + Avatar (medium) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* User Basic Information - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-emerald-800/95 to-emerald-900/95 border-4 border-yellow-500 shadow-2xl pixel-border h-full">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                  <h2 className="text-yellow-200 font-mono text-sm pixel-text font-bold">
                    🔑 冒険者情報
                  </h2>
                </div>

                <div className="text-center mb-3">
                  <div className="relative inline-block">
                    <Image
                      src={userData.avatar || "/placeholder.svg"}
                      alt="User Avatar"
                      className="w-16 h-16 rounded-full border-3 border-yellow-400 pixelated mx-auto"
                      width={64}
                      height={64}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-yellow-100 font-mono text-lg pixel-text font-bold mt-2">
                    {userData.name}
                  </h3>
                  <p className="text-emerald-200 font-mono text-xs pixel-text">
                    @{userData.username}
                  </p>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-emerald-300 font-mono text-xs pixel-text">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{userData.registrationDate}</span>
                  </div>
                </div>

                {userData.githubUrl && (
                  <Link href={userData.githubUrl}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gray-800/80 border-2 border-gray-600 text-gray-200 hover:bg-gray-700/80 pixel-border text-xs">
                      <Github className="w-3 h-3 mr-1" />
                      GitHub
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Status - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-b from-blue-800/95 to-blue-900/95 border-4 border-cyan-400 shadow-2xl pixel-border h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-300 mr-2" />
                  <h2 className="text-cyan-200 font-mono text-lg pixel-text font-bold">
                    📊 現在のステータス
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-700/60 p-4 rounded pixel-border border-2 border-cyan-400 text-center">
                    <div className="text-cyan-300 font-mono text-2xl pixel-text font-bold">
                      Lv.{userData.level}
                    </div>
                    <div className="text-blue-200 font-mono text-xs pixel-text">
                      ✅ 現在のレベル
                    </div>
                  </div>

                  <div className="bg-blue-700/60 p-4 rounded pixel-border border-2 border-cyan-400 text-center">
                    <div className="text-cyan-300 font-mono text-xl pixel-text font-bold">
                      {userData.totalCommits}
                    </div>
                    <div className="text-blue-200 font-mono text-xs pixel-text">
                      💻 総コミット数
                    </div>
                  </div>

                  <div className="bg-yellow-600/80 p-4 rounded pixel-border border-2 border-yellow-400 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Coins className="w-5 h-5 text-yellow-200 mr-1" />
                      <span className="text-yellow-100 font-mono text-xl pixel-text font-bold">
                        {userData.coins}
                      </span>
                    </div>
                    <div className="text-yellow-200 font-mono text-xs pixel-text">
                      🪙 コイン数
                    </div>
                  </div>
                </div>

                <div className="bg-purple-700/60 p-4 rounded pixel-border border-2 border-purple-400">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-purple-300 mr-2" />
                    <span className="text-purple-200 font-mono text-sm pixel-text">
                      次のレベルまで
                    </span>
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-purple-100 font-mono text-lg pixel-text font-bold">
                      あと{userData.commitsToNextLevel}コミット！
                    </span>
                  </div>
                  <div className="w-full bg-purple-800 rounded-full h-3 border border-purple-400">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-300 h-full rounded-full"
                      style={{
                        width: `${((userData.totalCommits % 50) / 50) * 100}%`,
                      }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Display - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-purple-800/95 to-purple-900/95 border-4 border-pink-400 shadow-2xl pixel-border h-full">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-pink-300 mr-2" />
                  <h2 className="text-pink-200 font-mono text-sm pixel-text font-bold">
                    👤 マイアバター
                  </h2>
                </div>

                <div className="bg-purple-700/60 p-4 rounded pixel-border border-2 border-pink-400 text-center">
                  {/* Character Avatar Display */}
                  <div className="relative w-24 h-32 mx-auto mb-3 bg-purple-600/40 rounded pixel-border border-2 border-pink-300 flex items-end justify-center">
                    {/* Character Body */}
                    <div className="w-16 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg pixel-border border-2 border-amber-500 relative">
                      {/* Head */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full border-2 border-amber-300"></div>

                      {/* Weapon (Sword) */}
                      <div className="absolute -right-3 top-2 w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded pixel-border">
                        <div className="absolute -top-1 -left-1 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-sm"></div>
                      </div>

                      {/* Shield */}
                      <div className="absolute -left-3 top-3 w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded pixel-border border border-blue-400"></div>

                      {/* Armor details */}
                      <div className="absolute inset-2 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded pixel-border border border-emerald-500"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-pink-100 font-mono text-xs pixel-text font-bold">
                      Lv.{userData.level} 戦士
                    </p>
                    <p className="text-purple-200 font-mono text-xs pixel-text">
                      装備中: {userData.equippedItems.weapon}
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-3 bg-gradient-to-b from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 border-4 border-pink-500 text-white font-mono font-bold pixel-text pixel-border text-xs">
                  <Shirt className="w-3 h-3 mr-1" />
                  着せ替え
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Equipment (medium) + Activity (large) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Status - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-red-800/95 to-red-900/95 border-4 border-orange-400 shadow-2xl pixel-border h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Sword className="w-6 h-6 text-orange-300 mr-2" />
                    <h2 className="text-orange-200 font-mono text-lg pixel-text font-bold">
                      🧍‍♂️ 装備状況
                    </h2>
                  </div>
                  <Badge className="bg-orange-600 text-orange-100 pixel-border">
                    {userData.totalItems}個所持
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
                    <div className="flex items-center">
                      <Sword className="w-5 h-5 text-orange-300 mr-2" />
                      <span className="text-red-200 font-mono text-sm pixel-text">
                        武器
                      </span>
                    </div>
                    <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                      {userData.equippedItems.weapon}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-orange-300 mr-2" />
                      <span className="text-red-200 font-mono text-sm pixel-text">
                        防具
                      </span>
                    </div>
                    <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                      {userData.equippedItems.armor}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-orange-300 mr-2" />
                      <span className="text-red-200 font-mono text-sm pixel-text">
                        装飾品
                      </span>
                    </div>
                    <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                      {userData.equippedItems.accessory}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 border-4 border-orange-500 text-white font-mono font-bold pixel-text pixel-border">
                  <Shirt className="w-4 h-4 mr-2" />
                  装備変更
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-b from-green-800/95 to-green-900/95 border-4 border-lime-400 shadow-2xl pixel-border h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-lime-300 mr-2" />
                    <h2 className="text-lime-200 font-mono text-lg pixel-text font-bold">
                      📈 週間アクティビティ
                    </h2>
                  </div>
                  <Badge className="bg-lime-600 text-lime-100 pixel-border">
                    今週: {userData.thisWeekTotal}件
                  </Badge>
                </div>

                <div className="bg-green-700/60 p-4 rounded pixel-border border-2 border-lime-400">
                  <div className="grid grid-cols-7 gap-3 mb-4">
                    {days.map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-green-200 font-mono text-sm pixel-text mb-2">
                          {day}
                        </div>
                        <div
                          className={`w-12 h-12 rounded pixel-border border-2 flex items-center justify-center font-mono text-sm pixel-text font-bold ${
                            userData.weeklyCommits[index] === 0
                              ? "bg-green-800 border-green-600 text-green-400"
                              : userData.weeklyCommits[index] <= 2
                              ? "bg-lime-700 border-lime-500 text-lime-100"
                              : userData.weeklyCommits[index] <= 4
                              ? "bg-lime-500 border-lime-300 text-lime-900"
                              : "bg-lime-300 border-lime-100 text-lime-900"
                          }`}>
                          {userData.weeklyCommits[index]}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-green-200 font-mono text-lg pixel-text">
                      🌱 コミットの草を育てよう！
                    </p>
                    <p className="text-green-300 font-mono text-sm pixel-text mt-1">
                      継続は力なり - 毎日少しずつでも成長しよう
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
