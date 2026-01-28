import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helper?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, helper, error, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>}
            <input
                className={`
          w-full bg-white border rounded-xl h-12 px-4
          text-sm text-slate-900 placeholder:text-slate-400
          transition-all duration-200 outline-none
          hover:border-slate-300
          focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900
          shadow-[0_1px_2px_rgba(0,0,0,0.02)]
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : "border-slate-200"}
          ${className}
        `}
                {...props}
            />
            {error ? (
                <span className="text-[11px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{error}</span>
            ) : helper ? (
                <span className="text-[11px] text-slate-400/80 font-medium">{helper}</span>
            ) : null}
        </div>
    );
};
