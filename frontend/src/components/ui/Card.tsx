import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 ${className}`}>
      {(title || subtitle) && (
        <div className="px-8 py-6 border-b border-white/5">
          {title && <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}
