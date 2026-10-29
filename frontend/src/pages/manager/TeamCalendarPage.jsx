import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { leaveApi } from '../../api';
import LeaveCalendar from '../../components/calendar/LeaveCalendar';

const TeamCalendarPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await leaveApi.getCalendar();
        setLeaves(res.data.leaves || []);
      } catch (err) {
        console.error('Failed to fetch team calendar', err);
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
          Team Leave Calendar
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Full schedule of who is off-duty across your assigned team members
        </p>
      </div>

      <LeaveCalendar leaves={leaves} title="Team Leave & OOO Schedule" />
    </div>
  );
};

export default TeamCalendarPage;
