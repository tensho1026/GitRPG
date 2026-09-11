"use server";

import { getAuthenticatedUserId } from "@/lib/authenticatedUser";
import { getUserBattleStatusById } from "@/lib/userBattleStatus";
import { supabase } from "@/supabase/supabase.config";

export type GameBattle = {
  id: string;
  stageId: number;
  stageName?: string;
  battleNumber: number;
  totalBattles?: number;
  theme?: string;
  status: "active" | "won" | "lost" | "completed";
};

export type GamePlayer = {
  name: string;
  avatar: string;
  level?: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
};

export type GameMonster = {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  image: string;
  experience: number;
  coins: number;
};

export type GameState = {
  user: { name: string; image: string };
  battle: GameBattle;
  player: GamePlayer;
  monster: GameMonster;
};

type BattleRpcResult = {
  battle: GameBattle;
  player: Omit<GamePlayer, "name" | "avatar">;
  monster: GameMonster;
  result?: "active" | "won" | "lost";
  playerDamage?: number;
  monsterDamage?: number;
  reward?: { coins: number; experience: number };
};

const asRpcResult = (value: unknown): BattleRpcResult => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid battle response");
  }
  const result = value as Partial<BattleRpcResult>;
  if (!result.battle || !result.player || !result.monster) {
    throw new Error("Invalid battle response");
  }
  return result as BattleRpcResult;
};

const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("Users")
    .select("name, image")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("User profile not found");
  }
  return { name: data.name || "戦士", image: data.image || "/sword.png" };
};

export async function getBattleState(): Promise<GameState> {
  const userId = await getAuthenticatedUserId();
  const { saveUserToDatabase } = await import("@/actions/user/auth/saveUser");
  await saveUserToDatabase({ id: userId, name: userId, image: "" });
  const [battleStatus, user] = await Promise.all([
    getUserBattleStatusById(userId),
    getUserProfile(userId),
  ]);

  const { data, error } = await supabase.rpc("start_battle", {
    p_user_id: userId,
    p_player_max_hp: battleStatus.totalStats.hp,
    p_player_attack: battleStatus.totalStats.attack,
    p_player_defense: battleStatus.totalStats.defense,
  });

  if (error) {
    throw new Error("Failed to start battle: " + error.message);
  }

  const result = asRpcResult(data);
  return {
    user,
    battle: result.battle,
    player: {
      ...result.player,
      level: battleStatus.level,
      name: user.name,
      avatar: user.image,
    },
    monster: result.monster,
  };
}

export async function attackBattle(battleId: string) {
  const userId = await getAuthenticatedUserId();
  if (!battleId) {
    throw new Error("Battle ID is required");
  }

  const { data, error } = await supabase.rpc("attack_battle", {
    p_user_id: userId,
    p_battle_id: battleId,
  });

  if (error) {
    throw new Error("Failed to resolve attack: " + error.message);
  }

  return asRpcResult(data);
}
