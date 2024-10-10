/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userUserId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `postedDate` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `archived` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postedDate` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `archived` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userUserId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToProject" DROP CONSTRAINT "_GroupToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToProject" DROP CONSTRAINT "_GroupToProject_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_B_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "postedDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "archived" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dueDate",
DROP COLUMN "userUserId",
ADD COLUMN     "endDate" TIMESTAMP(3),
ALTER COLUMN "postedDate" SET NOT NULL,
ALTER COLUMN "archived" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "groupId",
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "TaskAssignment";

-- DropTable
DROP TABLE "_GroupToProject";

-- DropTable
DROP TABLE "_GroupToUser";

-- CreateTable
CREATE TABLE "Org" (
    "id" SERIAL NOT NULL,
    "orgName" TEXT NOT NULL,
    "description" TEXT,
    "productOwnerUserId" INTEGER,
    "projectManagerUserId" INTEGER,
    "createdByUserId" INTEGER,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrgToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrgToProject_AB_unique" ON "_OrgToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgToProject_B_index" ON "_OrgToProject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgToUser_AB_unique" ON "_OrgToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgToUser_B_index" ON "_OrgToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgToProject" ADD CONSTRAINT "_OrgToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgToProject" ADD CONSTRAINT "_OrgToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgToUser" ADD CONSTRAINT "_OrgToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgToUser" ADD CONSTRAINT "_OrgToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
