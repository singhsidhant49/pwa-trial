import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[] | string[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>}
            <div className="relative">
                <select
                    className={`
            w-full bg-white border rounded-xl h-12 pl-4 pr-10
            text-sm font-medium text-slate-900 appearance-none
            transition-all duration-200 outline-none
            hover:border-slate-300 cursor-pointer
            focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900
            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : "border-slate-200"}
            ${className}
          `}
                    {...props}
                >
                    {options.map((opt) => {
                        const val = typeof opt === "string" ? opt : opt.value;
                        const lbl = typeof opt === "string" ? opt : opt.label;
                        return <option key={val} value={val}>{lbl}</option>;
                    })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 1L5 5L9 1" />
                    </svg>
                </div>
            </div>
            {error && <span className="text-[11px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{error}</span>}
        </div>
    );
};
