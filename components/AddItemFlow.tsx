"use client";

import { useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { ItemForm, type ItemFormDefaults } from "@/components/ItemForm";
import { SCAN_MIN_CONFIDENCE, type ScanResult } from "@/lib/scan";
import type { ItemFormState } from "@/app/(app)/items/actions";

type Notice = { kind: "info" | "warn"; text: string };

export function AddItemFlow({
  action,
}: {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
}) {
  const [defaults, setDefaults] = useState<ItemFormDefaults | undefined>();
  const [formKey, setFormKey] = useState(0); // remount the uncontrolled form to apply scanned defaults
  const [notice, setNotice] = useState<Notice | null>(null);

  function applyScan(result: ScanResult) {
    const unusable =
      result.confidence < SCAN_MIN_CONFIDENCE ||
      (!result.name && !result.expiryDate);
    if (unusable) {
      setNotice({
        kind: "warn",
        text: "Couldn't read the label confidently — fill the details manually.",
      });
      return;
    }
    setDefaults({
      name: result.name ?? undefined,
      category: result.category ?? undefined,
      expiryDate: result.expiryDate ?? undefined,
    });
    setFormKey((k) => k + 1);
    setNotice({
      kind: "info",
      text: result.expiryDate
        ? "Check the extracted details below, then save."
        : "Name extracted — the expiry date couldn't be read, set it below.",
    });
  }

  return (
    <div className="space-y-5">
      <CameraCapture
        onResult={applyScan}
        onError={(text) => setNotice({ kind: "warn", text })}
      />

      {notice && (
        <p
          role="status"
          className={`rounded-xl px-3 py-2 text-sm ${
            notice.kind === "warn"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-foreground/40">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        or enter manually
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <ItemForm key={formKey} action={action} defaults={defaults} submitLabel="Add item" />
    </div>
  );
}
