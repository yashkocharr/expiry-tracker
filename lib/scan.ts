// Shared scan types/constants — safe to import from client and server.
import type { Category } from "@/lib/categories";

export type ScanResult = {
  name: string | null;
  expiryDate: string | null; // ISO yyyy-mm-dd
  category: Category | null;
  confidence: number; // 0..1
};

/** result is null in upload-only mode (?extract=0 — attach photo, skip Gemini). */
export type ScanResponse =
  | { ok: true; result: ScanResult | null; imageUrl: string | null }
  | {
      ok: false;
      error: "unauthorized" | "rate_limited" | "invalid_image" | "scan_failed";
    };

/** Below this we don't pre-fill — the model confabulates confidently on unreadable images. */
export const SCAN_MIN_CONFIDENCE = 0.4;

/** Per-user daily cap; protects the shared Gemini free-tier quota. */
export const SCAN_DAILY_LIMIT = 20;
