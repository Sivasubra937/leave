import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Info,
} from 'lucide-react';
import Badge from '../common/Badge';

const LeaveCalendar = ({ leaves = [], title = 'Leave Schedule Calendar' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLeaves, setSelectedDayLeaves] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (42 cells: 6 rows of 7)
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  // Filter leaves that overlap with a specific date
  const getLeavesForDate = (cellYear, cellMonth, cellDay) => {
    const target = new Date(cellYear, cellMonth, cellDay);
    target.setHours(0, 0, 0, 0);

    return leaves.filter((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  };

  const isToday = (cellYear, cellMonth, cellDay) => {
    const today = new Date();
    return (
      today.getFullYear() === cellYear &&
      today.getMonth() === cellMonth &&
      today.getDate() === cellDay
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary-600" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Color-coded overview of approved (green) and pending (amber) applications
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={resetToToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 text-center text-xs font-semibold text-slate-500 bg-slate-50/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={d} className={`py-2.5 ${i === 0 || i === 6 ? 'text-slate-400 bg-slate-100/30' : ''}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/20">
        {calendarCells.map((cell, idx) => {
          const dayLeaves = getLeavesForDate(cell.year, cell.month, cell.day);
          const isCurrentDay = isToday(cell.year, cell.month, cell.day);
          const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

          return (
            <div
              key={idx}
              onClick={() => dayLeaves.length > 0 && setSelectedDayLeaves({ cell, leaves: dayLeaves })}
              className={`min-h-24 p-2 transition-colors relative flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/40 text-slate-400'
                  : isWeekend
                  ? 'bg-slate-50/30 text-slate-700'
                  : 'bg-white text-slate-800'
              } ${dayLeaves.length > 0 ? 'cursor-pointer hover:bg-primary-50/20' : ''}`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    isCurrentDay
                      ? 'bg-primary-600 text-white font-bold shadow-xs'
                      : ''
                  }`}
                >
                  {cell.day}
                </span>

                {dayLeaves.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {dayLeaves.length} {dayLeaves.length === 1 ? 'leave' : 'leaves'}
                  </span>
                )}
              </div>

              {/* Leave Chips */}
              <div className="space-y-1 mt-1.5 overflow-hidden">
                {dayLeaves.slice(0, 2).map((l) => (
                  <div
                    key={l._id}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                      l.status === 'approved'
                        ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50'
                        : 'bg-amber-100/80 text-amber-800 border border-amber-200/50'
                    }`}
                    title={`${l.employee?.name || 'Applicant'} - ${l.leaveTypeName} (${l.status})`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        l.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    />
                    <span className="truncate">
                      {l.employee?.name ? `${l.employee.name.split(' ')[0]}: ` : ''}
                      {l.leaveTypeName}
                    </span>
                  </div>
                ))}
                {dayLeaves.length > 2 && (
                  <div className="text-[10px] font-medium text-slate-500 pl-1">
                    +{dayLeaves.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Leave Drawer / Detail Card */}
      {selectedDayLeaves && (
        <div className="p-4 bg-primary-50/40 border-t border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">
              Leaves on {selectedDayLeaves.cell.day} {monthNames[selectedDayLeaves.cell.month]}{' '}
              {selectedDayLeaves.cell.year}:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDayLeaves.leaves.map((l) => (
                <div
                  key={l._id}
                  className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{l.employee?.name || 'Applicant'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{l.leaveTypeName} ({l.daysCount}d)</span>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedDayLeaves(null)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium self-end sm:self-auto"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;
