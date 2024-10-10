-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "commentDeletedAt" TIMESTAMP(3),
ADD COLUMN     "commentDeletedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentDeletedByUserId_fkey" FOREIGN KEY ("commentDeletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
