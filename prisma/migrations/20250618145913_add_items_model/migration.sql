-- CreateTable
CREATE TABLE "Items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attack" INTEGER,
    "defense" INTEGER,
    "price" INTEGER NOT NULL,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
