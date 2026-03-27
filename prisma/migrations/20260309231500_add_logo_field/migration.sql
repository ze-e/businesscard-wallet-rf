-- AlterTable
ALTER TABLE "Card"
ADD COLUMN "logo" TEXT;

-- CreateIndex
CREATE INDEX "Card_userId_logo_idx" ON "Card"("userId", "logo");
