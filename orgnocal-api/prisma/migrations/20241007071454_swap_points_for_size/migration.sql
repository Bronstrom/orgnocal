/*
  Warnings:

  - You are about to drop the column `points` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "points",
ADD COLUMN     "size" TEXT;
