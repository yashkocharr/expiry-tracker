"use client";

import { useEffect, useState } from "react";

/**
 * Thumbnail strip; tapping a photo opens a full-screen viewer.
 * Dismiss by tapping anywhere, the × button, or Escape.
 */
export function PhotoGallery({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (urls.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto">
        {urls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(url)}
            className="shrink-0 rounded-xl"
            aria-label="View photo full size"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny blob thumbnail */}
            <img
              src={url}
              alt="Attached label photo"
              loading="lazy"
              width={56}
              height={56}
              className="h-14 w-14 rounded-xl border border-black/10 object-cover dark:border-white/10"
            />
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size blob photo */}
          <img
            src={open}
            alt="Label photo, full size"
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
