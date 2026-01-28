import { Card } from "./Card";

interface OverviewTileProps {
    label: string;
    value: string | number;
    sub: string;
}

/**
 * A high-level metric tile for the dashboard overview section.
 */
export function OverviewTile({ label, value, sub }: OverviewTileProps) {
    return (
        <Card padding="p-5" className="flex flex-col justify-between h-28 border-slate-200/60 shadow-sm group hover:border-slate-300 transition-all duration-300">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none group-hover:text-primary transition-colors">{label}</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums leading-none tracking-tight">{value}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{sub}</span>
                <div className="flex-1 h-px bg-slate-100" />
            </div>
        </Card>
    );
}
