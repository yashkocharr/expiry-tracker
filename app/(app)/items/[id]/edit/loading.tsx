export default function EditItemLoading() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-7 w-28 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
      <div className="h-12 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 w-24 animate-pulse rounded bg-black/5 dark:bg-white/10" />
          <div className="h-12 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
        </div>
      ))}
      <div className="h-12 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
    </div>
  );
}
