import React from 'react';

const Badge = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase();

  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200 ring-slate-400/20',
    casual: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
    sick: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20',
    earned: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-600/20',
    unpaid: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
  };

  const currentStyle = styles[norm] || 'bg-slate-50 text-slate-700 border-slate-200';

  const labels = {
    approved: 'Approved',
    pending: 'Pending Approval',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
  };

  const label = labels[norm] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </span>
  );
};

export default Badge;
