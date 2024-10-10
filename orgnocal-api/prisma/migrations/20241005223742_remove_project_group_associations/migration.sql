-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "points" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_GroupToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToProject_AB_unique" ON "_GroupToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToProject_B_index" ON "_GroupToProject"("B");

-- AddForeignKey
ALTER TABLE "_GroupToProject" ADD CONSTRAINT "_GroupToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToProject" ADD CONSTRAINT "_GroupToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
