// Server-only: Gemini vision extraction for the scan flow.
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";
import { isoDate } from "@/lib/validators";
import type { ScanResult } from "@/lib/scan";

// Rolling alias: pinned Gemini models keep being retired (2.0-flash and
// 2.5-flash both died during this project). Override to pin via GEMINI_MODEL.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";

// Verified failure mode: on an unreadable image the model happily invents a
// plausible product WITH high confidence — hence the aggressive no-guessing
// rules, and the UI always shows the extraction for user confirmation.
const SCAN_PROMPT = `You extract product info from a photo of a product label or packaging.

Report ONLY text that is actually visible and legible in the photo. Do not guess or invent values.
If the photo does not clearly show product packaging, return null for every field and confidence 0.
The photo may intentionally show only PART of the packaging (for example just the printed
date stamp on a crimp, cap, or base) — extract whatever is clearly visible and null the rest.

Rules:
- expiryDate MUST be ISO yyyy-mm-dd, from the printed expiry / best-before / use-by date.
- "MM/YY" or "MM/YYYY" -> the last calendar day of that month.
- "best before N months" printed alongside a visible manufacture date -> compute the date.
- If the expiry is unreadable, ambiguous, or absent, set expiryDate to null.
- name: the product name as printed (brand + product, concise), else null.
- category: the best fit, else null.
- confidence: 0..1 for the extraction overall; be conservative.`;

// Loose schema for the model; strict normalization happens below.
const geminiSchema = z.object({
  name: z.string().nullable(),
  expiryDate: z.string().nullable(),
  category: z.enum(CATEGORIES).nullable(),
  confidence: z.number(),
});

/** Throws on API failure — the route maps that to the manual-entry fallback. */
export async function extractLabel(
  image: Uint8Array,
  mediaType: string,
): Promise<ScanResult> {
  const { object } = await generateObject({
    model: google(MODEL),
    schema: geminiSchema,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: SCAN_PROMPT },
          { type: "image", image, mediaType },
        ],
      },
    ],
  });

  // Never trust model output shape beyond the schema: re-validate the date,
  // trim the name, clamp confidence.
  const name = object.name?.trim() ? object.name.trim().slice(0, 200) : null;
  const expiryDate =
    object.expiryDate && isoDate.safeParse(object.expiryDate).success
      ? object.expiryDate
      : null;

  return {
    name,
    expiryDate,
    category: object.category,
    confidence: Math.min(1, Math.max(0, object.confidence)),
  };
}
