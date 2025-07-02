// app/actions/updateCommits.ts
"use server";

import { getCommitsAfterSignup } from "@/actions/github/getCommitsAfterSignup";
import { prisma } from "../../lib/prisma";
import { getLevelFromCommits } from "@/lib/leveling";

export async function updateCommits(userId: string, accessToken: string) {
  const count = await getCommitsAfterSignup(userId, accessToken);
  const level = getLevelFromCommits(count);

  // 現在のユーザーステータスを取得
  const currentStatus = await prisma.userStatus.findUnique({
    where: { userId },
  });

  // 新しいコミット数と前回のコミット数の差分を計算
  const newCommits = count - (currentStatus?.commit ?? 0);
  const newCoins = newCommits * 10; // 新しいコミット数に応じたコイン

  // コミット数とレベルをDBに保存（コインは追加）
  await prisma.userStatus.upsert({
    where: { userId },
    update: {
      commit: count,
      level: level,
      coin: {
        increment: newCoins, // 新しいコインを追加
      },
    },
    create: {
      userId,
      commit: count,
      coin: count * 10,
      level: level,
    },
  });

  return count;
}
