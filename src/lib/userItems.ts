import "server-only";

import { db } from "@/db/neon";

export async function getUserCurrentItemsById(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: items, error } = await db
    .from("Items")
    .select("id, equipmentId, name, image, description, type, attack, defense, price, equipped, userId, createdAt, updatedAt")
    .eq("userId", userId)
    .eq("equipped", true)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user equipped items: ${error.message}`);
  }

  return items || [];
}
