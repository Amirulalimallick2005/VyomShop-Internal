-- AlterTable
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "templateFields" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "attributes" JSONB DEFAULT '{}';

-- Migrate existing data into attributes
UPDATE "products"
SET "attributes" = jsonb_strip_nulls(
  jsonb_build_object(
    'gender', "gender",
    'sizes', "sizes",
    'colors', "colors",
    'type', "subcategory"
  )
)
WHERE "attributes" = '{}'::jsonb OR "attributes" IS NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN IF EXISTS "colors",
DROP COLUMN IF EXISTS "gender",
DROP COLUMN IF EXISTS "sizes",
DROP COLUMN IF EXISTS "subcategory";
