// src/pages/AssessmentForm.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Category, Snapshot } from "../db/types";
import { db } from "../db/db";
import { weekStartISO, prevWeekStartISO } from "../utils/dates";
import { enqueueSync } from "../utils/sync";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import {
  scoreFinancial, scoreLegal, scoreHealth, scoreReputation, scoreTimeEnergy,
  type FinancialInputs, type LegalInputs, type HealthInputs, type ReputationInputs, type TimeEnergyInputs
} from "../scoring/scoring";

export default function AssessmentForm() {
  const { category } = useParams();
  const cat = category as Category;

  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const initialWeek = qs.get("week") || weekStartISO();

  const [week, setWeek] = useState(initialWeek);
  const [loading, setLoading] = useState(true);
  const [prevSnapshots, setPrevSnapshots] = useState<Snapshot[]>([]);

  // category-specific inputs
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

      // Persistence logic
      if (cat === "health") {
        const w1 = prevWeekStartISO(week);
        const w2 = prevWeekStartISO(w1);
        const sn1 = await db.snapshots.get(`${w1}:health`);
        const sn2 = await db.snapshots.get(`${w2}:health`);
        const history = [];
        if (sn1) history.push(sn1);
        if (sn2) history.push(sn2);
        if (alive) setPrevSnapshots(history);
      } else {
        if (alive) setPrevSnapshots([]);
      }

      if (!alive) return;

      if (snap?.inputs) {
        if (cat === "financial") setFinancial(snap.inputs as FinancialInputs);
        if (cat === "legal") setLegal(snap.inputs as LegalInputs);
        if (cat === "health") setHealth(snap.inputs as HealthInputs);
        if (cat === "reputation") setReputation(snap.inputs as ReputationInputs);
        if (cat === "time_energy") setTimeEnergy(snap.inputs as TimeEnergyInputs);
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

  const [saved, setSaved] = useState(false);

  if (!isValidCategory(cat)) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Link to="/assessments">
          <Button variant="secondary" size="sm">Return to Protocols</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Premium Sticky Command Bar */}
      <div className="sticky top-16 sm:top-20 z-40 bg-slate-50/50 pt-2 pb-2">
        <Card padding="px-5 py-3" className="flex items-center justify-between shadow-lg shadow-slate-900/5 border-slate-200/60 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Risk index</span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-none">{preview ? preview.score : "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
              <div className="h-4 flex items-center">
                <Badge level={preview?.level ?? null} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-[9px] font-bold text-emerald-600 tracking-widest animate-in fade-in zoom-in">RECORDED</span>}
            <Button variant="premium" onClick={saveSnapshot} disabled={loading || saved} className="px-6 h-10">
              {saved ? "Protocol Verified" : "Record Audit"}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-4 space-y-4">
        <PageHeader
          title={`${title} Audit`}
          desc={`Structural health check for week ${week}.`}
          actions={
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-lg h-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <input
                type="date"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="bg-transparent border-none text-[12px] font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer w-24"
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

/* ---------- Field Groups ---------- */

function FinancialFields({ value, onChange }: { value: FinancialInputs; onChange: (v: FinancialInputs) => void }) {
  return (
    <>
      <Select label="Asset concentration" value={value.assetConcentration} options={["<30", "30-50", ">50"]} onChange={(e) => onChange({ ...value, assetConcentration: e.target.value as any })} />
      <Select label="Income sources" value={value.incomeSources} options={["1", "2-3", ">3"]} onChange={(e) => onChange({ ...value, incomeSources: e.target.value as any })} />
      <Select label="Liquidity horizon" value={value.liquidityHorizon} options={["<6m", "6-12m", ">12m"]} onChange={(e) => onChange({ ...value, liquidityHorizon: e.target.value as any })} />
      <Select label="Debt load" value={value.debtLoad} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, debtLoad: e.target.value as any })} />
      <Select label="Counterparty concentration" value={value.counterpartyConcentration} options={["low", "high"]} onChange={(e) => onChange({ ...value, counterpartyConcentration: e.target.value as any })} />
      <Select label="Tax complexity" value={value.taxComplexity} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, taxComplexity: e.target.value as any })} />
      <Select label="FX dependency" value={value.fxDependence} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, fxDependence: e.target.value as any })} />
      <Select label="CapEx Commitment" value={value.largeUpcomingCommitment} options={["no", "yes"]} onChange={(e) => onChange({ ...value, largeUpcomingCommitment: e.target.value as any })} />
      <Select label="Volatility tolerance" value={value.volatilityTolerance} options={["high", "low"]} onChange={(e) => onChange({ ...value, volatilityTolerance: e.target.value as any })} />
    </>
  );
}

function LegalFields({ value, onChange }: { value: LegalInputs; onChange: (v: LegalInputs) => void }) {
  return (
    <>
      <Select label="Active contracts" value={value.activeContractsCount} options={["<5", "5-9", ">=10"]} onChange={(e) => onChange({ ...value, activeContractsCount: e.target.value as any })} />
      <Select label="Contract clarity" value={value.contractClarity} options={["clear", "somewhat_vague", "verbal_unclear"]} onChange={(e) => onChange({ ...value, contractClarity: e.target.value as any })} />
      <Select label="Jurisdiction count" value={value.jurisdictionCount} options={["single", "multiple_domestic", "multi_country"]} onChange={(e) => onChange({ ...value, jurisdictionCount: e.target.value as any })} />
      <Select label="Compliance status" value={value.complianceStatus} options={["fully_compliant", "partial", "non_compliant_unknown"]} onChange={(e) => onChange({ ...value, complianceStatus: e.target.value as any })} />
      <Select label="NDAs / IP Paperwork" value={value.ndaIpAgreements} options={["complete", "partial", "missing"]} onChange={(e) => onChange({ ...value, ndaIpAgreements: e.target.value as any })} />
      <Select label="Trademark / IP protection" value={value.trademarkProtection} options={["registered", "in_process", "none"]} onChange={(e) => onChange({ ...value, trademarkProtection: e.target.value as any })} />
      <Select label="Entity count" value={value.partnersShareholders} options={["1-3", "4-10", ">10"]} onChange={(e) => onChange({ ...value, partnersShareholders: e.target.value as any })} />
      <Select label="Active disputes" value={value.activeDisputes} options={["no", "yes"]} onChange={(e) => onChange({ ...value, activeDisputes: e.target.value as any })} />
      <Select label="Execution docs" value={value.advisorEmploymentAgreements} options={["complete", "partial", "none"]} onChange={(e) => onChange({ ...value, advisorEmploymentAgreements: e.target.value as any })} />
    </>
  );
}

function HealthFields({ value, onChange }: { value: HealthInputs; onChange: (v: HealthInputs) => void }) {
  return (
    <>
      <Select label="Systemic stress levels" value={value.stress} options={["low", "medium", "high"]} onChange={(e) => onChange({ ...value, stress: e.target.value as any })} />
      <Select label="Sleep depth / capacity" value={value.sleepAvg} options={[">7h", "5-7h", "<5h"]} onChange={(e) => onChange({ ...value, sleepAvg: e.target.value as any })} />
      <Select label="Circadian migration" value={value.irregularSleep} options={["rare", "occasional", "frequent"]} onChange={(e) => onChange({ ...value, irregularSleep: e.target.value as any })} />
      <Select label="Medical backlogs" value={value.checkupsMissed} options={["0", "1-2", ">=3"]} onChange={(e) => onChange({ ...value, checkupsMissed: e.target.value as any })} />
      <Select label="In-transit frequency" value={value.travelDaysPerMonth} options={["<3", "3-10", ">10"]} onChange={(e) => onChange({ ...value, travelDaysPerMonth: e.target.value as any })} />
      <Select label="Metabolic adherence" value={value.exerciseNutrition} options={["regular", "irregular", "none"]} onChange={(e) => onChange({ ...value, exerciseNutrition: e.target.value as any })} />
      <Select label="Burnout signatures" value={value.burnoutSignals} options={["no", "yes"]} onChange={(e) => onChange({ ...value, burnoutSignals: e.target.value as any })} />
      <Select label="Ignored discomfort" value={value.ignoredDiscomfort} options={["no", "yes"]} onChange={(e) => onChange({ ...value, ignoredDiscomfort: e.target.value as any })} />
      <Select label="Scheduled recovery" value={value.recoveryScheduled} options={["regular", "occasional", "none"]} onChange={(e) => onChange({ ...value, recoveryScheduled: e.target.value as any })} />
    </>
  );
}

function ReputationFields({ value, onChange }: { value: ReputationInputs; onChange: (v: ReputationInputs) => void }) {
  return (
    <>
      <Select label="Proximity risk" value={value.controversialPartnersClients} options={["0", "1", ">=2"]} onChange={(e) => onChange({ ...value, controversialPartnersClients: e.target.value as any })} />
      <Select label="Broadcast volume" value={value.publicCommunicationPerWeek} options={["0", "1-3", ">3"]} onChange={(e) => onChange({ ...value, publicCommunicationPerWeek: e.target.value as any })} />
      <Select label="Surface area" value={value.socialMediaPresence} options={["no", "yes"]} onChange={(e) => onChange({ ...value, socialMediaPresence: e.target.value as any })} />
      <Select label="Signal alignment" value={value.brandAlignment} options={["consistent", "uncertain", "misaligned"]} onChange={(e) => onChange({ ...value, brandAlignment: e.target.value as any })} />
      <Select label="Governance audits" value={value.internalComplaints} options={["none", "minor", "serious"]} onChange={(e) => onChange({ ...value, internalComplaints: e.target.value as any })} />
      <Select label="Footprint audit" value={value.footprintReview} options={["regular", "occasional", "never"]} onChange={(e) => onChange({ ...value, footprintReview: e.target.value as any })} />
      <Select label="External signals" value={value.recentReputationEvents} options={["none", "minor_negative", "major_negative"]} onChange={(e) => onChange({ ...value, recentReputationEvents: e.target.value as any })} />
      <Select label="Visibility level" value={value.roleVisibility} options={["low", "medium", "high"]} onChange={(e) => onChange({ ...value, roleVisibility: e.target.value as any })} />
    </>
  );
}

function TimeEnergyFields({ value, onChange }: { value: TimeEnergyInputs; onChange: (v: TimeEnergyInputs) => void }) {
  return (
    <>
      <Select label="Active mandates" value={value.majorProjects} options={["<=1", "2-3", ">3"]} onChange={(e) => onChange({ ...value, majorProjects: e.target.value as any })} />
      <Select label="Synchronous sink" value={value.weeklyMeetingHours} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, weeklyMeetingHours: e.target.value as any })} />
      <Select label="Context migration" value={value.dailyContextSwitches} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, dailyContextSwitches: e.target.value as any })} />
      <Select label="Decision latency volume" value={value.microDecisionsPerDay} options={["<20", "20-50", ">50"]} onChange={(e) => onChange({ ...value, microDecisionsPerDay: e.target.value as any })} />
      <Select label="Delegation hierarchy" value={value.delegation} options={["high", "medium", "low"]} onChange={(e) => onChange({ ...value, delegation: e.target.value as any })} />
      <Select label="Low-impact clock" value={value.lowImpactHoursPerDay} options={["<2", "2-4", ">4"]} onChange={(e) => onChange({ ...value, lowImpactHoursPerDay: e.target.value as any })} />
      <Select label="Deep clock bandwidth" value={value.deepWorkHoursPerWeek} options={[">10", "5-10", "<5"]} onChange={(e) => onChange({ ...value, deepWorkHoursPerWeek: e.target.value as any })} />
      <Select label="Rest scheduling" value={value.restScheduling} options={["regular", "occasional", "none"]} onChange={(e) => onChange({ ...value, restScheduling: e.target.value as any })} />
      <Select label="Cumulative deficit" value={value.daysWithoutFullRestPastMonth} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, daysWithoutFullRestPastMonth: e.target.value as any })} />
      <Select label="Late-phase operation" value={value.lateNightWork} options={["rare", "occasional", "frequent"]} onChange={(e) => onChange({ ...value, lateNightWork: e.target.value as any })} />
    </>
  );
}

/* ---------- Utils ---------- */

function labelFor(c: Category) {
  return (
    {
      financial: "Financial Health",
      legal: "Legal Framework",
      health: "Biometric & Recovery",
      reputation: "Social Capital",
      time_energy: "Efficiency & Output"
    } as Record<Category, string>
  )[c];
}

function isValidCategory(c: any): c is Category {
  return ["financial", "legal", "health", "reputation", "time_energy"].includes(String(c));
}

function defaultFinancial(): FinancialInputs {
  return { assetConcentration: "<30", incomeSources: ">3", liquidityHorizon: "<6m", debtLoad: "low", counterpartyConcentration: "low", taxComplexity: "low", fxDependence: "low", largeUpcomingCommitment: "no", volatilityTolerance: "high" };
}

function defaultLegal(): LegalInputs {
  return { activeContractsCount: "<5", contractClarity: "clear", jurisdictionCount: "single", complianceStatus: "fully_compliant", ndaIpAgreements: "complete", trademarkProtection: "registered", partnersShareholders: "1-3", activeDisputes: "no", advisorEmploymentAgreements: "complete" };
}

function defaultHealth(): HealthInputs {
  return { stress: "low", sleepAvg: ">7h", irregularSleep: "rare", checkupsMissed: "0", travelDaysPerMonth: "<3", exerciseNutrition: "regular", burnoutSignals: "no", ignoredDiscomfort: "no", recoveryScheduled: "regular" };
}

function defaultReputation(): ReputationInputs {
  return { controversialPartnersClients: "0", publicCommunicationPerWeek: "0", socialMediaPresence: "no", brandAlignment: "consistent", internalComplaints: "none", footprintReview: "regular", recentReputationEvents: "none", roleVisibility: "low" };
}

function defaultTimeEnergy(): TimeEnergyInputs {
  return { majorProjects: "<=1", weeklyMeetingHours: "<10", dailyContextSwitches: "<10", microDecisionsPerDay: "<20", delegation: "high", lowImpactHoursPerDay: "<2", deepWorkHoursPerWeek: ">10", restScheduling: "regular", daysWithoutFullRestPastMonth: "<10", lateNightWork: "rare" };
}
