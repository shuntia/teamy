-- AlterTable
ALTER TABLE "TestAudit" DROP CONSTRAINT "TestAudit_testId_fkey";

-- AlterTable
ALTER TABLE "TestAudit" ALTER COLUMN "testId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TestAudit" ADD CONSTRAINT "TestAudit_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE SET NULL ON UPDATE CASCADE;

