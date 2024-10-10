-- DropForeignKey
ALTER TABLE "TaskLayer" DROP CONSTRAINT "TaskLayer_projectId_fkey";

-- AddForeignKey
ALTER TABLE "TaskLayer" ADD CONSTRAINT "TaskLayer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
