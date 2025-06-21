"use server";

import { prisma } from "../../../../prisma/prisma";
import { avatarCharacters } from "@/data/avatar";

export const unlockAvatar = async (email: string, avatarId: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const avatarToUnlock = avatarCharacters.find((a) => a.id === avatarId);
  if (!avatarToUnlock) {
    throw new Error("Avatar not found.");
  }

  const userStatus = await prisma.userStatus.findUnique({
    where: { userId: email },
  });

  if (!userStatus) {
    throw new Error("User status not found.");
  }

  // Check if user already has this avatar
  const existingAvatar = await prisma.avatar.findFirst({
    where: {
      userId: email,
      name: avatarToUnlock.name,
    },
  });

  if (existingAvatar) {
    throw new Error("Avatar already owned.");
  }

  if (userStatus.level < avatarToUnlock.unlockLevel) {
    throw new Error("Level requirement not met.");
  }

  if (userStatus.coin < avatarToUnlock.price) {
    throw new Error("Not enough coins.");
  }

  await prisma.$transaction(async (tx) => {
    // Deduct coins from user
    await tx.userStatus.update({
      where: { userId: email },
      data: {
        coin: {
          decrement: avatarToUnlock.price,
        },
      },
    });

    // Create the avatar
    await tx.avatar.create({
      data: {
        name: avatarToUnlock.name,
        image: avatarToUnlock.image,
        description: avatarToUnlock.description,
        type: avatarToUnlock.type,
        hp: avatarToUnlock.statBonus.hp,
        attack: avatarToUnlock.statBonus.attack,
        defense: avatarToUnlock.statBonus.defense,
        price: avatarToUnlock.price,
        userId: email,
      },
    });
  });

  return { success: true };
};

export const autoUnlockAvatars = async (email: string) => {
  if (!email) {
    throw new Error("User not found.");
  }

  const userStatus = await prisma.userStatus.findUnique({
    where: { userId: email },
  });

  if (!userStatus) {
    throw new Error("User status not found.");
  }

  // Get user's owned avatars from the Avatar model
  const userAvatars = await prisma.avatar.findMany({
    where: { userId: email },
    select: { name: true },
  });

  const ownedAvatarNames = userAvatars.map((avatar) => avatar.name);

  const newlyUnlockedAvatars: string[] = [];

  // Check each avatar to see if it should be auto-unlocked
  for (const avatar of avatarCharacters) {
    // Skip if already owned or if level requirement not met
    if (
      ownedAvatarNames.includes(avatar.name) ||
      userStatus.level < avatar.unlockLevel
    ) {
      continue;
    }

    // Auto-unlock if user has enough coins or if it's free
    if (avatar.price === 0 || userStatus.coin >= avatar.price) {
      newlyUnlockedAvatars.push(avatar.id);
    } else {
    }
  }

  let updatedUserStatus = userStatus;

  // Update the database with newly unlocked avatars
  if (newlyUnlockedAvatars.length > 0) {
    const totalCost = newlyUnlockedAvatars.reduce((total, avatarId) => {
      const avatar = avatarCharacters.find((a) => a.id === avatarId);
      return total + (avatar?.price || 0);
    }, 0);

    // Create new avatars and update user coins
    await prisma.$transaction(async (tx) => {
      // Deduct coins from user
      await tx.userStatus.update({
        where: { userId: email },
        data: {
          coin: {
            decrement: totalCost,
          },
        },
      });

      // Create new avatars
      for (const avatarId of newlyUnlockedAvatars) {
        const avatar = avatarCharacters.find((a) => a.id === avatarId);
        if (avatar) {
          await tx.avatar.create({
            data: {
              name: avatar.name,
              image: avatar.image,
              description: avatar.description,
              type: avatar.type,
              hp: avatar.statBonus.hp,
              attack: avatar.statBonus.attack,
              defense: avatar.statBonus.defense,
              price: avatar.price,
              userId: email,
            },
          });
        }
      }
    });

    // Get updated user status
    updatedUserStatus =
      (await prisma.userStatus.findUnique({
        where: { userId: email },
      })) || userStatus;
  }

  return {
    success: true,
    newlyUnlockedAvatars,
    totalCost: newlyUnlockedAvatars.reduce((total, avatarId) => {
      const avatar = avatarCharacters.find((a) => a.id === avatarId);
      return total + (avatar?.price || 0);
    }, 0),
    // Return updated user data directly
    userData: {
      level: updatedUserStatus.level,
      coin: updatedUserStatus.coin,
      selectedAvatar: "warrior", // Default value since we're not using this field anymore
      unlockedAvatars: [], // Empty array since we're using Avatar model now
    },
  };
};
