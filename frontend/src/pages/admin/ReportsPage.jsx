import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Users, CheckCircle, Clock } from 'lucide-react';
import { reportApi } from '../../api';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import LeaveDistributionChart from '../../components/charts/LeaveDistributionChart';
import DepartmentChart from '../../components/charts/DepartmentChart';

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await reportApi.getAnalytics();
        setAnalytics(res.data.analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          Leave Reports & Analytics
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Detailed metrics and visual trends on employee leave consumption across the organization
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading analytics...</div>
      ) : (
        <>
          {/* Main Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendChart data={analytics?.monthlyTrends || []} />
            <LeaveDistributionChart data={analytics?.typeDistribution || []} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <DepartmentChart data={analytics?.deptStats || []} />
          </div>

          {/* Department Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">
              Departmental Utilization Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Employees</th>
                    <th className="px-6 py-3">Approved Days</th>
                    <th className="px-6 py-3">Total Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.deptStats?.map((d) => (
                    <tr key={d.code} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{d.department}</td>
                      <td className="px-6 py-4 font-mono text-xs">{d.code}</td>
                      <td className="px-6 py-4">{d.employeeCount}</td>
                      <td className="px-6 py-4 font-bold text-primary-700">
                        {d.totalLeaveDays} Days
                      </td>
                      <td className="px-6 py-4">{d.requestsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
