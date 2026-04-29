import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:bg-white/10 focus:border-amber-500/50 outline-none transition-all appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-400 ml-1 uppercase tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}
