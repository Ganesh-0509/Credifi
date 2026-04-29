import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/50 outline-none transition-all ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-rose-400 ml-1 uppercase tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}
