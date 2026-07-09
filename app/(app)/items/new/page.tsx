import { AddItemFlow } from "@/components/AddItemFlow";
import { createItem } from "../actions";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Add item</h1>
      <AddItemFlow action={createItem} />
    </div>
  );
}
