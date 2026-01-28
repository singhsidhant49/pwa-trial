

interface StatTileProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

/**
 * A small stat display used within category summary cards.
 */
export function StatTile({ label, value, highlight }: StatTileProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-bold tabular-nums truncate ${highlight ? "text-red-600" : "text-slate-700"}`}>
                {value}
            </span>
        </div>
    );
}
