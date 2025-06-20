"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, LogOut, Github, Map, Compass } from "lucide-react";
import Image from "next/image";
export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    console.log("Session Status:", status);
    console.log("Full Session:", session);
    console.log("User Name:", session?.user?.name);
    console.log("User Email:", session?.user?.email);
    console.log("User Image:", session?.user?.image);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/overworld-bg.png')",
            imageRendering: "pixelated",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-80 bg-emerald-800/95 border-4 border-emerald-600 shadow-2xl pixel-border">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Compass className="w-8 h-8 text-yellow-400 animate-spin" />
                </div>
                <p className="text-emerald-100 font-mono text-lg pixel-text">
                  冒険の準備中...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/overworld-bg.png')",
          imageRendering: "pixelated",
        }}
      />

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-[480px] bg-gradient-to-b from-emerald-800/95 to-emerald-900/95 border-4 border-yellow-500 shadow-2xl pixel-border backdrop-blur-sm">
          <CardContent className="p-8 relative">
            {/* Decorative corners with nature theme */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-yellow-400"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-yellow-400"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-yellow-400"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-yellow-400"></div>

            {session ? (
              <div className="space-y-6 text-center">
                {/* Adventure Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-emerald-700 p-3 rounded pixel-border border-2 border-yellow-500 relative">
                      <Map className="w-8 h-8 text-yellow-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-yellow-200 mb-2 pixel-text">
                    ～ 冒険者の地図 ～
                  </h1>
                  <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
                </div>

                {/* Adventurer Status */}
                <div className="bg-emerald-700/80 p-5 rounded pixel-border border-2 border-yellow-500">
                  <div className="flex items-center justify-center mb-3">
                    <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="text-yellow-200 font-mono text-sm pixel-text">
                      登録済み冒険者
                    </span>
                  </div>

                  <div className="flex items-center justify-center mb-3">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full border-2 border-yellow-400 mr-3 pixelated"
                        width={48}
                        height={48}
                      />
                    )}
                    <div className="text-center">
                      <p className="text-yellow-100 font-mono text-xl pixel-text font-bold">
                        {session.user?.name}
                      </p>
                      <p className="text-emerald-200 font-mono text-xs pixel-text">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-emerald-200 font-mono text-sm pixel-text">
                    世界を旅する準備が整いました！
                  </p>
                </div>

                {/* Adventure Stats */}
                <div className="bg-emerald-600/60 p-4 rounded pixel-border border-2 border-yellow-400 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-yellow-300 font-mono text-lg pixel-text font-bold">
                        Lv.1
                      </div>
                      <div className="text-emerald-200 font-mono text-xs pixel-text">
                        レベル
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-300 font-mono text-lg pixel-text font-bold">
                        100
                      </div>
                      <div className="text-emerald-200 font-mono text-xs pixel-text">
                        HP
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-300 font-mono text-lg pixel-text font-bold">
                        50
                      </div>
                      <div className="text-emerald-200 font-mono text-xs pixel-text">
                        MP
                      </div>
                    </div>
                  </div>

                  {/* Experience Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-emerald-200 font-mono text-xs pixel-text mb-1">
                      <span>EXP</span>
                      <span>75/100</span>
                    </div>
                    <div className="w-full bg-emerald-800 rounded-full h-2 border border-yellow-500">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full"
                        style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Return to Town Button */}
                <Button
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="w-full h-12 bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 border-4 border-orange-500 text-white font-mono font-bold pixel-text shadow-lg transform hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-150 pixel-border">
                  <LogOut className="w-5 h-5 mr-2" />
                  町に戻る
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                {/* Adventure Title */}
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-emerald-700 p-4 rounded pixel-border border-2 border-yellow-500 relative">
                      <Compass className="w-10 h-10 text-yellow-300" />
                      <div className="absolute -top-2 -right-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-yellow-200 mb-2 pixel-text">
                    大冒険への招待
                  </h1>
                  <div className="w-32 h-1 bg-yellow-500 mx-auto mb-3"></div>
                  <p className="text-emerald-200 font-mono text-sm pixel-text">
                    ～ 未知なる世界が君を待っている ～
                  </p>
                </div>

                {/* Adventure Description */}
                <div className="bg-emerald-700/80 p-6 rounded pixel-border border-2 border-yellow-500">
                  <div className="flex items-center justify-center mb-3">
                    <Map className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="text-yellow-200 font-mono text-sm pixel-text">
                      冒険者募集中
                    </span>
                  </div>
                  <p className="text-emerald-100 font-mono text-sm pixel-text mb-2">
                    広大な世界が君の到着を待っている。
                  </p>
                  <p className="text-emerald-200 font-mono text-xs pixel-text">
                    森、川、山、城...無限の冒険が始まる！
                  </p>
                </div>

                {/* Start Adventure Button */}
                <Button
                  onClick={() => signIn("github")}
                  className="w-full h-14 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-4 border-blue-500 text-white font-mono font-bold text-lg pixel-text shadow-lg transform hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-150 pixel-border relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Github className="w-6 h-6 mr-3" />
                  冒険を始める
                </Button>

                {/* Terrain indicators */}
                <div className="flex justify-center space-x-4 mt-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-500 pixel-art mb-1"></div>
                    <span className="text-emerald-300 font-mono text-xs pixel-text">
                      草原
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-500 pixel-art mb-1"></div>
                    <span className="text-blue-300 font-mono text-xs pixel-text">
                      河川
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-gray-500 pixel-art mb-1"></div>
                    <span className="text-gray-300 font-mono text-xs pixel-text">
                      山脈
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
