/*
  Warnings:

  - You are about to drop the column `exp` on the `UserStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserStatus" DROP COLUMN "exp",
ADD COLUMN     "commit" INTEGER NOT NULL DEFAULT 0;
