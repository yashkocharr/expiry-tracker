import {
  pgTable,
  text,
  uuid,
  date,
  timestamp,
  integer,
  pgEnum,
  index,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "food",
  "medicine",
  "cosmetics",
  "documents",
]);
export const itemStatusEnum = pgEnum("item_status", [
  "active",
  "consumed",
  "expired",
  "discarded",
]);
export const notifChannelEnum = pgEnum("notif_channel", ["email", "push"]);

// Minimal mirror of the Clerk user. Lazily upserted on first authenticated action.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(), // needed by the cron to send reminders
  // Per-user timezone for "days until" math — multi-user correctness.
  // Defaults to APP_TZ; not user-editable until settings ship.
  timezone: text("timezone").default("Asia/Kolkata").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: categoryEnum("category").notNull(),
    expiryDate: date("expiry_date").notNull(),
    purchaseDate: date("purchase_date"),
    quantity: text("quantity"), // freeform, e.g. "500ml", "30 tablets"
    notes: text("notes"),
    imageUrls: text("image_urls").array(), // all label photos; [0] is the card thumbnail
    status: itemStatusEnum("status").default("active").notNull(),
    notifyLeadDays: integer("notify_lead_days").array(), // nullable override of category default
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("items_user_idx").on(t.userId),
    index("items_user_status_idx").on(t.userId, t.status),
    index("items_expiry_idx").on(t.expiryDate),
  ],
);

// Per-user daily scan counter — caps Gemini usage (free-tier quota is small and shared).
export const scanUsage = pgTable(
  "scan_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    count: integer("count").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

// Guarantees idempotent reminders: a given threshold for a given item is sent at most once per channel.
export const notificationLog = pgTable(
  "notification_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    leadDay: integer("lead_day").notNull(),
    channel: notifChannelEnum("channel").default("email").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (t) => [unique("notif_unique_send").on(t.itemId, t.leadDay, t.channel)],
);
