"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Compass, Github, LogOut, Map, Shield, Sword } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import type { UserWithStatus, BattleStatus } from "@/types/user/userStatus";
import GitHubPermissionNotice from "./GitHubPermissionNotice";

const emptyBattle: BattleStatus = { userId: "", level: 1, baseStats: { hp: 0, attack: 0, defense: 0 }, totalStats: { hp: 0, attack: 0, defense: 0 }, equippedItems: [], equippedAvatar: null, coin: 0, commit: 0 };

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [battleStatus, setBattleStatus] = useState<BattleStatus>(emptyBattle);
  const [expInfo, setExpInfo] = useState({ remainingCommits: 0, percentage: 0 });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;
    const load = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const [nextStatus, nextBattle] = await Promise.all([getUserStatus(session.user.email), getCurrentUserBattleStatus(session.user.email)]);
          if (cancelled || requestId !== requestIdRef.current) return;
          if (nextStatus) { setUserStatus(nextStatus); setExpInfo(getRemainingCommitsToNextLevel(nextStatus.status?.commit ?? 0)); }
          if (nextBattle) setBattleStatus(nextBattle);
        } catch (error) { console.error("Failed to fetch user data:", error); }
      }
    };
    void load();
    return () => { cancelled = true; requestIdRef.current += 1; };
  }, [status, session]);

  if (status === "loading") {
    return <main className="guild-shell grid min-h-screen place-items-center"><div aria-hidden="true" className="guild-backdrop fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/overworld-bg.png')" }} /><div className="guild-panel p-7 text-center"><Compass className="mx-auto mb-3 animate-spin text-amber-300" /><p className="guild-title">冒険の準備中...</p></div></main>;
  }

  const level = userStatus?.status?.level ?? 1;
  return (
    <main className="guild-shell min-h-screen overflow-hidden">
      <div aria-hidden="true" className="guild-backdrop fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/overworld-bg.png')" }} />
      <div className="guild-container grid min-h-screen place-items-center py-8">
        <section className="guild-panel w-full max-w-3xl p-6 sm:p-8">
          <div className="mb-7 text-center">
            <span className="guild-chip mb-4 h-14 w-14 p-0"><Map size={26} /></span>
            <p className="guild-kicker">Guild Registration</p>
            <h1 className="guild-title mt-2 text-3xl sm:text-4xl">冒険者ギルド受付</h1>
            <p className="mt-3 text-sm text-stone-400">GitHubの活動記録を、あなたの冒険譚へ。</p>
          </div>

          {session ? (
            <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
              <div className="guild-inset p-5 text-center">
                {session.user?.image && <Image src={session.user.image} alt="冒険者アイコン" width={88} height={88} className="mx-auto mb-3 h-22 w-22 border-2 border-amber-300 object-cover" />}
                <p className="guild-title text-xl">{session.user?.name}</p>
                <p className="mt-1 break-all font-mono text-[10px] text-stone-500">{session.user?.email}</p>
                <p className="mt-4 text-sm text-emerald-300">登録済み冒険者</p>
              </div>
              <div>
                <div className="grid grid-cols-4 gap-2">
                  {[["LV", level], ["HP", battleStatus.totalStats.hp], ["ATK", battleStatus.totalStats.attack], ["DEF", battleStatus.totalStats.defense]].map(([label, value]) => <div key={label} className="guild-stat p-2"><p className="text-[9px] text-stone-500">{label}</p><p className="guild-stat__value text-base">{value}</p></div>)}
                </div>
                <div className="guild-inset mt-3 p-4">
                  <div className="mb-2 flex justify-between text-xs text-stone-400"><span>次のレベルまで</span><span>あと{expInfo.remainingCommits}コミット</span></div>
                  <div className="guild-progress"><div style={{ width: `${expInfo.percentage}%` }} /></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <a href="/home" className="guild-button flex-1"><Sword size={17} />ギルドへ戻る</a>
                  <button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className="guild-button guild-button--danger"><LogOut size={17} />退出</button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="parchment-panel mb-5 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[[Shield, "記録を同期", "コミット・Issue・PRを冒険記録に変換"], [Sword, "能力を強化", "活動して装備と英雄を解放"], [Map, "地図を進む", "積み重ねた成果をひと目で確認"]].map(([Icon, title, body]) => {
                    const ItemIcon = Icon as typeof Shield;
                    return <div key={String(title)} className="parchment-inset p-4"><ItemIcon className="mb-3 text-amber-800" size={21} /><h2 className="font-bold">{String(title)}</h2><p className="mt-2 text-xs leading-5 text-stone-600">{String(body)}</p></div>;
                  })}
                </div>
              </div>
              <button type="button" onClick={() => void signIn("github", { callbackUrl: "/home" })} className="guild-button h-14 w-full text-base"><Github size={21} />GitHubで冒険者登録</button>
              <GitHubPermissionNotice />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
