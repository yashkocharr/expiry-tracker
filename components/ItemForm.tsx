"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import type { ItemFormState } from "@/app/(app)/items/actions";

const EMPTY_STATE: ItemFormState = { ok: false, errors: {} };

const inputCls =
  "w-full min-h-12 rounded-xl border border-black/15 bg-transparent px-3 text-base outline-none focus:border-foreground/60 dark:border-white/20";

export type ItemFormDefaults = {
  name?: string;
  category?: string;
  expiryDate?: string;
  purchaseDate?: string | null;
  quantity?: string | null;
  notes?: string | null;
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function ItemForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  defaults?: ItemFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY_STATE);

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <Field label="Name" htmlFor="name" error={state.errors.name}>
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          defaultValue={defaults?.name}
          placeholder="e.g. Amul Butter"
          className={inputCls}
        />
      </Field>

      <Field label="Category" htmlFor="category" error={state.errors.category}>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaults?.category ?? "food"}
          className={inputCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Expiry date"
        htmlFor="expiryDate"
        error={state.errors.expiryDate}
      >
        <input
          id="expiryDate"
          name="expiryDate"
          type="date"
          required
          defaultValue={defaults?.expiryDate}
          className={inputCls}
        />
      </Field>

      <Field
        label="Purchase date (optional)"
        htmlFor="purchaseDate"
        error={state.errors.purchaseDate}
      >
        <input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          defaultValue={defaults?.purchaseDate ?? undefined}
          className={inputCls}
        />
      </Field>

      <Field
        label="Quantity (optional)"
        htmlFor="quantity"
        error={state.errors.quantity}
      >
        <input
          id="quantity"
          name="quantity"
          maxLength={100}
          defaultValue={defaults?.quantity ?? undefined}
          placeholder="e.g. 500 g, 30 tablets"
          className={inputCls}
        />
      </Field>

      <Field label="Notes (optional)" htmlFor="notes" error={state.errors.notes}>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={defaults?.notes ?? undefined}
          className={`${inputCls} py-2`}
        />
      </Field>

      <div className="flex flex-col gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 items-center justify-center rounded-xl bg-foreground text-base font-medium text-background disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/dashboard"
          className="flex min-h-12 items-center justify-center rounded-xl border border-black/15 text-base font-medium dark:border-white/20"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
