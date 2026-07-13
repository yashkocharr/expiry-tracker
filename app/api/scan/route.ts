import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { scanUsage } from "@/db/schema";
import { uploadThumbnail } from "@/lib/blob";
import { todayInTz } from "@/lib/dates";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensureUser";
import { extractLabel } from "@/lib/gemini";
import { SCAN_DAILY_LIMIT, type ScanResponse } from "@/lib/scan";

const MAX_BYTES = 8 * 1024 * 1024; // client compresses to ~100-300 KB; generous guard
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function json(body: ScanResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json({ ok: false, error: "unauthorized" }, 401);
  await ensureUser(); // guarantee the users row exists for the quota FK

  // Atomic per-user daily counter (day boundary in the app's home timezone).
  const day = todayInTz(process.env.APP_TZ ?? "Asia/Kolkata");
  const [usage] = await db
    .insert(scanUsage)
    .values({ userId, day, count: 1 })
    .onConflictDoUpdate({
      target: [scanUsage.userId, scanUsage.day],
      set: { count: sql`${scanUsage.count} + 1` },
    })
    .returning({ count: scanUsage.count });
  if (usage.count > SCAN_DAILY_LIMIT) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const field = form.get("image");
    file = field instanceof File ? field : null;
  } catch {
    // malformed multipart body -> invalid_image below
  }
  if (
    !file ||
    file.size === 0 ||
    file.size > MAX_BYTES ||
    !ACCEPTED_TYPES.has(file.type)
  ) {
    return json({ ok: false, error: "invalid_image" }, 400);
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await extractLabel(bytes, file.type);
    // Reuse the same compressed photo as the item thumbnail (Phase 5).
    // Null when Blob isn't configured or upload fails — never blocks the scan.
    const imageUrl = await uploadThumbnail(userId, bytes, file.type);
    return json({ ok: true, result, imageUrl }, 200);
  } catch (err) {
    console.error("[scan] extraction failed:", err);
    return json({ ok: false, error: "scan_failed" }, 502);
  }
}
