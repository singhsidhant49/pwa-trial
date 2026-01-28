// src/pages/Entries.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../db/db";
import type { Category, Entry } from "../db/types";
import { weekStartISO } from "../utils/dates";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Chip } from "../components/ui/Chip";

const categories: { key: Category; label: string }[] = [
  { key: "financial", label: "Financial Health" },
  { key: "legal", label: "Legal Exposure" },
  { key: "health", label: "Health Exposure" },
  { key: "reputation", label: "Reputation Exposure" },
  { key: "time_energy", label: "Time & Energy Exposure" }
];

export default function Entries() {
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);

  const [week, setWeek] = useState(qs.get("week") || weekStartISO());
  const [category, setCategory] = useState<Category | "all">(qs.get("category") as any || "all");
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const q = category === "all"
        ? db.entries.where("weekStart").equals(week)
        : db.entries.where({ weekStart: week, category });
      const items = await q.sortBy("createdAt");
      if (alive) {
        setRows(items.reverse());
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [week, category]);

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Exposure Log"
        desc="Chronological history of recorded exposures."
        actions={
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg h-9 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Week</span>
              <input
                type="date"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="bg-transparent border-none text-[13px] font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer w-28"
              />
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={category}
                options={[
                  { value: "all", label: "All Record Classes" },
                  ...categories.map(c => ({ value: c.key, label: c.label }))
                ]}
                className="h-9 py-1 px-3"
                onChange={e => setCategory(e.target.value as any)}
              />
            </div>

            <Link to="/entries/new" className="w-full sm:w-auto">
              <Button variant="premium" size="sm" className="w-full h-9 px-4">+ Document Exposure</Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-300/60 bg-slate-50/30">
          <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
            </svg>
          </div>
          <div className="space-y-1 mb-6">
            <h4 className="text-[16px] font-bold text-slate-900 tracking-tight">Exposure Log Clear</h4>
            <p className="text-xs text-slate-500 max-w-[240px]">No risk patterns or exposures recorded for this period.</p>
          </div>
          <Link to="/entries/new">
            <Button variant="primary" size="xs" className="px-6 h-8">Seal Record</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rows.map(e => (
            <Link key={e.id} to={`/entries/${e.id}`} className="block group">
              <Card padding="p-4 sm:p-5" className="flex justify-between items-center gap-4 transition-all hover:border-slate-300 border-slate-200/50">
                <div className="flex-1 min-w-0 flex items-start gap-4">
                  <div className="pt-1 shrink-0">
                    <div className={`w-2 h-2 rounded-full shadow-sm ring-4 ring-white ${e.exposureLevel === 'high' ? 'bg-red-500' : e.exposureLevel === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      <span>{e.category.replace("_", " ")}</span>
                      {e.pendingSync ? (
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-amber-50 rounded text-[8px] font-bold text-amber-700 uppercase tracking-widest border border-amber-100/50">
                          <span className="w-0.5 h-0.5 bg-amber-500 rounded-full animate-pulse" />
                          Vaulting
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-emerald-50 rounded text-[8px] font-bold text-emerald-700 uppercase tracking-widest border border-emerald-100/50">
                          <span className="w-0.5 h-0.5 bg-emerald-500 rounded-full" />
                          Protocol Verified
                        </div>
                      )}
                    </div>
                    <h4 className="text-[15px] font-bold text-slate-900 truncate tracking-tight mb-2 group-hover:text-primary transition-colors">{e.title}</h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge level={e.exposureLevel} />
                      <div className="flex flex-wrap gap-1">
                        {e.tags?.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest shrink-0 pt-1">
                    {new Date(e.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div className="text-slate-200 group-hover:text-slate-900 transition-all group-hover:translate-x-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
