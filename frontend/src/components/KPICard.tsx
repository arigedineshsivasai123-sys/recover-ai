import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'slate',
  highlight = false,
}) => {
  const variantStyles = {
    emerald: 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 text-emerald-400',
    amber: 'bg-slate-900/60 border-amber-500/20 text-amber-400',
    blue: 'bg-slate-900/60 border-blue-500/20 text-blue-400',
    purple: 'bg-slate-900/60 border-purple-500/20 text-purple-400',
    slate: 'bg-slate-900/60 border-slate-800 text-slate-400',
  };

  const iconBgStyles = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 hover:border-slate-700 ${variantStyles[variant]} ${
        highlight ? 'ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${iconBgStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">{value}</div>
      {subtext && <div className="text-xs font-medium text-slate-400">{subtext}</div>}
    </div>
  );
};
