import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helper?: string;
}

export const Input: React.FC<InputProps> = ({ label, helper, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>}
            <input
                className={`
          w-full bg-white border border-slate-200 rounded-lg h-11 px-4
          text-sm text-slate-900 placeholder:text-slate-400
          transition-all duration-200 outline-none
          hover:border-slate-300
          focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900
          shadow-[0_1px_2px_rgba(0,0,0,0.02)]
          ${className}
        `}
                {...props}
            />
            {helper && <span className="text-[11px] text-slate-400/80 font-medium">{helper}</span>}
        </div>
    );
};
