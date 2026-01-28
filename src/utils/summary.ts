import { db } from "../db/db";
import type { Category } from "../db/types";
import { prevWeekStartISO } from "./dates";

export type WeeklySummary = {
  weekStart: string;
  category: Category;
  totalEntries: number;
  highCount: number;
  dominantTag: string | null;
  dominantFactor: string | null;
  score: number | null;
  level: string | null;
  trend: "increasing" | "stable" | "decreasing" | null;
};

function dominant(items: string[]) {
  const map = new Map<string, number>();
  for (const t of items) map.set(t, (map.get(t) ?? 0) + 1);
  let best: string | null = null;
  let bestN = 0;
  for (const [k, v] of map.entries()) {
    if (v > bestN) { best = k; bestN = v; }
  }
  return best;
}

export async function buildWeeklySummary(weekStart: string, category: Category): Promise<WeeklySummary> {
  const entries = await db.entries
    .where({ weekStart, category })
    .toArray();

  const totalEntries = entries.length;
  const highCount = entries.filter(e => e.exposureLevel === "high").length;

  const allTags = entries.flatMap(e => e.tags ?? []);
  const dominantTag = allTags.length ? dominant(allTags) : null;

  const snapId = `${weekStart}:${category}`;
  const snap = await db.snapshots.get(snapId);

  const prevWeek = prevWeekStartISO(weekStart);
  const prevSnap = await db.snapshots.get(`${prevWeek}:${category}`);

  let trend: WeeklySummary["trend"] = null;
  if (snap && prevSnap) {
    const delta = snap.score - prevSnap.score;
    trend = delta >= 2 ? "increasing" : delta <= -2 ? "decreasing" : "stable";
  }

  return {
    weekStart,
    category,
    totalEntries,
    highCount,
    dominantTag,
    dominantFactor: snap?.dominantFactor ?? null,
    score: snap?.score ?? null,
    level: snap?.level ?? null,
    trend
  };
}

export async function getCategoryHistory(category: Category, weeks = 4) {
  // Simple implementation: fetch last N weeks
  const results: number[] = [];
  const now = new Date();
  for (let i = 0; i < weeks; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i * 7));
    const week = d.toISOString().split('T')[0];
    const snap = await db.snapshots.where({ week, category }).first();
    results.unshift(snap?.score ?? 0);
  }
  return results;
}
