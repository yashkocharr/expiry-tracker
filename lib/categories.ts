export const CATEGORIES = [
  "food",
  "medicine",
  "cosmetics",
  "documents",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  food: { label: "Food", emoji: "🍎" },
  medicine: { label: "Medicine", emoji: "💊" },
  cosmetics: { label: "Cosmetics", emoji: "🧴" },
  documents: { label: "Documents", emoji: "📄" },
};
