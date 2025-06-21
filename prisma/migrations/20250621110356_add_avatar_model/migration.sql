/*
  Warnings:

  - You are about to drop the column `selectedAvatar` on the `UserStatus` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedAvatars` on the `UserStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserStatus" DROP COLUMN "selectedAvatar",
DROP COLUMN "unlockedAvatars";

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hp" INTEGER,
    "attack" INTEGER,
    "defense" INTEGER,
    "price" INTEGER NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
