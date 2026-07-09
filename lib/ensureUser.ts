import { auth, currentUser } from "@clerk/nextjs/server";
import { users } from "@/db/schema";
import { db } from "@/lib/db";

/**
 * Lazily mirrors the Clerk user into our `users` table.
 * Upserts on every call so a changed Clerk email re-syncs
 * (reminder emails must go to the current address).
 * Returns the Clerk userId for convenience.
 */
export async function ensureUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("ensureUser called without an authenticated user");

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Authenticated user has no email address");

  await db
    .insert(users)
    .values({ id: userId, email })
    .onConflictDoUpdate({ target: users.id, set: { email } });

  return userId;
}
