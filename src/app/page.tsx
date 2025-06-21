"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect to home if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  // Don't render the landing page if user is authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                  🎮 RPG Developer Quest
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                コードを書いて
                <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent block">
                  レベルアップ！
                </span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                GitHubのコミット履歴をRPG風に可視化。
                <br />
                毎日のコーディングが冒険になる、
                <br />
                開発者のためのゲーミフィケーションアプリ
              </p>

              <div className="space-y-4 text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>GitHubと連携してコミット数を自動取得</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>レベルアップ・装備・ステータス管理</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>ドット絵アバターでキャラクターカスタマイズ</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Github className="mr-3 h-5 w-5" />
                  GitHubでログイン
                </Button>
              </Link>

              <div className="text-sm text-gray-400">
                ※ GitHubアカウントが必要です
              </div>
            </div>
          </div>

          {/* Right side - Images */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-white font-bold text-sm text-center">
                📊 ステータス
              </h3>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/equipmentStatus.png"
                  alt="RPG Status Screen"
                  width={220}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-sm text-center">
                ⚔️ 装備・戦闘
              </h3>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/commitStatus.png"
                  alt="RPG Equipment Screen"
                  width={220}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}
