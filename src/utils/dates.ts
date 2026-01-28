/**
 * Formats a Date object to YYYY-MM-DD ISO format.
 */
export function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Week starts Monday
/**
 * Normalizes a date to the Monday of its week. 
 * Used for consistent data grouping in the ledger.
 */
export function weekStartISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

/**
 * Returns the Monday of the previous week.
 */
export function prevWeekStartISO(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return toISODate(d);
}
