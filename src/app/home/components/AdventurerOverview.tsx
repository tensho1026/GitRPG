"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, Crown, Github, Heart, LogOut, Shield, Sword } from "lucide-react";
import type { HomeAvatar, HomeItem } from "@/types/user/userStatus";

interface AdventurerOverviewProps {
  userData: {
    name: string;
    username: string;
    avatar: string;
    githubUrl: string;
  };
  userItems?: Pick<HomeItem, "id" | "name" | "type" | "equipped">[];
  equippedAvatar?: HomeAvatar | null;
}

export default function AdventurerOverview({
  userData,
  userItems,
  equippedAvatar,
}: AdventurerOverviewProps) {
  const weapon = userItems?.find(
    (item) => item.type === "weapon" && item.equipped
  );

  return (
    <aside className="guild-panel h-full p-5 sm:p-6">
      <div className="guild-section-title">
        <Crown className="h-5 w-5" />
        <h2>Adventurer</h2>
      </div>

      <div className="mb-5 flex items-center gap-3 border-b border-amber-800/40 pb-4">
        {userData.avatar ? (
          <Image
            src={userData.avatar}
            alt="GitHubプロフィール画像"
            width={48}
            height={48}
            className="h-12 w-12 border border-amber-600 object-cover pixelated"
          />
        ) : (
          <div className="h-12 w-12 border border-amber-600 bg-black/25" />
        )}
        <div className="min-w-0">
          <h3 className="guild-title truncate text-lg">{userData.name}</h3>
          <p className="truncate font-mono text-xs text-stone-400">
            @{userData.username}
          </p>
        </div>
      </div>

      <div className="guild-inset mb-4 p-4 text-center">
        <div className="mx-auto mb-3 flex h-36 w-28 items-center justify-center overflow-hidden border-2 border-amber-700/70 bg-black/25">
          {equippedAvatar ? (
            <Image
              src={equippedAvatar.image}
              alt={equippedAvatar.name}
              width={112}
              height={140}
              className="h-full w-full object-contain [image-rendering:pixelated]"
            />
          ) : (
            <span className="text-xs text-stone-400">未選択</span>
          )}
        </div>
        <p className="guild-title mb-3 text-lg">
          {equippedAvatar?.name ?? "アバター未選択"}
        </p>
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <span className="guild-stat px-1 py-2 text-green-200">
            <Heart className="mx-auto mb-1 h-4 w-4" />+{equippedAvatar?.hp ?? 0}
          </span>
          <span className="guild-stat px-1 py-2 text-red-200">
            <Sword className="mx-auto mb-1 h-4 w-4" />+{equippedAvatar?.attack ?? 0}
          </span>
          <span className="guild-stat px-1 py-2 text-blue-200">
            <Shield className="mx-auto mb-1 h-4 w-4" />+{equippedAvatar?.defense ?? 0}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 font-mono text-xs text-stone-300">
        <span>装備中</span>
        <strong className="text-right text-amber-200">
          {weapon?.name ?? "未装備"}
        </strong>
      </div>

      <Link href="/avatar" className="guild-button mb-3 w-full text-sm">
        装備と姿を変更
      </Link>

      <details className="guild-account-menu">
        <summary>
          <span>アカウント</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </summary>
        <div className="grid gap-2 pt-2">
          <Link href={userData.githubUrl} className="guild-button guild-button--stone text-xs">
            <Github className="h-4 w-4" />GitHubプロフィール
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="guild-button guild-button--danger text-xs">
            <LogOut className="h-4 w-4" />ログアウト
          </button>
        </div>
      </details>
    </aside>
  );
}
