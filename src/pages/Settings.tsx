// src/pages/Settings.tsx
import { useState } from "react";
import { db } from "../db/db";
import { runSync } from "../utils/sync";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function Settings() {
  const [busy, setBusy] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  async function exportData() {
    setBusy(true);
    try {
      const payload = {
        entries: await db.entries.toArray(),
        snapshots: await db.snapshots.toArray(),
        outbox: await db.outbox.toArray(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `risk-ledger-export-${Date.now()}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function importData(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const ok = confirm("Verification Required: Merging external data into current vault storage. Proceed with caution?");
      if (!ok) return;

      if (Array.isArray(json.entries)) await db.entries.bulkPut(json.entries);
      if (Array.isArray(json.snapshots)) await db.snapshots.bulkPut(json.snapshots);
      if (Array.isArray(json.outbox)) await db.outbox.bulkPut(json.outbox);

      alert("Merge Successful. Vault synchronized.");
    } catch (e) {
      alert("Operation Failure: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetAll() {
    const ok = confirm("CRITICAL WARNING: This operation will permanently destroy ALL local data records in this vault. This cannot be undone.");
    if (!ok) return;
    setBusy(true);
    try {
      await db.entries.clear();
      await db.snapshots.clear();
      await db.outbox.clear();
      alert("Sanitization Complete. Local ledger cleared.");
    } finally {
      setBusy(false);
    }
  }

  async function manualSync() {
    setBusy(true);
    try {
      await runSync();
      alert("Sync successful.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className=" mx-auto space-y-8 fade-in">
      <PageHeader
        title="Settings"
        desc="Technical control over your local data ledger."
      />

      <Card padding="p-6 sm:p-8" className="space-y-10 border-slate-200/50 shadow-xl shadow-slate-900/5">
        <section className="space-y-6">
          <div className="space-y-2 flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-900 tracking-[0.2em] uppercase opacity-70">Data Portability</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Vault storage is local. Export for backup or import to migrate audits.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="secondary" onClick={exportData} disabled={busy} className="h-11 font-bold">Export Vault</Button>
            <label className="relative">
              <span className="
                w-full inline-flex items-center justify-center gap-2 
                px-4 py-2 rounded-lg text-sm font-bold h-11
                transition-all duration-150
                border border-slate-200 bg-white text-slate-700
                hover:bg-slate-50 hover:border-slate-300
                active:scale-[0.98] cursor-pointer shadow-sm
              ">
                Import Archive
              </span>
              <input
                type="file"
                accept="application/json"
                disabled={busy}
                className="absolute opacity-0 inset-0 cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importData(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>

        <section className="space-y-8 pt-10 border-t border-slate-100">
          <div className="space-y-4 flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-900 tracking-[0.2em] uppercase opacity-70">Sync Status</h4>
            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className={`w-2 h-2 rounded-full animate-pulse ${navigator.onLine ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
              <p className="text-sm text-slate-500 leading-relaxed font-bold tracking-tight">
                Status: <span className={navigator.onLine ? "text-emerald-700" : "text-red-700"}> {navigator.onLine ? "ONLINE" : "OFFLINE"}</span>
              </p>
            </div>
          </div>
          <Button variant="premium" onClick={manualSync} disabled={busy} className="w-full h-12 text-sm font-bold">
            Sync Now
          </Button>
        </section>

        <section className="space-y-6 pt-10 border-t border-slate-100">
          <div className="space-y-2 flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-900 tracking-[0.2em] uppercase opacity-70">App Installation</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Install this app on your device for offline use and faster access.
            </p>
          </div>
          <div className="space-y-4">
            {!isInstalled && (
              <Button
                variant="premium"
                onClick={() => isInstallable ? install() : document.getElementById('manual-install')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full h-12 text-sm font-bold shadow-xl shadow-primary/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Install App
              </Button>
            )}



            {isInstalled && (
              <div className="flex items-center justify-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 italic opacity-60 font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-xs font-bold text-slate-500">App Installed</span>
              </div>
            )}


          </div>
        </section>

        <section className="space-y-6 pt-10 border-t border-slate-100">
          <div className="space-y-2 flex flex-col">
            <h4 className="text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase">Clear Data</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Delete all data from this device. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" onClick={resetAll} disabled={busy} className="w-full h-11 text-xs font-bold uppercase tracking-widest">
            Delete All Data
          </Button>
        </section>
      </Card>

            
    </div>
  );
}
