"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl" aria-hidden>
        😵
      </p>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-foreground/60">
        That wasn&apos;t supposed to happen. Try again — if it keeps failing,
        your items are safe, just reload later.
      </p>
      <div className="mt-2 flex w-full flex-col gap-3">
        <button
          onClick={reset}
          className="flex min-h-12 items-center justify-center rounded-xl bg-foreground text-base font-medium text-background"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex min-h-12 items-center justify-center rounded-xl border border-black/15 text-base font-medium dark:border-white/20"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
