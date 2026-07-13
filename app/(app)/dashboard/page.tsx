import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { and, asc, eq, ilike, inArray, lte, sql } from "drizzle-orm";
import { items } from "@/db/schema";
import { db } from "@/lib/db";
import { daysUntil, isoAddDays, todayInTz } from "@/lib/dates";
import { getCurrentAppUser } from "@/lib/ensureUser";
import { CATEGORIES, type Category } from "@/lib/categories";
import { FilterBar } from "@/components/FilterBar";
import { ItemCard } from "@/components/ItemCard";

type Filter = "all" | "soon" | "expired" | "history" | Category;
const FILTERS = new Set<string>(["all", "soon", "expired", "history", ...CATEGORIES]);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawFilter = typeof sp.filter === "string" ? sp.filter : "all";
  const filter = (FILTERS.has(rawFilter) ? rawFilter : "all") as Filter;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);

  const me = await getCurrentAppUser();
  const userId = me.id;
  const tz = me.timezone;
  const soonCutoff = isoAddDays(todayInTz(tz), 7);

  const conds = [eq(items.userId, userId)];
  if (filter === "all") conds.push(eq(items.status, "active"));
  else if (filter === "soon")
    conds.push(eq(items.status, "active"), lte(items.expiryDate, soonCutoff));
  else if (filter === "expired") conds.push(eq(items.status, "expired"));
  else if (filter === "history")
    conds.push(inArray(items.status, ["consumed", "discarded"]));
  else conds.push(eq(items.status, "active"), eq(items.category, filter));
  if (q) conds.push(ilike(items.name, `%${q}%`));

  const [list, [stats]] = await Promise.all([
    db.query.items.findMany({
      where: and(...conds),
      orderBy: [asc(items.expiryDate)],
    }),
    db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        active: sql<number>`count(*) filter (where ${items.status} = 'active')`.mapWith(Number),
        soon: sql<number>`count(*) filter (where ${items.status} = 'active' and ${items.expiryDate} <= ${soonCutoff})`.mapWith(Number),
        expired: sql<number>`count(*) filter (where ${items.status} = 'expired')`.mapWith(Number),
      })
      .from(items)
      .where(eq(items.userId, userId)),
  ]);

  const hasAnyItems = stats.total > 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your items</h1>
        <UserButton />
      </header>

      {hasAnyItems && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatTile href="/dashboard" label="Active" value={stats.active} />
            <StatTile
              href="/dashboard?filter=soon"
              label="≤ 7 days"
              value={stats.soon}
              tone={stats.soon > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
            />
            <StatTile
              href="/dashboard?filter=expired"
              label="Expired"
              value={stats.expired}
              tone={stats.expired > 0 ? "text-red-600 dark:text-red-400" : undefined}
            />
          </div>

          <FilterBar filter={filter} q={q} />
        </>
      )}

      {list.length === 0 ? (
        !hasAnyItems ? (
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
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center dark:border-white/15">
            <p className="text-base font-medium">No items match</p>
            <p className="mt-1 text-sm text-foreground/60">
              {q ? `Nothing named “${q}” here.` : "This view is empty right now."}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
            >
              Clear filters
            </Link>
          </div>
        )
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

function StatTile({
  href,
  label,
  value,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-black/10 px-3 py-2.5 dark:border-white/10"
    >
      <p className={`text-xl font-semibold ${tone ?? ""}`}>{value}</p>
      <p className="mt-0.5 text-xs text-foreground/55">{label}</p>
    </Link>
  );
}
