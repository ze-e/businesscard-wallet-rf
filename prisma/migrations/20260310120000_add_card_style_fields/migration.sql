-- AlterTable
ALTER TABLE "Card"
ADD COLUMN "template" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN "colorScheme" TEXT NOT NULL DEFAULT 'forest';