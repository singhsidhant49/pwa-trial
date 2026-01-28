import React from "react";

export const Chip: React.FC<{ children: React.ReactNode; onClick?: () => void; active?: boolean }> = ({ children, onClick, active }) => {
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`
        px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all
        ${onClick ? "cursor-pointer active:scale-95" : "cursor-default"}
        ${active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200/50 hover:bg-slate-200"}
      `}
        >
            {children}
        </button>
    );
};
