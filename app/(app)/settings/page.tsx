import { SignOutButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { users } from "@/db/schema";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const [{ userId }, me] = await Promise.all([auth(), currentUser()]);

  // Reminders go to users.email — keep it in sync with Clerk here, the one
  // page where Clerk's API is queried anyway (page views elsewhere stay
  // a single fast SELECT).
  const email = me?.primaryEmailAddress?.emailAddress;
  if (userId && email) {
    await db
      .insert(users)
      .values({ id: userId, email })
      .onConflictDoUpdate({ target: users.id, set: { email } });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <p className="text-sm text-foreground/60">Signed in as</p>
        <p className="mt-0.5 font-medium">{email}</p>
        <p className="mt-2 text-xs text-foreground/50">
          Reminder emails go to this address.
        </p>
      </section>

      <SignOutButton redirectUrl="/">
        <button className="flex min-h-12 w-full items-center justify-center rounded-xl border border-red-500/40 text-base font-medium text-red-600 dark:text-red-400">
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}
