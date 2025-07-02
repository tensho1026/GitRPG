"use server";

import { prisma } from "../../../../prisma/prisma";

export const saveUserToDatabase = async (userData: {
  email: string;
  name: string | null;
  image: string | null;
}) => {
  // Debug logging to check the input
  console.log("saveUserToDatabase called with:", userData);

  if (!userData.email) {
    console.error("saveUserToDatabase: email is undefined or empty");
    throw new Error("User email is required");
  }

  try {
    // Test database connection first
    await prisma.$connect();

    const user = await prisma.users.upsert({
      where: { id: userData.email },
      update: {
        name: userData.name ?? "",
        image: userData.image ?? "",
        updatedAt: new Date(),
      },
      create: {
        id: userData.email,
        name: userData.name ?? "",
        image: userData.image ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("User saved successfully:", user);
    return user;
  } catch (error) {
    console.error("Database connection or save failed:", error);
    throw new Error(
      `Failed to save user to database: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    await prisma.$disconnect();
  }
};
