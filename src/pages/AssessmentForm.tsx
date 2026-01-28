import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Category, Snapshot } from "../db/types";
import { db } from "../db/db";
import { weekStartISO, prevWeekStartISO } from "../utils/dates";
import { enqueueSync } from "../utils/sync";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import {
  scoreFinancial, scoreLegal, scoreHealth, scoreReputation, scoreTimeEnergy,
  type FinancialInputs, type LegalInputs, type HealthInputs, type ReputationInputs, type TimeEnergyInputs
} from "../scoring/scoring";
import {
  FinancialFields, LegalFields, HealthFields, ReputationFields, TimeEnergyFields
} from "../components/assessments/AssessmentFields";
import {
  labelFor, isValidCategory, defaultFinancial, defaultLegal, defaultHealth, defaultReputation, defaultTimeEnergy
} from "../utils/assessments";

/**
 * Weekly risk assessment form component.
 * Handles data persistence, real-time risk scoring, and sync queueing.
 */
export default function AssessmentForm() {
  const { category } = useParams();
  const cat = category as Category;

  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const initialWeek = weekStartISO(qs.get("week") ? new Date(qs.get("week")!) : new Date());

  const [week, setWeek] = useState(initialWeek);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [prevSnapshots, setPrevSnapshots] = useState<Snapshot[]>([]);


  const [financial, setFinancial] = useState<FinancialInputs>(defaultFinancial());
  const [legal, setLegal] = useState<LegalInputs>(defaultLegal());
  const [health, setHealth] = useState<HealthInputs>(defaultHealth());
  const [reputation, setReputation] = useState<ReputationInputs>(defaultReputation());
  const [timeEnergy, setTimeEnergy] = useState<TimeEnergyInputs>(defaultTimeEnergy());

  const title = useMemo(() => labelFor(cat), [cat]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const snap = await db.snapshots.get(`${week}:${cat}`);

      // Multi-week persistence logic for health checks
      if (cat === "health") {
        const w1 = prevWeekStartISO(week);
        const w2 = prevWeekStartISO(w1);
        const [sn1, sn2] = await Promise.all([
          db.snapshots.get(`${w1}:health`),
          db.snapshots.get(`${w2}:health`)
        ]);

        const history = [];
        if (sn1) history.push(sn1);
        if (sn2) history.push(sn2);
        if (alive) setPrevSnapshots(history);
      } else {
        if (alive) setPrevSnapshots([]);
      }

      if (!alive) return;

      if (snap?.inputs) {
        const inputs = snap.inputs;
        if (cat === "financial") setFinancial(inputs as FinancialInputs);
        if (cat === "legal") setLegal(inputs as LegalInputs);
        if (cat === "health") setHealth(inputs as HealthInputs);
        if (cat === "reputation") setReputation(inputs as ReputationInputs);
        if (cat === "time_energy") setTimeEnergy(inputs as TimeEnergyInputs);
      } else {
        if (cat === "financial") setFinancial(defaultFinancial());
        if (cat === "legal") setLegal(defaultLegal());
        if (cat === "health") setHealth(defaultHealth());
        if (cat === "reputation") setReputation(defaultReputation());
        if (cat === "time_energy") setTimeEnergy(defaultTimeEnergy());
      }

      setLoading(false);
    })();
    return () => { alive = false; };
  }, [week, cat]);

  // Real-time risk scoring calculation
  const preview = useMemo(() => {
    if (cat === "financial") return scoreFinancial(financial);
    if (cat === "legal") return scoreLegal(legal);
    if (cat === "health") {
      const bonus: Partial<Record<keyof HealthInputs, number>> = {};
      if (prevSnapshots.length === 2) {
        const h1 = prevSnapshots[0].inputs as HealthInputs;
        const h2 = prevSnapshots[1].inputs as HealthInputs;
        Object.keys(health).forEach((key) => {
          const k = key as keyof HealthInputs;
          if (health[k] === h1[k] && health[k] === h2[k] && health[k] !== defaultHealth()[k]) {
            bonus[k] = 1;
          }
        });
      }
      return scoreHealth(health, bonus);
    }
    if (cat === "reputation") return scoreReputation(reputation);
    if (cat === "time_energy") return scoreTimeEnergy(timeEnergy);
    return null;
  }, [cat, financial, legal, health, reputation, timeEnergy, prevSnapshots]);

  /**
   * Commits the current assessment to the local vault and sync queue.
   */
  async function saveSnapshot() {
    if (!preview) return;

    const inputs =
      cat === "financial" ? financial :
        cat === "legal" ? legal :
          cat === "health" ? health :
            cat === "reputation" ? reputation :
              timeEnergy;

    const id = `${week}:${cat}`;
    await db.snapshots.put({
      id,
      weekStart: week,
      category: cat,
      inputs,
      score: preview.score,
      level: preview.level,
      dominantFactor: (preview as any).dominantFactor ?? null,
      createdAt: Date.now(),
      pendingSync: true
    });

    await enqueueSync("snapshot", id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!isValidCategory(cat)) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Link to="/assessments">
          <Button variant="secondary" size="sm">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      {/* Sticky Score Dashboard */}
      <div className="sticky top-16 sm:top-20 z-40 bg-slate-50/50 pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Card padding="px-4 py-3 sm:px-6 sm:py-4" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl shadow-slate-900/5 border-slate-200/60 bg-white/95 backdrop-blur-xl rounded-2xl">
          <div className="flex items-center justify-between sm:justify-start gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Risk Score</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums leading-none tracking-tight">{preview ? preview.score : "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Risk Level</span>
              <div className="flex items-center">
                <Badge level={preview?.level ?? null} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="flex-1 text-center sm:text-right text-[10px] font-bold text-emerald-600 tracking-widest animate-in fade-in zoom-in">CHANGES SAVED</span>}
            <Button variant="premium" onClick={saveSnapshot} disabled={loading || saved} className="flex-1 sm:flex-none px-8 h-12 text-sm font-bold tracking-tight shadow-lg shadow-primary/20">
              {saved ? "Success" : "Save Progress"}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-4 space-y-4">
        <PageHeader
          title={`${title} Audit`}
          desc={`Weekly assessment protocol for the period of ${week}.`}
          actions={
            <div className="flex items-center gap-3 bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-xl h-10 shadow-sm w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none">Week Starting</span>
              <input
                type="date"
                value={week}
                onChange={(e) => setWeek(weekStartISO(new Date(e.target.value)))}
                className="bg-transparent border-none text-[13px] font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer flex-1 sm:w-28"
              />
            </div>
          }
        />

        <Card padding="p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {cat === "financial" && <FinancialFields value={financial} onChange={setFinancial} />}
              {cat === "legal" && <LegalFields value={legal} onChange={setLegal} />}
              {cat === "health" && <HealthFields value={health} onChange={setHealth} />}
              {cat === "reputation" && <ReputationFields value={reputation} onChange={setReputation} />}
              {cat === "time_energy" && <TimeEnergyFields value={timeEnergy} onChange={setTimeEnergy} />}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
