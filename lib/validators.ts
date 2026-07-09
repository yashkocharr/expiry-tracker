import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO yyyy-mm-dd that is also a real calendar date (rejects 2026-02-31). */
export const isoDate = z
  .string()
  .regex(DATE_RE, "Use a valid date")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  }, "Not a real calendar date");

/** Empty form fields arrive as "" — treat them as absent. */
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalTrimmed = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

export const itemFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200, "Max 200 characters"),
    category: z.enum(CATEGORIES),
    expiryDate: isoDate,
    purchaseDate: z.preprocess(emptyToUndefined, isoDate.optional()),
    quantity: optionalTrimmed(100),
    notes: optionalTrimmed(2000),
  })
  // ISO yyyy-mm-dd compares lexicographically === chronologically
  .refine((v) => !v.purchaseDate || v.purchaseDate <= v.expiryDate, {
    path: ["purchaseDate"],
    message: "Purchase date can't be after the expiry date",
  });

export type ItemFormValues = z.infer<typeof itemFormSchema>;

/** Statuses a user may set by hand; `expired` is only ever set by the cron. */
export const USER_SETTABLE_STATUSES = ["active", "consumed", "discarded"] as const;
export type UserSettableStatus = (typeof USER_SETTABLE_STATUSES)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Guard route/action ids before they reach a Postgres uuid cast (bad casts 500). */
export const isUuid = (s: string): boolean => UUID_RE.test(s);
