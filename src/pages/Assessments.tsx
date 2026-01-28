// src/pages/Assessments.tsx
import { Link } from "react-router-dom";
import type { Category } from "../db/types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import { PageHeader } from "../components/ui/PageHeader";

const categories: { key: Category; label: string; desc: string }[] = [
  { key: "financial", label: "Financial", desc: "Concentration, liquidity, leverage, and counterparties." },
  { key: "legal", label: "Legal", desc: "Agreements, compliance, IP, and structural gaps." },
  { key: "health", label: "Health", desc: "Sleep, stress, travel fatigue, and burnout signals." },
  { key: "reputation", label: "Reputation", desc: "Associations, conduct, and digital footprint." },
  { key: "time_energy", label: "Time & Energy", desc: "Over-commitment, context switching, and recovery." }
];

export default function Assessments() {
  return (
    <div className="space-y-8 fade-in">
      <PageHeader
        title="Risk Assessments"
        desc="Structured check-ins to quantify fragility across categories."
      />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {categories.map((c) => (
          <Card key={c.key} className="flex flex-col h-full group hover:border-slate-300 transition-all duration-200">
            <div className="space-y-2 mb-6">
              <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">{c.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed min-h-[42px]">{c.desc}</p>
            </div>

            <Link to={`/assessments/${c.key}`} className="mt-auto">
              <Button variant="secondary" size="sm" className="w-full">Run Check-in</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/2 border-slate-200/50 p-6 sm:p-8">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">The Care Principle</h4>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">
          These assessments are designed for awareness, not anxiety. There are no notifications, no alarms, and no judgment.
          Use them to see where fragility is building so you can make informed adjustments in your own time.
        </p>
      </Card>
    </div>
  );
}
