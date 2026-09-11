"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Shield, Sword, Zap } from "lucide-react";
import {
  attackBattle,
  getBattleState,
  type GameState,
} from "@/actions/game/battle";
import { DataState, InlineError } from "@/app/components/DataState";
import Loading from "@/components/ Loading";

const INITIAL_LOG = ["戦闘準備中..."];

export default function BattlePage() {
  const { status } = useSession();
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>(INITIAL_LOG);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadBattle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextGame = await getBattleState();
      setGame(nextGame);
      setBattleLog([
        nextGame.monster.name + "が現れた！",
        "バトル開始！",
      ]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "バトルデータを取得できませんでした"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") void loadBattle();
    if (status === "unauthenticated") {
      setError("ログインが必要です");
      setIsLoading(false);
    }
  }, [status, loadBattle]);

  const addLog = (message: string) => {
    setBattleLog((previous) => [...previous.slice(-5), message]);
  };

  const handleAttack = async () => {
    if (!game || game.battle.status !== "active" || isProcessing) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      const result = await attackBattle(game.battle.id);
      setGame((previous) =>
        previous
          ? {
              ...previous,
              battle: { ...previous.battle, ...result.battle },
              player: { ...previous.player, ...result.player },
              monster: result.monster,
            }
          : previous
      );
      addLog(game.player.name + "の攻撃！");
      addLog(
        game.monster.name + "に" + (result.playerDamage ?? 0) + "のダメージ！"
      );

      if (result.battle.status === "won") {
        addLog(game.monster.name + "を倒した！");
        addLog(
          "経験値" +
            (result.reward?.experience ?? 0) +
            "、コイン" +
            (result.reward?.coins ?? 0) +
            "を獲得！"
        );
      } else if (result.battle.status === "lost") {
        addLog(game.player.name + "は倒れた...");
      } else if ((result.monsterDamage ?? 0) > 0) {
        addLog(game.monster.name + "の攻撃！");
        addLog(
          game.player.name +
            "に" +
            (result.monsterDamage ?? 0) +
            "のダメージ！"
        );
      }
    } catch (attackError) {
      setActionError(
        attackError instanceof Error
          ? attackError.message
          : "攻撃を確定できませんでした"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <Loading backgroundImage="/overworld-bg.png" />;
  }

  if (error || !game) {
    return (
      <DataState
        title="バトルを読み込めません"
        message={error || "バトルデータがありません"}
        onRetry={
          error === "ログインが必要です"
            ? () => router.push("/auth")
            : loadBattle
        }
      />
    );
  }

  const battleFinished =
    game.battle.status === "won" ||
    game.battle.status === "lost" ||
    game.battle.status === "completed";
  const progress = Math.min(
    100,
    (game.battle.battleNumber / (game.battle.totalBattles || 1)) * 100
  );

  return (
    <main className="guild-shell min-h-screen font-mono text-white">
      <div aria-hidden="true" className="guild-backdrop fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/dark.jpeg')" }} />
      <div className="guild-container max-w-5xl">
        <header className="guild-header mb-4 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="前の画面へ戻る"
                onClick={() => router.push("/home")}
                className="guild-button guild-button--stone h-11 w-11 p-0">
                <ArrowLeft aria-hidden="true" />
              </button>
              <div><p className="guild-kicker">Dungeon Encounter</p><h1 className="guild-title text-2xl sm:text-3xl">バトル</h1></div>
            </div>
            <div className="guild-chip">
              <Zap aria-hidden="true" />
              <span>
                Lv.{game.player.level ?? "-"} / 第{game.battle.stageId}階層
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <MapPin className="text-emerald-300" aria-hidden="true" />
              <div>
                <p className="text-sm text-emerald-300">
                  第{game.battle.stageId}階層
                </p>
                <p className="break-words text-lg font-bold">
                  {game.battle.stageName || "冒険の道"}
                </p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm text-amber-200">
                <span>ステージ進行</span>
                <span>
                  {game.battle.battleNumber}/
                  {game.battle.totalBattles || "?"}
                </span>
              </div>
              <div
                className="guild-progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="ステージ進行状況">
                <div
                  className="transition-[width]"
                  style={{ width: progress + "%" }}
                />
              </div>
            </div>
          </div>
        </header>

        {actionError && <InlineError message={actionError} />}

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <section className="guild-panel p-5">
            <h2 className="mb-3 text-center text-xl font-bold">
              {game.player.name}
            </h2>
            <Image
              src={game.player.avatar || "/sword.png"}
              alt={game.player.name + "のアバター"}
              width={96}
              height={96}
              className="mx-auto mb-3 h-24 w-24 object-contain"
            />
            <div className="space-y-2">
              <p className="text-center">
                Lv.{game.player.level ?? "-"}　
                HP: {game.player.hp}/{game.player.maxHp}
              </p>
              <div className="guild-progress">
                <div
                  className="!bg-emerald-500"
                  style={{
                    width:
                      Math.max(
                        0,
                        Math.min(100, (game.player.hp / game.player.maxHp) * 100)
                      ) + "%",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <span className="guild-inset p-2">
                  <Sword className="mr-1 inline" size={16} aria-hidden="true" />
                  攻撃 {game.player.attack}
                </span>
                <span className="guild-inset p-2">
                  <Shield className="mr-1 inline" size={16} aria-hidden="true" />
                  防御 {game.player.defense}
                </span>
              </div>
            </div>
          </section>

          <section className="guild-panel !border-red-900 p-5">
            <h2 className="mb-3 break-words text-center text-xl font-bold">
              {game.monster.name}
            </h2>
            <Image
              src={game.monster.image || "/spark.png"}
              alt={game.monster.name}
              width={120}
              height={120}
              className="mx-auto mb-3 h-28 w-28 object-contain"
            />
            <div className="space-y-2">
              <p className="text-center">Lv.{game.monster.level}</p>
              <p className="text-center">
                HP: {game.monster.hp}/{game.monster.maxHp}
              </p>
              <div className="guild-progress">
                <div
                  className="!bg-red-600"
                  style={{
                    width:
                      Math.max(
                        0,
                        Math.min(100, (game.monster.hp / game.monster.maxHp) * 100)
                      ) + "%",
                  }}
                />
              </div>
              <p className="text-center text-sm">
                攻撃 {game.monster.attack} / 防御 {game.monster.defense}
              </p>
            </div>
          </section>
        </div>

        <section className="parchment-panel mb-4 p-5 text-stone-800">
          <h2 className="mb-3 text-lg font-black">バトルログ</h2>
          <div
            className="parchment-inset h-32 overflow-y-auto p-3"
            aria-live="polite">
            {battleLog.map((message, index) => (
              <p key={index} className="mb-1 text-emerald-900">
                &gt; {message}
              </p>
            ))}
          </div>
        </section>

        {!battleFinished && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => void handleAttack()}
              disabled={isProcessing}
              className="guild-button touch-target px-8 py-4 text-xl">
              <Sword className="mr-2 inline" aria-hidden="true" />
              {isProcessing ? "処理中..." : "攻撃"}
            </button>
          </div>
        )}

        {battleFinished && (
          <section
            className="guild-panel mt-4 p-6 text-center"
            role="status"
            aria-live="assertive">
            <h2 className="mb-4 text-3xl font-bold">
              {game.battle.status === "won"
                ? "🎉 勝利！"
                : game.battle.status === "completed"
                  ? "🏆 全ステージ制覇！"
                  : "💀 敗北..."}
            </h2>
            {game.battle.status === "won" && (
              <p className="mb-4 text-amber-200">
                報酬はサーバーで確定・保存されました。次の敵へ進めます。
              </p>
            )}
            {game.battle.status !== "completed" && (
              <button
                type="button"
                onClick={() => void loadBattle()}
                className="guild-button touch-target px-8 py-3">
                {game.battle.status === "won" ? "次の敵へ" : "再挑戦"}
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
