import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../db/types";
import { weekStartISO } from "../utils/dates";
import { buildWeeklySummary } from "../utils/summary";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OverviewTile } from "../components/ui/OverviewTile";
import { StatTile } from "../components/ui/StatTile";
import { getCategoryHistory } from "../utils/summary";
// import { usePWAInstall } from "../hooks/usePWAInstall";

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
  // const { isInstallable, isInstalled, install } = usePWAInstall();

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

  const totalFragilities = useMemo(() =>
    summaries.reduce((acc, s) => acc + (s.highCount || 0), 0),
    [summaries]
  );

  const avgScore = useMemo(() => {
    if (!summaries.length) return null;
    return Math.round(summaries.reduce((acc, s) => acc + (s.score || 0), 0) / summaries.length);
  }, [summaries]);

  const criticalCapped = useMemo(() =>
    summaries.filter(s => s.level === 'high').length,
    [summaries]
  );

  return (
    <div className="space-y-10 fade-in">
      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome.</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md">Your data is saved locally. {totalFragilities > 0 ? `${totalFragilities} high-risk exposures` : "No critical issues"} found this week.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 pl-3 pr-2 py-3 rounded-xl h-12 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none shrink-0">Week Starting</span>
            <input
              type="date"
              value={week}
              onChange={(e) => setWeek(weekStartISO(new Date(e.target.value)))}
              className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer flex-1"
            />
          </div>
          <Link to="/entries/new" className="sm:shrink-0">
            <Button variant="premium" className="w-full sm:w-auto h-12 px-8 text-sm font-bold tracking-tight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Exposure
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
        <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewTile label="High Risk Focus" value={criticalCapped} sub="Categories" />
          <OverviewTile label="Identified Risks" value={totalFragilities} sub="Total" />
          <OverviewTile label="Avg Risk Score" value={avgScore || "—"} sub="Score" />
          <OverviewTile label="Data Security" value="100%" sub="Local Storage" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-3">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Loading Data</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {summaries.map((s) => (
            <Card key={s.category} padding="p-6" className="flex flex-col group relative transition-all duration-500 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 border-slate-200/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

              <div className="flex justify-between items-start gap-4 mb-8 relative">
                <div className="space-y-2">
                  <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{labelFor(s.category)}</h3>
                  <div className="flex gap-3 items-center">
                    {s?.level && <Badge level={s.level} />}
                    {s.trend && <TrendIndicator trend={s.trend} />}
                  </div>
                </div>

                <Link to={`/assessments/${s.category}?week=${week}`} className="shrink-0">
                  <Button variant="subtle" size="xs" className="px-4 h-9 font-bold group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                    Audit
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatTile label="Entries" value={s.totalEntries} />
                <StatTile label="High-Risk" value={s.highCount} highlight={s.highCount > 0} />
                <StatTile label="Main Factor" value={s.dominantFactor ? formatFactor(s.dominantFactor) : (s.dominantTag || "None")} />
                <StatTile label="Score" value={s.score == null ? "—" : s.score} highlight={s.score && s.score > 10 ? true : false} />
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/entries?category=${s.category}&week=${week}`}
                  className="text-[13px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group/link"
                >
                  View Exposure Log
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
                <div className={`
                  text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
                  ${s.level ? "text-emerald-700 bg-emerald-50" : "text-slate-300 bg-slate-50"}
                `}>
                  {s.level ? "Snapshot Saved" : "In Progress"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper components and utilities

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
