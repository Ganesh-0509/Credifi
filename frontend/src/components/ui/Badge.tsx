import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border";
  
  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    neutral: "bg-white/5 text-slate-400 border-white/10",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
