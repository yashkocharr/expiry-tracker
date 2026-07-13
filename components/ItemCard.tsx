import Link from "next/link";
import { CATEGORY_META } from "@/lib/categories";
import {
  daysLeftLabel,
  formatDisplayDate,
  urgencyOf,
  type Urgency,
} from "@/lib/dates";
import { PhotoGallery } from "@/components/PhotoGallery";
import { StatusActions } from "@/components/StatusActions";
import type { items } from "@/db/schema";

type Item = typeof items.$inferSelect;

// Dark-mode-safe urgency palette (plan: expired red, ≤3d amber, ≤7d yellow).
const URGENCY_TEXT: Record<Urgency, string> = {
  expired: "text-red-600 dark:text-red-400",
  critical: "text-amber-600 dark:text-amber-400",
  soon: "text-yellow-600 dark:text-yellow-500",
  normal: "text-foreground/60",
};
const URGENCY_EDGE: Record<Urgency, string> = {
  expired: "border-l-red-500/70",
  critical: "border-l-amber-500/70",
  soon: "border-l-yellow-500/60",
  normal: "border-l-transparent",
};

export function ItemCard({ item, daysLeft }: { item: Item; daysLeft: number }) {
  const cat = CATEGORY_META[item.category];
  const done = item.status === "consumed" || item.status === "discarded";
  const urgency: Urgency =
    item.status === "expired" ? "expired" : done ? "normal" : urgencyOf(daysLeft);

  const rightLabel =
    item.status === "active" ? daysLeftLabel(daysLeft) : item.status;

  return (
    <article
      className={`rounded-2xl border border-l-4 border-black/10 p-4 dark:border-white/10 ${
        URGENCY_EDGE[urgency]
      } ${done ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Outside the Link: tapping the photo opens the viewer, not the edit page */}
        {item.imageUrls?.[0] && <PhotoGallery urls={[item.imageUrls[0]]} />}
        <Link
          href={`/items/${item.id}/edit`}
          className="block min-w-0 flex-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
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
            <p
              className={`shrink-0 pt-0.5 text-right text-sm font-medium ${
                done ? "text-foreground/50" : URGENCY_TEXT[urgency]
              }`}
            >
              {rightLabel}
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-3">
        <StatusActions itemId={item.id} status={item.status} />
      </div>
    </article>
  );
}
