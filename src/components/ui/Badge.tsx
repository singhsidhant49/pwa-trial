import React from "react";

interface BadgeProps {
    level: "low" | "medium" | "high" | string | null;
    label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ level, label }) => {
    const configs: Record<string, { bg: string; text: string; dot: string }> = {
        low: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
        medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
        high: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
        pending: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" }
    };

    const key = level && configs[level] ? level : "pending";
    const config = configs[key];

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border border-black/5 shadow-sm`}>
            <span className={`w-1 h-1 rounded-full ${config.dot}`} />
            {label || level?.toUpperCase()}
        </div>
    );
};
