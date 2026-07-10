// Reminder cadence per category (plan §5) — constants, not DB, in v1.
export const CATEGORY_LEAD_DAYS: Record<string, number[]> = {
  food: [3, 1, 0],
  medicine: [30, 7, 0],
  cosmetics: [30, 7],
  documents: [60, 30, 7],
};

/** item.notifyLeadDays overrides the category default when present. */
export function effectiveLeadDays(item: {
  category: string;
  notifyLeadDays: number[] | null;
}): number[] {
  return item.notifyLeadDays ?? CATEGORY_LEAD_DAYS[item.category] ?? [7, 1];
}
