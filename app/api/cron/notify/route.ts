// Daily reminder check. Vercel Cron invokes this with GET and, when the
// CRON_SECRET env var is set, an "Authorization: Bearer <CRON_SECRET>" header.
// Hobby-plan cron is best-effort and can double-fire — the notification_log
// unique constraint makes sends idempotent regardless.
//
// GitHub Actions fallback (if Vercel cron ever misbehaves): a scheduled
// workflow that curls this URL with the same Bearer header.
import { eq, inArray } from "drizzle-orm";
import { items, notificationLog, users } from "@/db/schema";
import { daysUntil } from "@/lib/dates";
import { db } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email/send";
import type { ReminderEntry } from "@/lib/email/reminderTemplate";
import { effectiveLeadDays } from "@/lib/notifications";

export const maxDuration = 60;

type DueEntry = ReminderEntry & { itemId: string };

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await db
    .select({ item: items, user: users })
    .from(items)
    .innerJoin(users, eq(items.userId, users.id))
    .where(eq(items.status, "active"));

  // Bucket by user: one email per user per run, days computed in THEIR timezone.
  const toExpire: string[] = [];
  const dueByUser = new Map<string, { email: string; due: DueEntry[] }>();
  for (const { item, user } of rows) {
    const d = daysUntil(item.expiryDate, user.timezone);
    if (d < 0) {
      toExpire.push(item.id);
      continue;
    }
    if (!effectiveLeadDays(item).includes(d)) continue;
    const bucket = dueByUser.get(user.id) ?? { email: user.email, due: [] };
    bucket.due.push({
      itemId: item.id,
      name: item.name,
      category: item.category,
      expiryDate: item.expiryDate,
      daysLeft: d,
      quantity: item.quantity,
    });
    dueByUser.set(user.id, bucket);
  }

  if (toExpire.length > 0) {
    await db
      .update(items)
      .set({ status: "expired" })
      .where(inArray(items.id, toExpire));
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const { email, due } of dueByUser.values()) {
    // Claim first (at-most-once): the unique constraint absorbs double-fires
    // and races. Claims are released only if the send fails, so tomorrow's
    // run retries — this is what lets non-owner emails start working the
    // moment the Resend domain is verified.
    const claimed: (DueEntry & { logId: string })[] = [];
    for (const entry of due) {
      const res = await db
        .insert(notificationLog)
        .values({ itemId: entry.itemId, leadDay: entry.daysLeft })
        .onConflictDoNothing()
        .returning({ id: notificationLog.id });
      if (res.length > 0) claimed.push({ ...entry, logId: res[0].id });
      else skipped++;
    }
    if (claimed.length === 0) continue;

    try {
      await sendReminderEmail(email, claimed);
      sent += claimed.length;
    } catch (err) {
      failed += claimed.length;
      console.error("[cron] send failed, releasing claims:", err);
      await db.delete(notificationLog).where(
        inArray(
          notificationLog.id,
          claimed.map((c) => c.logId),
        ),
      );
    }
  }

  return Response.json({
    ok: true,
    checked: rows.length,
    sent,
    skipped,
    failed,
    expired: toExpire.length,
  });
}
