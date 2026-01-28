// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../db/types";
import { weekStartISO } from "../utils/dates";
import { buildWeeklySummary } from "../utils/summary";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getCategoryHistory } from "../utils/summary";
import { usePWAInstall } from "../hooks/usePWAInstall";

const categories: { key: Category; label: string }[] = [
  { key: "financial", label: "Financial Health" },
  { key: "legal", label: "Legal Exposure" },
  { key: "health", label: "Health Exposure" },
  { key: "reputation", label: "Reputation Exposure" },
  { key: "time_energy", label: "Time & Energy Exposure" }
];

export default function Dashboard() {
  const [week, setWeek] = useState(weekStartISO());
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<any[]>([]);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await Promise.all(categories.map(async c => {
        const s = await buildWeeklySummary(week, c.key);
        const history = await getCategoryHistory(c.key, 4);
        return { ...s, history };
      }));
      if (alive) {
        setSummaries(data);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [week]);

  const totalFragilities = summaries.reduce((acc, s) => acc + s.highCount, 0);
  const avgScore = summaries.length ? Math.round(summaries.reduce((acc, s) => acc + (s.score || 0), 0) / summaries.length) : null;
  const criticalCapped = summaries.filter(s => s.level === 'high').length;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Daily Protocol Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, Keeper.</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md">Your sovereign vault is synchronized. {totalFragilities > 0 ? `${totalFragilities} high-risk exposures` : "Zero critical signals"} recorded in the current audit pool.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-xl h-11 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Audit Week</span>
            <input
              type="date"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer w-28"
            />
          </div>
          <Link to="/entries/new">
            <Button variant="premium" className="h-11 px-6 text-sm font-bold tracking-tight">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Document Exposure
            </Button>
          </Link>
        </div>
      </div>

      {/* PWA Install Promo
      {!isInstalled && (
        <Card padding="p-6" className="bg-slate-900 border-none shadow-2xl shadow-slate-900/40 group relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight leading-none">Vault Setup: Native Performance</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {isInstallable ? "Download the PWA for offline-first sovereignty" : "Enable hardware integration in Vault Settings"}
                </p>
              </div>
            </div>
            {isInstallable ? (
              <Button variant="premium" onClick={install} className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Download Native Vault
              </Button>
            ) : (
              <Link to="/settings" className="w-full sm:w-auto">
                <Button variant="premium" className="w-full h-11 px-8 text-xs font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Setup Native Vault
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )} */}

      {/* Global Overview Section */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <OverviewTile label="High Risk Focus" value={criticalCapped} sub="Categories" />
          <OverviewTile label="Active Drains" value={totalFragilities} sub="Identified" />
          <OverviewTile label="Avg Risk Level" value={avgScore || "—"} sub="Protocol Score" />
          <OverviewTile label="Vault Integrity" value="99.4%" sub="Local Encryption" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-3">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Decrypting Ledgers</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {summaries.map((s) => (
            <Card key={s.category} padding="p-5 sm:p-6" className="flex flex-col group relative transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 border-slate-200/50 overflow-hidden">
              {/* Premium Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="flex justify-between items-start gap-4 mb-6 relative">
                <div className="space-y-1.5">
                  <h3 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{labelFor(s.category)}</h3>
                  <div className="flex gap-2.5 items-center">
                    {s?.level && <Badge level={s.level} />}
                    {s.trend && <TrendIndicator trend={s.trend} />}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">

                  <Link to={`/assessments/${s.category}?week=${week}`}>
                    <Button variant="subtle" size="xs" className="px-3 h-8 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm">Audit Details</Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <StatTile label="Observations" value={s.totalEntries} />
                <StatTile label="High-Risk" value={s.highCount} highlight={s.highCount > 0} />
                <StatTile label="Primary Driver" value={s.dominantFactor ? formatFactor(s.dominantFactor) : (s.dominantTag || "Optimized")} />
                <StatTile label="Calculated Risk" value={s.score == null ? "—" : s.score} highlight={s.score && s.score > 10 ? true : false} />
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/entries?category=${s.category}&week=${week}`}
                  className="text-[12px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 group/link"
                >
                  Exposure Log
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
                <div className={`
                  text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded
                  ${s.level ? "text-emerald-600 bg-emerald-50/50" : "text-slate-300 bg-slate-50/50"}
                `}>
                  {s.level ? "Protocol Verified" : "Awaiting Seal"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewTile({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <Card padding="px-4 py-3" className="border-slate-200/50 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-colors">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">{value}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{sub}</span>
      </div>
    </Card>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-slate-50/50 rounded-lg border border-slate-100/30">
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      <span className={`text-[13px] font-bold truncate leading-none ${highlight ? "text-red-600" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function labelFor(c: string) {
  return (
    {
      financial: "Financial Health",
      legal: "Legal Exposure",
      health: "Health Exposure",
      reputation: "Reputation Exposure",
      time_energy: "Time & Energy Exposure"
    } as any
  )[c] ?? c;
}

function formatFactor(f: string | null) {
  if (!f) return "Optimized";
  return f
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Avg$/, '')
    .trim();
}

function TrendIndicator({ trend }: { trend: string }) {
  const icons: Record<string, string> = {
    increasing: "↑",
    stable: "→",
    decreasing: "↓"
  };
  const colors: Record<string, string> = {
    increasing: "text-red-500",
    stable: "text-slate-300",
    decreasing: "text-emerald-500"
  };

  return (
    <span className={`text-sm font-black ${colors[trend]}`}>
      {icons[trend]}
    </span>
  );
}
