import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl tracking-tight";
  
  const variants = {
    primary: "bg-amber-500 text-black hover:bg-amber-400 shadow-xl shadow-amber-500/10",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700",
    outline: "bg-transparent text-white border border-white/10 hover:bg-white/5",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/10",
    ghost: "bg-transparent text-slate-400 hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Processing</span>
        </div>
      ) : children}
    </button>
  );
}
