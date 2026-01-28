// src/pages/EntryForm.tsx
import { useEffect, useMemo, useState } from "react";
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
    if (!cleanTitle) return;

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
        exposureLevel: exposureLevel,
        notes: notes.trim() || undefined,
        tags,
        createdAt,
        weekStart: weekStartISO(new Date(createdAt)),
        pendingSync: true
      };
      await db.entries.put(entry);
      await enqueueSync("entry", entry.id);
      nav("/entries");
      return;
    }

    if (!id) return;
    const existing = await db.entries.get(id);
    if (!existing) return;

    const updated: Entry = {
      ...existing,
      title: cleanTitle,
      category,
      exposureLevel: exposureLevel,
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
    <div className="mx-auto space-y-6 fade-in">
      <PageHeader
        title={mode === "edit" ? "Edit Exposure" : "Add Exposure"}
        desc="Record new risks or issues found this week."
        actions={
          <Link to="/entries">
            <Button variant="secondary" size="sm">Cancel</Button>
          </Link>
        }
      />

      <Card padding="p-5 sm:p-6" className={`transition-all duration-500 border-slate-200/50 ${saved ? "ring-2 ring-emerald-500/20 bg-emerald-50/10" : "shadow-sm"}`}>
        <div className="flex flex-col gap-6">
          <Input
            label="Title"
            placeholder="What is the exposure?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>

          <TextArea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add more details here..."
            className="min-h-[160px]"
          />

          <div className="space-y-4">
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
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100 items-center justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              {mode === "edit" && (
                <Button onClick={remove} variant="danger" size="sm" className="opacity-40 hover:opacity-100 transition-opacity">
                  Delete
                </Button>
              )}
            </div>
            <Button onClick={save} disabled={isSaving || saved} variant="premium" className="flex-1 sm:w-56 h-11">
              {saved ? "Saved" : isSaving ? "Saving..." : mode === "create" ? "Save Entry" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-center items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest py-6">
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
        Your data is secure
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}
