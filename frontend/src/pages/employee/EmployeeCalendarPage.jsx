import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import { leaveApi } from '../../api';
import LeaveCalendar from '../../components/calendar/LeaveCalendar';

const EmployeeCalendarPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await leaveApi.getCalendar();
        setLeaves(res.data.leaves || []);
      } catch (err) {
        console.error('Failed to fetch calendar leaves', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary-600" />
          My Leave Calendar
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Visual monthly calendar showing your approved and pending leave blocks
        </p>
      </div>

      <LeaveCalendar leaves={leaves} title="Personal Leave Schedule" />
    </div>
  );
};

export default EmployeeCalendarPage;
