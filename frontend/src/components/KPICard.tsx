import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  badgeText?: string;
  badgeIsUp?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  badgeText = '↑ 12.5%',
  badgeIsUp = true,
}) => {
  const iconTheme = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      sparkline: '#2563EB',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      sparkline: '#059669',
    },
    amber: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      sparkline: '#DC2626',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
      sparkline: '#7C3AED',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      sparkline: '#64748B',
    },
  };

  const theme = iconTheme[variant];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${theme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 max-w-[140px] text-right truncate">
            {title}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-2">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>

          <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
            {badgeIsUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{badgeText}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 truncate max-w-[160px]">
          {subtext || 'Dynamic RecoverAI Metric'}
        </span>

        {/* Smooth SVG Wave Sparkline */}
        <svg className="w-16 h-6 overflow-visible shrink-0" viewBox="0 0 60 20">
          <path
            d={
              badgeIsUp
                ? "M0,15 Q15,18 30,8 T60,3"
                : "M0,5 Q15,2 30,12 T60,17"
            }
            fill="none"
            stroke={theme.sparkline}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
