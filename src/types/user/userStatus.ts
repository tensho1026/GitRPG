import type { Users, Items } from "@/generated/prisma";

export type UserWithStatus = Users & {
  status: {
    commit: number;
    level: number;
    coin: number;
    hp: number;
    attack: number;
    defense: number;
  } | null;
  items: Pick<Items, "id" | "name" | "image" | "type" | "equipped">[];
};
