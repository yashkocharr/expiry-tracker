import { setItemStatus } from "@/app/(app)/items/actions";
import { PendingButton } from "@/components/PendingButton";

const btnCls =
  "flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-black/15 text-sm font-medium dark:border-white/20";

function StatusForm({
  itemId,
  status,
  children,
}: {
  itemId: string;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <form action={setItemStatus} className="flex-1">
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="status" value={status} />
      <PendingButton className={btnCls}>{children}</PendingButton>
    </form>
  );
}

/**
 * Per-card quick actions. Plain forms posting a server action —
 * works without client JS, so cards stay server components.
 */
export function StatusActions({
  itemId,
  status,
}: {
  itemId: string;
  status: string;
}) {
  // Expired items get the same closure actions as active ones — "I used it
  // in time (forgot to log)" or "threw it out" — which is how the Expired
  // list gets cleared. Restore is only for consumed/discarded.
  if (status === "active" || status === "expired") {
    return (
      <div className="flex gap-2">
        <StatusForm itemId={itemId} status="consumed">
          ✓ Used up
        </StatusForm>
        <StatusForm itemId={itemId} status="discarded">
          🗑 Discard
        </StatusForm>
      </div>
    );
  }

  if (status === "consumed" || status === "discarded") {
    return (
      <StatusForm itemId={itemId} status="active">
        ↩ Restore
      </StatusForm>
    );
  }

  return null;
}
