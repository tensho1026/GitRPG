"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shirt, Heart, Sword, Shield } from "lucide-react";
import type { Item, Avatar as UserAvatar } from "@/types/user/userStatus";
import Image from "next/image";
import Link from "next/link";

interface MyAvatarProps {
  userItems?: Pick<Item, "id" | "name" | "image" | "type" | "equipped">[];
  equippedAvatar?: UserAvatar | null;
}

export default function MyAvatar({ userItems, equippedAvatar }: MyAvatarProps) {
  const statIcons = {
    hp: <Heart className="w-4 h-4 text-green-400" />,
    attack: <Sword className="w-4 h-4 text-red-400" />,
    defense: <Shield className="w-4 h-4 text-blue-400" />,
  };

  return (
    <div className="lg:col-span-1">
      <div className="relative">
        {/* Gradient Border Frame */}
        <div
          className="absolute inset-0 rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(45deg, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444)",
            backgroundSize: "300% 300%",
            animation: "gradientShift 6s ease infinite",
          }}>
          <div className="w-full h-full bg-gradient-to-b from-purple-800/95 to-purple-900/95 rounded-xl" />
        </div>

        {/* Main Card Content */}
        <Card className="relative bg-transparent border-0 shadow-none">
          <CardContent className="p-6 flex flex-col h-full relative z-10">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-pink-300 mr-2" />
              <h2 className="text-pink-200 text-lg pixel-text font-bold">
                👤 マイアバター
              </h2>
            </div>

            {/* Avatar Display Container */}
            <div className="bg-purple-700/40 p-6 rounded-xl pixel-border border-3 border-pink-400/60 text-center mb-4 flex-1 flex flex-col justify-center">
              {/* Character Avatar Frame */}
              <div className="relative mx-auto mb-6">
                <div
                  className="w-32 h-40 mx-auto bg-gradient-to-b from-purple-600/60 to-purple-700/60 rounded-lg pixel-border border-3 border-pink-300/80 flex items-center justify-center overflow-hidden"
                  style={{
                    boxShadow:
                      "inset 0 2px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)",
                  }}>
                  {equippedAvatar ? (
                    <Image
                      src={equippedAvatar.image}
                      alt={equippedAvatar.name}
                      width={120}
                      height={150}
                      className="object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="text-pink-200 text-sm pixel-text">
                      アバター未選択
                    </div>
                  )}
                </div>
              </div>

              {/* Character Info */}
              <div className="space-y-3">
                <p className="text-pink-100 text-lg pixel-text font-bold">
                  {equippedAvatar ? equippedAvatar.name : "戦士"}
                </p>

                {/* Avatar Stats */}
                {equippedAvatar && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-200 text-sm pixel-text">
                      {statIcons.hp}
                      <span>HP +{equippedAvatar.hp || 0}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-red-200 text-sm pixel-text">
                      {statIcons.attack}
                      <span>攻撃 +{equippedAvatar.attack || 0}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-blue-200 text-sm pixel-text">
                      {statIcons.defense}
                      <span>防御 +{equippedAvatar.defense || 0}</span>
                    </div>
                  </div>
                )}

                <p className="text-purple-200 text-sm pixel-text">
                  装備中:{" "}
                  <span className="text-pink-300 font-bold">
                    {userItems?.find(
                      (item) => item.type === "weapon" && item.equipped
                    )?.name || "未装備"}
                  </span>
                </p>
              </div>
            </div>

            {/* Dress Up Button */}
            <Link href="/avatar">
              <Button
                className="w-full bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 border-3 border-pink-400 text-white font-bold pixel-text text-base py-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                style={{
                  boxShadow: "0 4px 0 #be185d, 0 6px 12px rgba(0,0,0,0.4)",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                }}>
                <Shirt className="w-4 h-4 mr-2" />
                アバター変更
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Keyframes for gradient animation */}
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
      `}</style>
    </div>
  );
}
