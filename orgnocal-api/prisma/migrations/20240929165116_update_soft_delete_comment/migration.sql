/*
  Warnings:

  - You are about to drop the column `commentDeletedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `commentDeletedByUserId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentDeletedByUserId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commentDeletedAt",
DROP COLUMN "commentDeletedByUserId",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
