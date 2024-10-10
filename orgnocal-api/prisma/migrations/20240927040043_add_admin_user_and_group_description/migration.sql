-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
