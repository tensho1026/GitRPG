import type { Users } from "@/generated/prisma";

export type UserWithStatus = Users & {
  status: {
    commit: number;
    level: number;
    coin: number;
    hp: number;
    attack: number;
    defense: number;
  } | null;
};
