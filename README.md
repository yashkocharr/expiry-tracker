# ⏳ Expiry Tracker

A mobile-first PWA that keeps track of everything in your home that can expire — food, medicine, cosmetics, documents. Photograph the label, let AI read the name and expiry date, and get an email before it's too late.

**Live:** deployed on Vercel · installable to your phone's home screen

<!-- Add screenshots to docs/screenshots/ and update the paths below -->
<!--
| Dashboard | Scan flow | Reminder email |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Scan](docs/screenshots/scan.png) | ![Email](docs/screenshots/email.png) |
-->

## What it does

- **📷 Scan to add** — photograph a product label; Gemini vision extracts name, expiry date, and category into a pre-filled form. Name on the front but date on the crimp? Take two photos — results merge, the second only fills the gaps.
- **⏰ Email reminders** — a daily cron emails you before items expire, on a per-category cadence (food: 3/1/0 days out; medicine: 30/7/0; cosmetics: 30/7; documents: 60/30/7), overridable per item.
- **🗂 A dashboard you can actually use** — sorted soonest-first, urgency color-coding, filter chips (≤7 days / expired / history / category), search, stats.
- **📱 Installable PWA** — add to home screen, standalone display, service-worker caching.

## Architecture notes (the interesting bits)

**Stack:** Next.js 16 (App Router, RSC, Server Actions) · TypeScript · Tailwind v4 · Clerk · Drizzle + Neon Postgres · Vercel AI SDK + Gemini · Resend · Vercel Blob + Cron · Zod everywhere.

**Reads are RSCs querying Drizzle directly; mutations are Zod-validated Server Actions scoped to the authenticated user. Route handlers exist only where they must** (`/api/scan` for multipart image upload — server actions have a ~1 MB body limit — and `/api/cron/notify` for the scheduler).

Decisions that took actual thought:

- **Timezone-correct day math.** "Days until expiry" is computed per user (`users.timezone`), never from raw UTC timestamps — the classic off-by-one-around-midnight bug class. Dates are pure `DATE` columns; today is resolved via `Intl` in the user's zone and diffed at UTC midnight (dependency-free, DST-proof).
- **Idempotent reminders.** Vercel Hobby cron is best-effort and can double-fire. Every reminder claims a `notification_log` row first (unique on `item × lead-day × channel`) — claim-then-send gives at-most-once delivery; failed sends release the claim so the next run retries.
- **Cron reality.** Vercel Cron sends **GET** with `Authorization: Bearer $CRON_SECRET` auto-attached, and Hobby fires anywhere within the scheduled hour — the endpoint is designed for that, not against it.
- **Model churn resistance.** Two pinned Gemini models were retired *during development*. The scan flow targets the `gemini-flash-lite-latest` rolling alias (pin via `GEMINI_MODEL` if you need to).
- **LLMs confabulate.** Given an unreadable image, Gemini invented a plausible product at 0.95 confidence. Defenses: a no-guessing prompt, server-side re-validation of every field, a confidence gate, and — decisively — extraction only ever *pre-fills* a form the user confirms.
- **Quota protection.** `/api/scan` is auth-required with a per-user daily cap (atomic Postgres upsert counter) so a public URL can't drain the Gemini free tier.

## Run it locally

```bash
git clone https://github.com/yashkocharr/expiry-tracker && cd expiry-tracker
npm install
cp .env.example .env.local   # then fill it in (see below)
npx drizzle-kit migrate      # applies schema to your Neon database
npm run dev
```

| Env var | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon → project → pooled connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `GOOGLE_GENERATIVE_AI_API_KEY` | aistudio.google.com → Get API key |
| `RESEND_API_KEY` | Resend dashboard (without a verified domain, mail only reaches your own address — set `EMAIL_TEST_RECIPIENT` accordingly) |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob store |
| `CRON_SECRET` | any random string; Vercel echoes it back to the cron route |
| `APP_TZ` / `NEXT_PUBLIC_APP_URL` | your defaults |

**Cron:** `vercel.json` schedules `/api/cron/notify` daily at 02:30 UTC (08:00 IST). To exercise it by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>/api/cron/notify
```

Fallback if you ever leave Vercel Cron — a scheduled GitHub Action that curls the same URL with the same header.

## Roadmap (v2+)

Period-after-opening (PAO) for cosmetics · renewal cycles for documents · web push · barcode lookup · household sharing · waste analytics.

---

Built as a portfolio project — one commit per phase, each independently shippable. The commit history *is* the build log.
