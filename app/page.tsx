import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-10 px-6 py-12">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Expiry Tracker
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          Nothing in your home expires unnoticed again.
        </h1>
        <p className="text-base leading-relaxed text-foreground/70">
          Snap a photo of any label — food, medicine, cosmetics, documents —
          and get an email before it expires.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Show when="signed-out">
          <Link
            href="/sign-up"
            className="flex min-h-12 items-center justify-center rounded-xl bg-foreground text-base font-medium text-background"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="flex min-h-12 items-center justify-center rounded-xl border border-black/15 text-base font-medium dark:border-white/20"
          >
            Sign in
          </Link>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="flex min-h-12 items-center justify-center rounded-xl bg-foreground text-base font-medium text-background"
          >
            Open dashboard
          </Link>
        </Show>
      </div>
    </main>
  );
}
