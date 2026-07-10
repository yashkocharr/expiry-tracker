"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { Spinner } from "@/components/PendingButton";

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
  const [isPending, startTransition] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function nav(nextFilter: string, nextQ: string) {
    startTransition(() => {
      router.replace(href(nextFilter, nextQ), { scroll: false });
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="search"
          value={term}
          placeholder="Search items…"
          aria-label="Search items by name"
          className="min-h-11 w-full rounded-xl border border-black/15 bg-transparent px-3 pr-10 text-base outline-none focus:border-foreground/60 dark:border-white/20"
          onChange={(e) => {
            const value = e.target.value;
            setTerm(value);
            clearTimeout(debounce.current);
            debounce.current = setTimeout(() => nav(filter, value.trim()), 300);
          }}
        />
        {isPending && (
          <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" />
        )}
      </div>

      <div
        className={`-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isPending ? "opacity-60" : ""
        }`}
      >
        {CHIPS.map((chip) => {
          const selected = filter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => nav(chip.key, term.trim())}
              className={`flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/15 text-foreground/70 dark:border-white/20"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
