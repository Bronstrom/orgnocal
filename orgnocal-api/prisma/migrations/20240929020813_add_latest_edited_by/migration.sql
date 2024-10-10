-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "latestEditedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_latestEditedByUserId_fkey" FOREIGN KEY ("latestEditedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
