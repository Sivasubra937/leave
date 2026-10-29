import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  Clock,
  Calendar,
  HeartPulse,
  Sun,
  Award,
  AlertCircle,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leaveApi } from '../../api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

const EmployeeDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUser();
        const [statsRes, leavesRes] = await Promise.all([
          leaveApi.getStats(),
          leaveApi.getMyLeaves({ page: 1, limit: 5 }),
        ]);
        setStats(statsRes.data.stats);
        setRecentLeaves(leavesRes.data.leaves || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balances = user?.leaveBalances || {
    casual: 12,
    sick: 10,
    earned: 15,
    unpaid: 30,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-primary-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
              <span>{user?.employeeId || 'EMP'}</span>
              <span>•</span>
              <span>{user?.department?.name || 'General Team'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-primary-100 max-w-xl leading-relaxed">
              Plan and manage your leaves with ease. Your applications are reviewed by{' '}
              <span className="font-semibold text-white underline decoration-primary-300">
                {user?.manager?.name || 'assigned manager'}
              </span>
              . Weekends are automatically excluded from working day calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/apply-leave"
              className="px-5 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Apply Leave
            </Link>
            <Link
              to="/calendar"
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl font-semibold text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Link>
          </div>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Available Leave Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Available Leave Balances
          </h3>
          <span className="text-xs font-medium text-slate-400">
            Updated live for current calendar year
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Casual Leave"
            value={`${balances.casual} Days`}
            subtitle="Short breaks & personal errands"
            icon={Sun}
            color="indigo"
          />
          <StatCard
            title="Sick Leave"
            value={`${balances.sick} Days`}
            subtitle="Medical & recuperation time"
            icon={HeartPulse}
            color="rose"
          />
          <StatCard
            title="Earned Leave"
            value={`${balances.earned} Days`}
            subtitle="Accrued annual vacation quota"
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Unpaid Leave"
            value={`${balances.unpaid} Days`}
            subtitle="Emergency non-paid entitlement"
            icon={Clock}
            color="amber"
          />
        </div>
      </div>

      {/* Overview Stats (Pending, Approved, Rejected) */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Approved
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rejected
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Recent Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Applications</h3>
            <p className="text-xs text-slate-500">Your latest leave submissions</p>
          </div>
          <Link
            to="/my-leaves"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all requests
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Working Days</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLeaves.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-400">
                    No leave requests found yet.{' '}
                    <Link to="/apply-leave" className="text-primary-600 font-semibold underline">
                      Apply for your first leave
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                recentLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {leave.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {leave.daysCount} working {leave.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
