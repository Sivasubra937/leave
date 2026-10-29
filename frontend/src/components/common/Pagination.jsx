import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, onPageChange, limit = 10 }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="ml-3 px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pages}</span> (Total{' '}
            <span className="font-semibold text-slate-700">{total}</span> records)
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
              // Only show nearby pages if there are many
              if (p === 1 || p === pages || (p >= page - 2 && p <= page + 2)) {
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`relative inline-flex items-center px-3.5 py-2 border text-xs font-medium transition-colors ${
                      page === p
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              } else if (p === page - 3 || p === page + 3) {
                return (
                  <span
                    key={p}
                    className="relative inline-flex items-center px-3 py-2 border border-slate-200 bg-white text-xs text-slate-400"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
