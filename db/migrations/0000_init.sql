CREATE TYPE "public"."category" AS ENUM('food', 'medicine', 'cosmetics', 'documents');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('active', 'consumed', 'expired', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."notif_channel" AS ENUM('email', 'push');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" "category" NOT NULL,
	"expiry_date" date NOT NULL,
	"purchase_date" date,
	"quantity" text,
	"notes" text,
	"image_url" text,
	"status" "item_status" DEFAULT 'active' NOT NULL,
	"notify_lead_days" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"lead_day" integer NOT NULL,
	"channel" "notif_channel" DEFAULT 'email' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notif_unique_send" UNIQUE("item_id","lead_day","channel")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_user_idx" ON "items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "items_user_status_idx" ON "items" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "items_expiry_idx" ON "items" USING btree ("expiry_date");