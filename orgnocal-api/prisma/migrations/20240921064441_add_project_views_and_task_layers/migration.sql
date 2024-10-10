-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "latestEditDate" TIMESTAMP(3),
ADD COLUMN     "postedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "latestEditDate" TIMESTAMP(3),
ADD COLUMN     "postedDate" TIMESTAMP(3),
ADD COLUMN     "taskLayerId" INTEGER;

-- CreateTable
CREATE TABLE "ProjectView" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "viewType" TEXT NOT NULL,
    "taskOrder" TEXT,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskLayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "TaskLayer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectView" ADD CONSTRAINT "ProjectView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskLayerId_fkey" FOREIGN KEY ("taskLayerId") REFERENCES "TaskLayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLayer" ADD CONSTRAINT "TaskLayer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
