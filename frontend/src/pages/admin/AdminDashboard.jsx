import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Sliders,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { leaveApi, reportApi } from '../../api';
import StatCard from '../../components/common/StatCard';
import LeaveDistributionChart from '../../components/charts/LeaveDistributionChart';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import DepartmentChart from '../../components/charts/DepartmentChart';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          leaveApi.getStats(),
          reportApi.getAnalytics(),
        ]);
        setStats(statsRes.data.stats);
        setAnalytics(analyticsRes.data.analytics);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Executive Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise overview of personnel, leave trends, policies, and departmental workloads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/all-leaves"
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Master Requests
          </Link>
          <Link
            to="/admin/employees"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm shadow-2xs transition-all flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            subtitle="Registered staff"
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Total Managers"
            value={stats.totalManagers}
            subtitle="Department supervisors"
            icon={Shield}
            color="purple"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            subtitle="Awaiting decision"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Approved Leaves"
            value={stats.approvedLeaves}
            subtitle="Granted to date"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejectedRequests}
            subtitle="Declined applications"
            icon={XCircle}
            color="rose"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart data={analytics?.monthlyTrends || []} />
        </div>
        <div className="lg:col-span-1">
          <LeaveDistributionChart data={analytics?.typeDistribution || []} />
        </div>
      </div>

      {/* Department Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DepartmentChart data={analytics?.deptStats || []} />
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/admin/employees"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary-700">
                    Add or Edit Employees
                  </p>
                  <p className="text-[11px] text-slate-400">Assign managers and roles</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/departments"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary-700">
                    Configure Departments
                  </p>
                  <p className="text-[11px] text-slate-400">Assign department heads</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/policies"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary-700">
                    Leave Quotas & Policies
                  </p>
                  <p className="text-[11px] text-slate-400">Configure annual day limits</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/audit-logs"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary-700">
                    System Audit Trail
                  </p>
                  <p className="text-[11px] text-slate-400">Security & state transition logs</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
