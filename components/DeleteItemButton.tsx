"use client";

export function DeleteItemButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this item? This can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="flex min-h-12 w-full items-center justify-center rounded-xl border border-red-500/40 text-base font-medium text-red-600 dark:text-red-400"
      >
        Delete item
      </button>
    </form>
  );
}
