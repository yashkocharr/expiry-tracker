"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "@/lib/compressImage";
import type { ScanResponse, ScanResult } from "@/lib/scan";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Daily scan limit reached — enter the details manually.",
  unauthorized: "Session expired — refresh and sign in again.",
  invalid_image: "That image couldn't be used — try another photo.",
  scan_failed: "Couldn't read the label — fill the form manually.",
};

export function CameraCapture({
  onResult,
  onError,
  label = "📷 Take a photo of the label",
}: {
  onResult: (result: ScanResult) => void;
  onError: (message: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Avoid leaking object URLs as previews change / on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      setPreview(URL.createObjectURL(compressed));

      const body = new FormData();
      body.append("image", compressed, "label.jpg");
      const res = await fetch("/api/scan", { method: "POST", body });
      const data: ScanResponse | null = await res.json().catch(() => null);

      if (!data || !data.ok) {
        onError(ERROR_MESSAGES[data?.ok === false ? data.error : "scan_failed"]);
        return;
      }
      onResult(data.result);
    } catch {
      onError("Couldn't process that photo — fill the form manually.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-base font-medium text-background disabled:opacity-60"
      >
        {busy ? "Reading photo…" : label}
      </button>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- transient local object URL
        <img
          src={preview}
          alt="Scanned label preview"
          className="h-12 w-12 shrink-0 rounded-lg border border-black/10 object-cover dark:border-white/10"
        />
      )}
    </div>
  );
}
