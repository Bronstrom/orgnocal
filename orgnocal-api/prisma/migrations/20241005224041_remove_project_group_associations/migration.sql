/*
  Warnings:

  - You are about to drop the `ProjectGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectGroup" DROP CONSTRAINT "ProjectGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectGroup" DROP CONSTRAINT "ProjectGroup_projectId_fkey";

-- DropTable
DROP TABLE "ProjectGroup";
