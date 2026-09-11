"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shirt, Heart, Sword, Shield } from "lucide-react";
import type { HomeItem, HomeAvatar } from "@/types/user/userStatus";
import Image from "next/image";
import Link from "next/link";

interface MyAvatarProps {
  userItems?: Pick<HomeItem, "id" | "name" | "image" | "type" | "equipped">[];
  equippedAvatar?: HomeAvatar | null;
}

export default function MyAvatar({ userItems, equippedAvatar }: MyAvatarProps) {
  const statIcons = {
    hp: <Heart className="w-4 h-4 text-green-400" />,
    attack: <Sword className="w-4 h-4 text-red-400" />,
    defense: <Shield className="w-4 h-4 text-blue-400" />,
  };

  return (
    <div className="lg:col-span-1">
      <div className="relative h-full">
        <Card className="guild-panel h-full rounded-none border-2 py-0">
          <CardContent className="p-6 flex flex-col h-full relative z-10">
            <div className="flex items-center mb-4">
              <User className="mr-2 w-5 h-5 text-amber-300" />
              <h2 className="guild-section-title mb-0 flex-1">Avatar</h2>
            </div>

            {/* Avatar Display Container */}
            <div className="guild-inset mb-4 flex flex-1 flex-col justify-center p-5 text-center">
              {/* Character Avatar Frame */}
              <div className="relative mx-auto mb-6">
                <div
                  className="mx-auto flex h-40 w-32 items-center justify-center overflow-hidden border-2 border-amber-700/70 bg-black/25">
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
                    <div className="text-sm text-stone-400">
                      アバター未選択
                    </div>
                  )}
                </div>
              </div>

              {/* Character Info */}
              <div className="space-y-3">
                <p className="guild-title text-lg">
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

                <p className="text-sm text-stone-400">
                  装備中:{" "}
                  <span className="font-bold text-amber-200">
                    {userItems?.find(
                      (item) => item.type === "weapon" && item.equipped
                    )?.name || "未装備"}
                  </span>
                </p>
              </div>
            </div>

            {/* Dress Up Button */}
            <Button asChild>
              <Link
                href="/avatar"
                aria-label="アバター変更画面を開く"
                className="guild-button w-full text-sm">
                <Shirt className="w-4 h-4 mr-2" />
                アバター変更
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
