import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { items } from "@/db/schema";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensureUser";
import { isUuid } from "@/lib/validators";
import { ItemForm } from "@/components/ItemForm";
import { DeleteItemButton } from "@/components/DeleteItemButton";
import { deleteItem, updateItem } from "../../actions";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const userId = await ensureUser();
  const item = await db.query.items.findFirst({
    where: and(eq(items.id, id), eq(items.userId, userId)),
  });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Edit item</h1>
      <ItemForm
        action={updateItem.bind(null, item.id)}
        submitLabel="Save changes"
        defaults={{
          name: item.name,
          category: item.category,
          expiryDate: item.expiryDate,
          purchaseDate: item.purchaseDate,
          quantity: item.quantity,
          notes: item.notes,
          imageUrl: item.imageUrl,
        }}
      />

      <div className="border-t border-black/10 pt-5 dark:border-white/10">
        <DeleteItemButton action={deleteItem.bind(null, item.id)} />
      </div>
    </div>
  );
}
