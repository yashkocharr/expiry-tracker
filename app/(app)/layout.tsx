import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // proxy.ts already protects these routes; this is belt-and-braces.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-24 pt-6">{children}</main>

      {/* Bottom nav — thumb-reachable, ≥44px touch targets. Add/Settings arrive in Phase 1. */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          <Link
            href="/dashboard"
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium"
          >
            <span aria-hidden>🏠</span>
            Dashboard
          </Link>
          <span
            className="flex min-h-14 flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 text-xs text-foreground/35"
            title="Coming in Phase 1"
          >
            <span aria-hidden>➕</span>
            Add
          </span>
          <span
            className="flex min-h-14 flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 text-xs text-foreground/35"
            title="Coming soon"
          >
            <span aria-hidden>⚙️</span>
            Settings
          </span>
        </div>
      </nav>
    </div>
  );
}
