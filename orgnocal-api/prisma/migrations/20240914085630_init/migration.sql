/*
  Warnings:

  - You are about to drop the column `productOwnerGroupId` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "productOwnerGroupId",
ADD COLUMN     "productOwnerUserId" INTEGER;
