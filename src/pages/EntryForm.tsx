// src/pages/EntryForm.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../db/db";
import type { Category, Entry, ExposureLevel } from "../db/types";
import { weekStartISO } from "../utils/dates";
import { enqueueSync } from "../utils/sync";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { TextArea } from "../components/ui/TextArea";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { PageHeader } from "../components/ui/PageHeader";

const categories: { key: Category; label: string; tags: string[] }[] = [
  { key: "financial", label: "Financial Health", tags: ["Concentration", "Liquidity", "Leverage", "Volatility", "Counterparty", "Tax", "FX"] },
  { key: "legal", label: "Legal Exposure", tags: ["Contract ambiguity", "Compliance", "IP/Trademark", "Partner risk", "Employment", "Jurisdiction"] },
  { key: "health", label: "Health Exposure", tags: ["Stress", "Sleep", "Nutrition", "Physical strain", "Mental burnout", "Travel fatigue"] },
  { key: "reputation", label: "Reputation Exposure", tags: ["Association", "Public communication", "Brand alignment", "Leadership conduct", "Digital footprint"] },
  { key: "time_energy", label: "Time & Energy Exposure", tags: ["Over-commitment", "Context switching", "Decision overload", "Poor delegation", "No recovery"] }
];

const exposureLevels: { value: ExposureLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export default function EntryForm({ mode }: { mode: "create" | "edit" }) {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(mode === "edit");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("financial");
  const [exposureLevel, setExposureLevel] = useState<ExposureLevel>("low");
  const [notes, setNotes] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const titleRef = useRef<HTMLDivElement>(null);

  const tagSuggestions = useMemo(() => {
    return categories.find(c => c.key === category)?.tags ?? [];
  }, [category]);

  useEffect(() => {
    if (mode !== "edit") return;
    let alive = true;
    (async () => {
      setLoading(true);
      const entry = id ? await db.entries.get(id) : null;
      if (!alive) return;
      if (!entry) {
        setLoading(false);
        return;
      }
      setTitle(entry.title);
      setCategory(entry.category);
      setExposureLevel(entry.exposureLevel);
      setNotes(entry.notes ?? "");
      setTagsText((entry.tags ?? []).join(", "));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [mode, id]);

  async function save() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrors({ title: "Identification is required to record this exposure." });
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setIsSaving(true);
    const tags = tagsText
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (mode === "create") {
      const createdAt = Date.now();
      const entry: Entry = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        category,
        exposureLevel,
        notes: notes.trim() || undefined,
        tags,
        createdAt,
        weekStart: weekStartISO(new Date(createdAt)),
        pendingSync: true
      };
      await db.entries.put(entry);
      await enqueueSync("entry", entry.id);
      setSaved(true);
      setTimeout(() => nav("/entries"), 800);
      return;
    }

    if (!id) return;
    const existing = await db.entries.get(id);
    if (!existing) {
      setIsSaving(false);
      return;
    }

    const updated: Entry = {
      ...existing,
      title: cleanTitle,
      category,
      exposureLevel,
      notes: notes.trim() || undefined,
      tags,
      weekStart: weekStartISO(new Date(existing.createdAt)),
      pendingSync: true
    };

    await db.entries.put(updated);
    await enqueueSync("entry", updated.id);
    setSaved(true);
    setTimeout(() => nav("/entries"), 800);
  }

  async function remove() {
    if (!id) return;
    const ok = confirm("Purge this signature from the ledger?");
    if (!ok) return;
    await db.entries.delete(id);
    nav("/entries");
  }

  function addTag(t: string) {
    const cur = tagsText
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    if (cur.includes(t)) return;
    const next = [...cur, t].slice(0, 10);
    setTagsText(next.join(", "));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in pb-10">
      <PageHeader
        title={mode === "edit" ? "Edit Entry" : "New Exposure"}
        desc="Record detailed risk signatures into your private ledger."
      />

      <Card padding="p-6 sm:p-10" className={`transition-all duration-500 border-slate-200/60 ${saved ? "ring-2 ring-emerald-500/20 bg-emerald-50/10" : "shadow-xl shadow-slate-900/5"}`}>
        <div className="flex flex-col gap-8">
          <section className="space-y-4" ref={titleRef}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Core Protocol</h4>
            <Input
              label="Title"
              placeholder="e.g., Critical Counterparty Concentration"
              value={title}
              error={errors.title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
            />
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
            <Select
              label="Category"
              value={category}
              options={categories.map(c => ({ value: c.key, label: c.label }))}
              onChange={(e) => setCategory(e.target.value as Category)}
            />
            <Select
              label="Exposure Level"
              value={exposureLevel}
              options={exposureLevels}
              onChange={(e) => setExposureLevel(e.target.value as ExposureLevel)}
            />
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-50">
            <TextArea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the underlying fragility or context..."
              className="min-h-[180px]"
            />
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-50">
            <Input
              label="Tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Add tags separated by commas..."
            />

            {tagSuggestions.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {tagSuggestions.map(t => (
                  <Chip key={t} onClick={() => addTag(t)}>+ {t}</Chip>
                ))}
              </div>
            ) : null}
          </section>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-10 border-t border-slate-100 items-center justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              <Link to="/entries" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full h-12 px-8 font-bold text-sm">
                  Cancel
                </Button>
              </Link>
              {mode === "edit" && (
                <Button onClick={remove} variant="danger" className="flex-1 sm:flex-none h-12 px-6 opacity-40 hover:opacity-100 transition-opacity font-bold">
                  Delete
                </Button>
              )}
            </div>
            <Button onClick={save} disabled={isSaving || saved} variant="premium" className="w-full sm:w-64 h-12 text-sm font-bold tracking-tight shadow-xl shadow-primary/20">
              {saved ? "Entry Saved" : isSaving ? "Saving..." : mode === "create" ? "Save Entry" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
