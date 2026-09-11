"use client";

import CombatStatus from "@/app/item/components/CombatStatus";
import BattleHeader from "./BattleHeader";
import BattleStatsCard from "./BattleStatsCard";
import BattleTips from "./BattleTips";
import BattleStyles from "./BattleStyles";
import { useBattleData } from "../hooks/useBattleData";
import Loading from "@/components/ Loading";
import { DataState } from "@/app/components/DataState";

export default function Battle() {
  const { battleStatus, userLevel, isLoading, error, retry } = useBattleData();

  if (isLoading) {
    return <Loading backgroundImage="/newhomepage.JPG" />;
  }

  if (error) {
    return (
      <DataState
        title="戦闘ステータスを読み込めません"
        message={error}
        onRetry={retry}
      />
    );
  }

  return (
    <main className="guild-shell min-h-screen font-mono battle-background">
      <BattleStyles />

      <div className="guild-container">
        <BattleHeader
          userLevel={userLevel}
          totalHp={battleStatus.totalStats.hp}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Combat Status Card */}
          <div className="lg:col-span-2">
            <CombatStatus
              hp={battleStatus.totalStats.hp}
              attack={battleStatus.totalStats.attack}
              defense={battleStatus.totalStats.defense}
            />
          </div>

          {/* Battle Stats Cards */}
          <BattleStatsCard
            type="attack"
            value={battleStatus.totalStats.attack}
            title="攻撃力"
            description="敵に与えるダメージ"
          />
          <BattleStatsCard
            type="defense"
            value={battleStatus.totalStats.defense}
            title="防御力"
            description="受けるダメージ軽減"
          />
        </div>

        <BattleTips />
      </div>
    </main>
  );
}
