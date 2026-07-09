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
  // Accumulated extraction across scans: name and expiry often live on
  // different sides of the packaging, so a second photo fills the gaps
  // without wiping what the first one read.
  const [scanned, setScanned] = useState<ScanResult | null>(null);

  function applyScan(result: ScanResult) {
    const unusable =
      result.confidence < SCAN_MIN_CONFIDENCE ||
      (!result.name && !result.expiryDate);
    if (unusable) {
      setNotice({
        kind: "warn",
        text: "Couldn't read that photo confidently — try again closer to the print, or fill the form manually.",
      });
      return; // keep whatever earlier scans already filled
    }

    const merged: ScanResult = {
      name: result.name ?? scanned?.name ?? null,
      expiryDate: result.expiryDate ?? scanned?.expiryDate ?? null,
      category: result.category ?? scanned?.category ?? null,
      confidence: result.confidence,
    };
    setScanned(merged);
    setDefaults({
      name: merged.name ?? undefined,
      category: merged.category ?? undefined,
      expiryDate: merged.expiryDate ?? undefined,
    });
    setFormKey((k) => k + 1);

    if (!merged.expiryDate) {
      setNotice({
        kind: "warn",
        text: "Got the name — now scan just the expiry date. It's usually printed on the back, bottom, cap, or tube crimp.",
      });
    } else if (!merged.name) {
      setNotice({
        kind: "warn",
        text: "Got the date — now scan the front of the pack for the name, or type it below.",
      });
    } else {
      setNotice({
        kind: "info",
        text: "Check the extracted details below, then save.",
      });
    }
  }

  const scanLabel = !scanned
    ? "📷 Scan label"
    : !scanned.expiryDate
      ? "📷 Scan the expiry date"
      : !scanned.name
        ? "📷 Scan the product name"
        : "📷 Rescan a part";

  return (
    <div className="space-y-5">
      <CameraCapture
        label={scanLabel}
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

      <ItemForm
        key={formKey}
        action={action}
        defaults={defaults}
        submitLabel="Add item"
      />
    </div>
  );
}
