/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `ProjectGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectGroup" DROP CONSTRAINT "ProjectGroup_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "createdByUserId" INTEGER;

-- AlterTable
ALTER TABLE "ProjectGroup" DROP COLUMN "createdByUserId";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
