-- AlterTable
ALTER TABLE "UserStatus" ADD COLUMN     "selectedAvatar" TEXT NOT NULL DEFAULT 'warrior',
ADD COLUMN     "unlockedAvatars" TEXT[] DEFAULT ARRAY['warrior']::TEXT[],
ALTER COLUMN "coin" SET DEFAULT 100,
ALTER COLUMN "defense" SET DEFAULT 5;
