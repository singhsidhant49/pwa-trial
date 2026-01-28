import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handle = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handle);
    window.addEventListener("offline", handle);

    // Initial and periodic check for pending syncs
    const checkPending = async () => {
      try {
        const { db } = await import("../../db/db");
        const count = await db.outbox.count();
        setPendingCount(count);
      } catch (e) {
        console.error("Sync count fail", e);
      }
    };

    checkPending();
    const timer = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener("online", handle);
      window.removeEventListener("offline", handle);
      clearInterval(timer);
    };
  }, []);

  return { isOnline, pendingCount };
}

export default function Header({ children }: { children: React.ReactNode }) {
  const { isOnline, pendingCount } = useSyncStatus();

  return (
  <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="group flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-[15px] font-extrabold text-slate-900 tracking-tight">RISK LEDGER</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase font-mono">Private & Local</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-6">
              <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/40">
                <NavItem to="/" label="Dashboard" />
                <NavItem to="/entries" label="All Entries" />
                <NavItem to="/settings" label="Settings" />
              </nav>

              <div className="flex items-center gap-3 pl-2 sm:pl-0">
                {pendingCount > 0 && (
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-amber-700 tracking-tight">{pendingCount}</span>
                  </div>
                )}
                <div className={`
                  flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300
                  ${isOnline
                    ? "bg-slate-50 border-slate-200/60 text-slate-600"
                    : "bg-red-50 border-red-100 text-red-600"}
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500 animate-pulse"}`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest hidden xs:inline">{isOnline ? "Online" : "Offline"}</span>
                </div>

                <PWAInstallButton />
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}

function NavItem({ to, label }: { to: string, label: string }) {
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`
        px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200
        ${active
          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
          : "text-slate-500 hover:text-slate-900 hover:bg-white/50"}
      `}
    >
      {label}
    </Link>
  );
}



function PWAInstallButton() {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 opacity-60">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
      <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Installed</span>
    </div>
  );

  if (!isInstallable) return (
    <Link
      to="/settings"
      className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors border border-slate-200"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
      <span className="hidden sm:inline">Install</span>
      <span className="sm:hidden">Install</span>
    </Link>
  );

  return (
    <button
      onClick={install}
      className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span className="hidden sm:inline">Install</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}
