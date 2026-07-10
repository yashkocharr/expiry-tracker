"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";

const CHIPS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "soon", label: "≤ 7 days" },
  { key: "expired", label: "Expired" },
  { key: "history", label: "History" },
  ...CATEGORIES.map((c) => ({
    key: c,
    label: `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}`,
  })),
];

function href(filter: string, q: string): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export function FilterBar({ filter, q }: { filter: string; q: string }) {
  const router = useRouter();
  const [term, setTerm] = useState(q);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={term}
        placeholder="Search items…"
        aria-label="Search items by name"
        className="min-h-11 w-full rounded-xl border border-black/15 bg-transparent px-3 text-base outline-none focus:border-foreground/60 dark:border-white/20"
        onChange={(e) => {
          const value = e.target.value;
          setTerm(value);
          clearTimeout(debounce.current);
          debounce.current = setTimeout(
            () => router.replace(href(filter, value.trim()), { scroll: false }),
            300,
          );
        }}
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHIPS.map((chip) => {
          const selected = filter === chip.key;
          return (
            <Link
              key={chip.key}
              href={href(chip.key, term.trim())}
              replace
              scroll={false}
              className={`flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/15 text-foreground/70 dark:border-white/20"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
