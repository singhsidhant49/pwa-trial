import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "premium" | "secondary" | "subtle" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
    premium: "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-sm",
    subtle: "bg-slate-100/50 text-slate-600 hover:bg-slate-100 active:bg-slate-200",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:bg-red-200 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    xs: "h-7 px-2.5 text-[10px] uppercase tracking-wider font-bold",
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 
        rounded-xl font-bold transition-all duration-200
        active:scale-[0.98] outline-none
        disabled:opacity-40 disabled:pointer-events-none disabled:grayscale
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
