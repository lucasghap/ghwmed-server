-- AlterTable
ALTER TABLE "platform_settings"
ADD COLUMN "login_logo_path" TEXT,
ADD COLUMN "header_logo_path" TEXT,
ADD COLUMN "favicon_path" TEXT;

-- Preserve the previously configured logo as the header lockup.
UPDATE "platform_settings"
SET "header_logo_path" = "logo_path"
WHERE "logo_path" IS NOT NULL;

-- AlterTable
ALTER TABLE "platform_settings" DROP COLUMN "logo_path";
