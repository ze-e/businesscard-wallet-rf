-- Drop old logo text index and column
DROP INDEX IF EXISTS "Card_userId_logo_idx";
ALTER TABLE "Card" DROP COLUMN IF EXISTS "logo";

-- Add logo image field
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "logoImage" TEXT;
