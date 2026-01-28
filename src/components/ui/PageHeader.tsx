import React from "react";

interface PageHeaderProps {
    title: string;
    desc?: string;
    actions?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, desc, actions, className = "" }) => {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${className}`}>
            <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
                {desc && <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{desc}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
        </div>
    );
};
