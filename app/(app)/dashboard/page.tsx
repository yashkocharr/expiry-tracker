import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensureUser";

export default async function DashboardPage() {
  const userId = await ensureUser();
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    db.query.users.findFirst({ where: eq(users.id, userId) }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <UserButton />
      </header>

      <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <p className="text-lg font-medium">
          Hi {clerkUser?.firstName ?? "there"} 👋
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/60">
          You&apos;re signed in as {dbUser?.email}. Your account is set up —
          adding items arrives in Phase 1.
        </p>
      </section>
    </div>
  );
}
