import "server-only";

import { avatarCharacters } from "@/data/avatar";
import { supabase } from "@/supabase/supabase.config";
import { randomUUID } from "crypto";

const DEFAULT_AVATAR = avatarCharacters.find(
  (avatar) => avatar.id === "warrior"
)!;

if (!DEFAULT_AVATAR) {
  throw new Error("Default avatar is not configured");
}

/**
 * Repairs the default avatar for old and directly-created accounts.
 * The operation is intentionally idempotent so it can be called during login.
 */
export async function ensureDefaultAvatar(userId: string) {
  const { data: existingAvatar, error: avatarLookupError } = await supabase
    .from("Avatar")
    .select("id, equipped")
    .eq("userId", userId)
    .eq("name", DEFAULT_AVATAR.name)
    .limit(1)
    .maybeSingle();

  if (avatarLookupError) {
    throw new Error("Failed to check default avatar");
  }

  let avatar = existingAvatar;
  if (!avatar) {
    const now = new Date().toISOString();
    const { data: insertedAvatar, error: insertError } = await supabase
      .from("Avatar")
      .insert({
        id: randomUUID(),
        name: DEFAULT_AVATAR.name,
        image: DEFAULT_AVATAR.image,
        description: DEFAULT_AVATAR.description,
        type: DEFAULT_AVATAR.type,
        hp: DEFAULT_AVATAR.statBonus.hp,
        attack: DEFAULT_AVATAR.statBonus.attack,
        defense: DEFAULT_AVATAR.statBonus.defense,
        price: DEFAULT_AVATAR.price,
        userId,
        equipped: false,
        createdAt: now,
        updatedAt: now,
      })
      .select("id, equipped")
      .maybeSingle();

    if (insertError) {
      // Another request may have initialized the same account at the same
      // time. Re-read before treating the insert as a real failure.
      const { data: racedAvatar, error: rereadError } = await supabase
        .from("Avatar")
        .select("id, equipped")
        .eq("userId", userId)
        .eq("name", DEFAULT_AVATAR.name)
        .limit(1)
        .maybeSingle();

      if (rereadError || !racedAvatar) {
        throw new Error("Failed to create default avatar");
      }
      avatar = racedAvatar;
    } else {
      avatar = insertedAvatar;
    }
  }

  const { data: equippedAvatar, error: equippedLookupError } = await supabase
    .from("Avatar")
    .select("id")
    .eq("userId", userId)
    .eq("equipped", true)
    .limit(1)
    .maybeSingle();

  if (equippedLookupError) {
    throw new Error("Failed to check equipped avatar");
  }

  if (!equippedAvatar && avatar && !avatar.equipped) {
    const { error: equipError } = await supabase
      .from("Avatar")
      .update({ equipped: true, updatedAt: new Date().toISOString() })
      .eq("id", avatar.id)
      .eq("userId", userId);

    if (equipError) {
      throw new Error("Failed to equip default avatar");
    }
  }

  const { data: userStatus, error: statusLookupError } = await supabase
    .from("UserStatus")
    .select("selectedAvatar, unlockedAvatars")
    .eq("userId", userId)
    .single();

  if (statusLookupError || !userStatus) {
    throw new Error("User status not found");
  }

  const unlockedAvatars = Array.isArray(userStatus.unlockedAvatars)
    ? userStatus.unlockedAvatars
    : [];
  const nextUnlockedAvatars = unlockedAvatars.includes(DEFAULT_AVATAR.id)
    ? unlockedAvatars
    : [...unlockedAvatars, DEFAULT_AVATAR.id];
  const needsStatusUpdate =
    nextUnlockedAvatars.length !== unlockedAvatars.length ||
    !userStatus.selectedAvatar;

  if (needsStatusUpdate) {
    const { error: statusUpdateError } = await supabase
      .from("UserStatus")
      .update({
        selectedAvatar: userStatus.selectedAvatar || DEFAULT_AVATAR.id,
        unlockedAvatars: nextUnlockedAvatars,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId);

    if (statusUpdateError) {
      throw new Error("Failed to initialize default avatar status");
    }
  }

  return {
    id: DEFAULT_AVATAR.id,
    selectedAvatar: userStatus.selectedAvatar || DEFAULT_AVATAR.id,
    unlockedAvatars: nextUnlockedAvatars,
  };
}
