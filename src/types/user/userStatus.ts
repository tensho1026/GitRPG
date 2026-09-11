// User types for Neon database
export interface User {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// UserStatus types for Neon database
export interface UserStatus {
  id: string;
  userId: string;
  level: number;
  commit: number;
  coin: number;
  hp: number;
  attack: number;
  defense: number;
  selectedAvatar?: string | null;
  unlockedAvatars: string[];
  lastSyncAt?: string | null;
  syncStartedAt?: string | null;
  syncStatus?: "idle" | "syncing" | "success" | "error" | null;
  syncError?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Items types for Neon database
export interface Item {
  id: string;
  equipmentId: string;
  name: string;
  image: string;
  description: string;
  type: string;
  attack?: number | null;
  defense?: number | null;
  price: number;
  equipped: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Avatar types for Neon database
export interface Avatar {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
  hp?: number | null;
  attack?: number | null;
  defense?: number | null;
  price: number;
  equipped: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Lightweight projections used by the home dashboard. Inventory pages should
// use Item/Avatar and fetch the complete records when they need them.
export type HomeItem = Pick<
  Item,
  "id" | "name" | "image" | "type" | "attack" | "defense" | "equipped" | "userId"
>;

export type HomeAvatar = Pick<
  Avatar,
  "id" | "name" | "image" | "type" | "hp" | "attack" | "defense" | "equipped" | "userId"
>;

// Combined user data type
export interface UserWithStatus {
  user: User;
  status: UserStatus;
}

// Battle status type
export interface BattleStatus {
  userId: string;
  level: number;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
  };
  totalStats: {
    hp: number;
    attack: number;
    defense: number;
  };
  equippedItems: Item[];
  equippedAvatar: Avatar | null;
  coin: number;
  commit: number;
}
