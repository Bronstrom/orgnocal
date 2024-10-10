/*
  Warnings:

  - Made the column `projectId` on table `TaskLayer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TaskLayer" DROP CONSTRAINT "TaskLayer_projectId_fkey";

-- AlterTable
ALTER TABLE "TaskLayer" ALTER COLUMN "projectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskLayer" ADD CONSTRAINT "TaskLayer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
