/*
  Warnings:

  - You are about to drop the column `owned` on the `Items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,equipmentId]` on the table `Items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentId` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Items" DROP COLUMN "owned",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "equipmentId" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Items_userId_equipmentId_key" ON "Items"("userId", "equipmentId");
