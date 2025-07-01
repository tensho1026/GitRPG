import { NextRequest } from "next/server";
import { prisma } from "../../../../../prisma/prisma";
import { getCurrentUserBattleStatus } from "../../../../actions/user/status/getCurrentUserBattleStatus";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } }
) {
  // ユーザー名でユーザーを検索
  const user = await prisma.users.findFirst({
    where: { name: params.name },
    select: {
      id: true,
      name: true,
      status: {
        select: {
          level: true,
        },
      },
    },
  });

  if (!user) {
    return new Response("User Not Found", { status: 404 });
  }

  // ユーザーIDを使用してバトルステータスを取得
  const battleStatus = await getCurrentUserBattleStatus(user.id);
  const level = user.status?.level || 1;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="80">
      <style>
        .title { font: bold 16px sans-serif; fill: #58a6ff; }
        .label { font: 12px sans-serif; fill: #c9d1d9; }
        .value { font: bold 14px monospace; fill: #ffffff; }
      </style>
      <rect width="300" height="80" rx="10" fill="#0d1117"/>
      <text x="20" y="25" class="title">Git-RPG Status</text>
      <text x="20" y="50" class="label">Level:</text>
      <text x="80" y="50" class="value">${level}</text>
      <text x="140" y="50" class="label">HP:</text>
      <text x="180" y="50" class="value">${battleStatus.hp}</text>
      <text x="20" y="70" class="label">ATK:</text>
      <text x="80" y="70" class="value">${battleStatus.attack}</text>
      <text x="140" y="70" class="label">DEF:</text>
      <text x="180" y="70" class="value">${battleStatus.defense}</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}
