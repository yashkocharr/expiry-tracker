import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const me = await currentUser();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <p className="text-sm text-foreground/60">Signed in as</p>
        <p className="mt-0.5 font-medium">
          {me?.primaryEmailAddress?.emailAddress}
        </p>
      </section>

      <SignOutButton redirectUrl="/">
        <button className="flex min-h-12 w-full items-center justify-center rounded-xl border border-red-500/40 text-base font-medium text-red-600 dark:text-red-400">
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}
