import React from "react";

interface StatTileProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, highlight }) => {
    return (
        <div className="bg-slate-50/30 border border-slate-200/50 p-3.5 rounded-lg flex flex-col gap-1 transition-all hover:bg-slate-50 ring-1 ring-inset ring-transparent hover:ring-slate-900/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">{label}</span>
            <span className={`text-sm font-bold truncate leading-none ${highlight ? "text-red-600" : "text-slate-900"}`}>{value}</span>
        </div>
    );
};
