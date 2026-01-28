export function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Week starts Monday
export function weekStartISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

export function prevWeekStartISO(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return toISODate(d);
}
