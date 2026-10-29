import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Filter, Clock, User, RefreshCw, Activity } from 'lucide-react';
import { reportApi } from '../../api';
import Pagination from '../../components/common/Pagination';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await reportApi.getAuditLogs({
        action: actionFilter,
        page,
        limit: 15,
      });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const getActionBadgeColor = (action) => {
    if (action.includes('APPROVED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REJECTED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('CANCELLED')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('USER_CREATED')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary-600" />
            System Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of state transitions, balance alterations, and security actions
          </p>
        </div>

        <button
          onClick={() => fetchLogs(pagination.page)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase">Filter Action:</span>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
        >
          <option value="all">All Actions</option>
          <option value="LEAVE_APPLIED">Leave Applied</option>
          <option value="LEAVE_APPROVED">Leave Approved</option>
          <option value="LEAVE_REJECTED">Leave Rejected</option>
          <option value="LEAVE_CANCELLED">Leave Cancelled</option>
          <option value="USER_CREATED">User Created</option>
          <option value="USER_UPDATED">User Updated</option>
          <option value="PASSWORD_CHANGED">Password Changed</option>
          <option value="LEAVE_POLICY_UPDATED">Policy Updated</option>
        </select>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Target Details</th>
                <th className="px-6 py-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {log.performedBy?.name || 'System'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {log.performedBy?.role} • {log.performedBy?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      {log.targetUser ? (
                        <div>
                          User: <strong className="text-slate-900">{log.targetUser.name}</strong> (
                          {log.targetUser.employeeId})
                        </div>
                      ) : null}
                      {log.targetLeave ? (
                        <div className="text-slate-500">
                          Leave: {log.targetLeave.leaveTypeName} ({log.targetLeave.daysCount}d)
                        </div>
                      ) : null}
                      {!log.targetUser && !log.targetLeave && (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={(p) => fetchLogs(p)}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;
