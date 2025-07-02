-- AlterTable
ALTER TABLE "UserStatus" ADD COLUMN     "selectedAvatar" TEXT,
ADD COLUMN     "unlockedAvatars" TEXT[] DEFAULT ARRAY[]::TEXT[];
