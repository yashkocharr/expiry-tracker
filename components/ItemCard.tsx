import Link from "next/link";
import { CATEGORY_META } from "@/lib/categories";
import { daysLeftLabel, formatDisplayDate } from "@/lib/dates";
import { StatusActions } from "@/components/StatusActions";
import type { items } from "@/db/schema";

type Item = typeof items.$inferSelect;

export function ItemCard({ item, daysLeft }: { item: Item; daysLeft: number }) {
  const cat = CATEGORY_META[item.category];
  const inactive = item.status !== "active";

  return (
    <article
      className={`rounded-2xl border border-black/10 p-4 dark:border-white/10 ${
        inactive ? "opacity-60" : ""
      }`}
    >
      <Link href={`/items/${item.id}/edit`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
              {cat.emoji} {cat.label}
            </span>
            <h2 className="mt-1.5 truncate text-base font-semibold">
              {item.name}
            </h2>
            <p className="mt-0.5 text-sm text-foreground/60">
              Expires {formatDisplayDate(item.expiryDate)}
              {item.quantity ? ` · ${item.quantity}` : ""}
            </p>
          </div>
          <p className="shrink-0 pt-0.5 text-right text-sm font-medium">
            {item.status === "active" ? daysLeftLabel(daysLeft) : item.status}
          </p>
        </div>
      </Link>

      <div className="mt-3">
        <StatusActions itemId={item.id} status={item.status} />
      </div>
    </article>
  );
}
