import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { asc, eq } from "drizzle-orm";
import { items, users } from "@/db/schema";
import { db } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { ensureUser } from "@/lib/ensureUser";
import { ItemCard } from "@/components/ItemCard";

export default async function DashboardPage() {
  const userId = await ensureUser();
  const [me, list] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.items.findMany({
      where: eq(items.userId, userId),
      orderBy: [asc(items.expiryDate)],
    }),
  ]);
  const tz = me?.timezone ?? "Asia/Kolkata";

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your items</h1>
        <UserButton />
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center dark:border-white/15">
          <p className="text-base font-medium">Nothing tracked yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Add your first item and never miss an expiry again.
          </p>
          <Link
            href="/items/new"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-foreground px-5 text-base font-medium text-background"
          >
            Add an item
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} daysLeft={daysUntil(item.expiryDate, tz)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
