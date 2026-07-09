import { ItemForm } from "@/components/ItemForm";
import { createItem } from "../actions";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Add item</h1>
      <ItemForm action={createItem} submitLabel="Add item" />
    </div>
  );
}
