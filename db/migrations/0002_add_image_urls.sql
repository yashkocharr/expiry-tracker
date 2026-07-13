ALTER TABLE "items" ADD COLUMN "image_urls" text[];
--> statement-breakpoint
UPDATE "items" SET "image_urls" = ARRAY["image_url"] WHERE "image_url" IS NOT NULL;