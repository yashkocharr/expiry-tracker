"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { items } from "@/db/schema";
import { deleteThumbnail } from "@/lib/blob";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensureUser";
import {
  isUuid,
  itemFormSchema,
  USER_SETTABLE_STATUSES,
  type UserSettableStatus,
} from "@/lib/validators";

export type ItemFormState = {
  ok: boolean;
  /** field name -> first error message */
  errors: Record<string, string>;
  message?: string;
};

function parseItemForm(formData: FormData) {
  const parsed = itemFormSchema.safeParse(Object.fromEntries(formData));
  if (parsed.success) return { data: parsed.data, errors: null };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}

export async function createItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const userId = await ensureUser();
  const { data, errors } = parseItemForm(formData);
  if (!data) return { ok: false, errors: errors ?? {} };

  await db.insert(items).values({
    userId,
    name: data.name,
    category: data.category,
    expiryDate: data.expiryDate,
    purchaseDate: data.purchaseDate ?? null,
    quantity: data.quantity ?? null,
    notes: data.notes ?? null,
    imageUrl: data.imageUrl ?? null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateItem(
  itemId: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const userId = await ensureUser();
  if (!isUuid(itemId)) {
    return { ok: false, errors: {}, message: "Item not found" };
  }
  const { data, errors } = parseItemForm(formData);
  if (!data) return { ok: false, errors: errors ?? {} };

  const updated = await db
    .update(items)
    .set({
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      purchaseDate: data.purchaseDate ?? null,
      quantity: data.quantity ?? null,
      notes: data.notes ?? null,
      // The edit form carries the existing thumbnail through a hidden field;
      // absent means the item never had one.
      imageUrl: data.imageUrl ?? null,
    })
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .returning({ id: items.id });

  if (updated.length === 0) {
    return { ok: false, errors: {}, message: "Item not found" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteItem(itemId: string): Promise<void> {
  const userId = await ensureUser();
  if (!isUuid(itemId)) redirect("/dashboard");

  const [deleted] = await db
    .delete(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .returning({ imageUrl: items.imageUrl });
  await deleteThumbnail(deleted?.imageUrl ?? null);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Form action for the per-card status buttons (consumed / discarded / restore). */
export async function setItemStatus(formData: FormData): Promise<void> {
  const userId = await ensureUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    !isUuid(id) ||
    !(USER_SETTABLE_STATUSES as readonly string[]).includes(status)
  ) {
    return;
  }

  await db
    .update(items)
    .set({ status: status as UserSettableStatus })
    .where(and(eq(items.id, id), eq(items.userId, userId)));

  revalidatePath("/dashboard");
}
