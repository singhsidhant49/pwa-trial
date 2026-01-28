import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", padding = "p-4 sm:p-6" }) => {
    return (
        <div
            className={`
        bg-white border border-slate-200/50 rounded-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.01)]
        ring-1 ring-slate-900/5
        transition-all duration-300
        ${padding}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
