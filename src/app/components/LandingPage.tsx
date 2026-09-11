import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, Coins, Github, Shield, Sparkles, Sword } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const quests = [
  { icon: Sword, title: "コードを刻む", reward: "+50 EXP" },
  { icon: Shield, title: "Issueを解決する", reward: "+30 COIN" },
  { icon: CalendarDays, title: "連続記録を伸ばす", reward: "STREAK" },
];

export default function LandingPage() {
  return (
    <main className="guild-shell overflow-hidden">
      <div aria-hidden="true" className="guild-backdrop fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/newhomepage.JPG')" }} />

      <div className="guild-container flex min-h-screen items-center py-6 lg:py-10">
        <div className="w-full">
          <header className="guild-header mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="guild-chip h-11 w-11 p-0"><Sword size={21} /></div>
              <div>
                <p className="guild-kicker">Developer&apos;s Guild</p>
                <p className="guild-title text-xl">GIT-RPG</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-xs text-stone-300 sm:flex">
              <span className="h-2 w-2 bg-emerald-500" /> GUILD GATE / ONLINE
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <section className="guild-panel flex min-h-[590px] flex-col justify-between overflow-hidden p-6 sm:p-9">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div>
                <p className="guild-kicker mb-4">A small commit, a braver world.</p>
                <h1 className="guild-title max-w-2xl text-4xl leading-tight sm:text-5xl lg:text-6xl">コードを刻み、<br />冒険者として成長せよ。</h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">
                  GitHubの活動が経験値になり、装備になり、次の冒険につながる。
                  毎日の開発をひとつの物語に変える、開発者のためのRPGギルドです。
                </p>
              </div>

              <div className="mt-8 grid gap-2">
                {quests.map(({ icon: Icon, title, reward }) => (
                  <div key={title} className="guild-inset flex items-center gap-3 p-3">
                    <span className="grid h-9 w-9 place-items-center border border-amber-700/70 bg-black/20 text-amber-200"><Icon size={17} /></span>
                    <span className="flex-1 font-bold text-stone-100">{title}</span>
                    <span className="font-mono text-xs font-bold text-amber-200">{reward}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/auth" className="guild-button h-14 px-7 text-base"><Github size={20} />ギルドに参加する<ChevronRight size={18} /></Link>
                </Button>
                <span className="text-xs text-stone-400">GitHubアカウントで冒険記録を同期</span>
              </div>
            </section>

            <section className="grid gap-4">
              <div className="parchment-panel min-h-[350px] p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between border-b border-stone-700/30 pb-3">
                  <div><p className="font-mono text-[10px] font-bold tracking-[.2em] text-stone-600">GUILD ARCHIVE</p><h2 className="text-2xl font-black">冒険者の記録</h2></div>
                  <Coins className="text-amber-800" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "STATUS", src: "/equipmentStatus.png" }, { label: "EQUIPMENT", src: "/commitStatus.png" }].map((preview) => (
                    <div key={preview.label} className="parchment-inset p-2">
                      <p className="mb-2 text-center font-mono text-[10px] font-bold tracking-widest">{preview.label}</p>
                      <Image src={preview.src} alt={`${preview.label}画面の例`} width={220} height={300} className="mx-auto h-56 w-auto object-contain [image-rendering:pixelated]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="guild-panel p-5">
                <div className="guild-section-title mb-3"><Sparkles size={18} />冒険の掟</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["COMMIT", "経験値"], ["EQUIP", "能力強化"], ["BATTLE", "報酬獲得"]].map(([key, value]) => (
                    <div key={key} className="guild-stat"><div className="guild-stat__value text-sm">{key}</div><div className="mt-1 text-[11px] text-stone-400">{value}</div></div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
