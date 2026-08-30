import "server-only";

import { supabase } from "@/supabase/supabase.config";

export async function getUserCurrentItemsById(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: items, error } = await supabase
    .from("Items")
    .select("*")
    .eq("userId", userId)
    .eq("equipped", true)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user equipped items: ${error.message}`);
  }

  return items || [];
}
