"use client";

import { useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { ItemForm, type ItemFormDefaults } from "@/components/ItemForm";
import type { ScanResult } from "@/lib/scan";
import type { ItemFormState } from "@/app/(app)/items/actions";

/** Edit-page wrapper: attach more photos (upload-only, no AI extraction). */
export function EditItemFlow({
  action,
  defaults,
}: {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  defaults: ItemFormDefaults;
}) {
  const [photos, setPhotos] = useState<string[]>(defaults.imageUrls ?? []);
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  function attachPhoto(_result: ScanResult | null, imageUrl: string | null) {
    if (!imageUrl) {
      setNotice("Photo upload isn't available right now — try again later.");
      return;
    }
    setPhotos((p) => [...p, imageUrl]);
    setFormKey((k) => k + 1);
    setNotice("Photo attached — save changes to keep it.");
  }

  return (
    <div className="space-y-5">
      <CameraCapture
        label="📷 Add a photo"
        extract={false}
        onResult={attachPhoto}
        onError={setNotice}
      />

      {notice && (
        <p
          role="status"
          className="rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
        >
          {notice}
        </p>
      )}

      <ItemForm
        key={formKey}
        action={action}
        defaults={{ ...defaults, imageUrls: photos }}
        submitLabel="Save changes"
      />
    </div>
  );
}
