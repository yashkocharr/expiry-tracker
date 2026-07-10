export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-black/5 dark:bg-white/10"
          />
        ))}
      </div>
      <div className="h-11 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}
