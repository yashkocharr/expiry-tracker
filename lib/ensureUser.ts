import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { db } from "@/lib/db";

export type AppUser = typeof users.$inferSelect;

/**
 * The app's user row for the signed-in Clerk user.
 *
 * Fast path (every render): one primary-key SELECT. Only on the first-ever
 * visit does it call Clerk's API and insert the row — previously this did a
 * Clerk network call + upsert on EVERY page view, a real latency tax.
 * Email re-sync lives on the settings page, where Clerk is queried anyway.
 */
export async function getCurrentAppUser(): Promise<AppUser> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("getCurrentAppUser called without an authenticated user");
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Authenticated user has no email address");

  const [row] = await db
    .insert(users)
    .values({ id: userId, email })
    .onConflictDoUpdate({ target: users.id, set: { email } }) // race-safe
    .returning();
  return row;
}

/** Convenience for callers that only need the id. */
export async function ensureUser(): Promise<string> {
  return (await getCurrentAppUser()).id;
}
