import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (normalized === 'RECOVERED' || normalized === 'PAYMENT_SUCCESS' || normalized === 'SUCCESS') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    label = 'Success';
  } else if (normalized === 'PAYMENT_FAILED' || normalized === 'FAILED') {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80';
    label = 'Failed';
  } else if (normalized === 'AI_ANALYZED' || normalized === 'ANALYZED') {
    style = 'bg-blue-50 text-blue-700 border-blue-200/80';
    label = 'Analyzed';
  } else if (normalized === 'RECOVERY_APPROVED' || normalized === 'RETRY_PAYMENT' || normalized === 'RECOVERING') {
    style = 'bg-teal-50 text-teal-700 border-teal-200/80';
    label = 'Recovering';
  } else if (normalized === 'MERCHANT_APPROVAL' || normalized === 'REQUIRES_APPROVAL' || normalized === 'NEEDS APPROVAL') {
    style = 'bg-amber-50 text-amber-700 border-amber-200/80';
    label = 'Needs Approval';
  } else if (normalized === 'MAX_ATTEMPTS_REACHED') {
    style = 'bg-orange-50 text-orange-700 border-orange-200/80';
    label = 'Max Attempts';
  } else if (normalized === 'RECOVERY_REJECTED' || normalized === 'EXPIRED') {
    style = 'bg-slate-100 text-slate-600 border-slate-200';
    label = normalized;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
