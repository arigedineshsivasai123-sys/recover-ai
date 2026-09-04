import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status;

  if (normalized === 'RECOVERED' || normalized === 'PAYMENT_SUCCESS') {
    style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    label = 'RECOVERED';
  } else if (normalized === 'PAYMENT_FAILED') {
    style = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    label = 'PAYMENT FAILED';
  } else if (normalized === 'AI_ANALYZED') {
    style = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    label = 'AI ANALYZED';
  } else if (normalized === 'RECOVERY_APPROVED' || normalized === 'RETRY_PAYMENT') {
    style = 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    label = 'RECOVERING';
  } else if (normalized === 'MERCHANT_APPROVAL' || normalized === 'REQUIRES_APPROVAL') {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'REQUIRES APPROVAL';
  } else if (normalized === 'MAX_ATTEMPTS_REACHED') {
    style = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    label = 'MAX ATTEMPTS';
  } else if (normalized === 'RECOVERY_REJECTED' || normalized === 'EXPIRED') {
    style = 'bg-slate-800 text-slate-400 border-slate-700';
    label = normalized;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
