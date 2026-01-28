import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[] | string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</label>}
            <div className="relative">
                <select
                    className={`
            w-full bg-white border border-slate-200 rounded-lg h-11 pl-4 pr-10
            text-sm text-slate-900 appearance-none
            transition-all duration-200 outline-none
            hover:border-slate-300 cursor-pointer
            focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900
            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
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
        </div>
    );
};
