import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue'
  trend,
  className = '',
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      ring: 'group-hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      ring: 'group-hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      ring: 'group-hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      ring: 'group-hover:border-rose-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      ring: 'group-hover:border-purple-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      ring: 'group-hover:border-blue-200',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl ${c.bg} ${c.text} transition-transform group-hover:scale-105 duration-200`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
