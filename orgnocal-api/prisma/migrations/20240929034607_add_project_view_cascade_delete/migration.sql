-- DropForeignKey
ALTER TABLE "ProjectView" DROP CONSTRAINT "ProjectView_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectView" ADD CONSTRAINT "ProjectView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
