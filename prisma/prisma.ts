// src/lib/prisma.ts
// lib/prisma.ts
// ← @prisma/client ではない

import { PrismaClient } from "../src/generated/prisma";

// グローバル変数にキャッシュして多重생성を防ぐ（開発中のホットリロード対策）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// すでに存在するならそれを使う。なければ新しく作る
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// 開発中のみグローバル変数に保持（本番環境では不要）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
