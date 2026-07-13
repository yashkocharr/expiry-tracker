import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl" aria-hidden>
        🫥
      </p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-foreground/60">
        This page doesn&apos;t exist — maybe the item was deleted, or the link
        is stale.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-foreground text-base font-medium text-background"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
