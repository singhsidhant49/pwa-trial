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
        <Card padding="p-4" className="flex flex-col justify-between h-24 border-slate-200/60 shadow-sm">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-none">{value}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-60">{sub}</span>
        </Card>
    );
}
