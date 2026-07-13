// Authenticated config sanity-check — presence booleans and non-secret
// identifiers only, never values. Open /api/health in a signed-in browser
// to see what THIS deployment is actually running with.
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  // Token format: vercel_blob_rw_<storeSuffix>_<secret> — the store suffix
  // is not secret and tells us which store this deployment writes to.
  const storeMatch = blobToken.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);

  return Response.json({
    ok: true,
    region: process.env.VERCEL_REGION ?? "local",
    blob: {
      configured: blobToken.length > 0,
      tokenTargetsStore: storeMatch ? `store_${storeMatch[1]}` : null,
    },
    email: {
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
      testRedirectActive: Boolean(process.env.EMAIL_TEST_RECIPIENT),
      customSenderConfigured: Boolean(process.env.EMAIL_FROM),
    },
    cron: { secretConfigured: Boolean(process.env.CRON_SECRET) },
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });
}
