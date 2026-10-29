import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { leaveApi } from '../../api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AllLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({
        search: search || undefined,
        status: statusFilter,
        leaveType: typeFilter,
        page,
        limit: 15,
      });
      setLeaves(res.data.leaves || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  // Export to CSV function
  const handleExportCSV = () => {
    if (leaves.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = [
      'Employee Name',
      'Employee ID',
      'Email',
      'Leave Type',
      'Start Date',
      'End Date',
      'Working Days',
      'Status',
      'Reason',
      'Approver',
      'Approver Comment',
      'Applied Date',
    ];

    const rows = leaves.map((l) => [
      `"${l.employee?.name || ''}"`,
      `"${l.employee?.employeeId || ''}"`,
      `"${l.employee?.email || ''}"`,
      `"${l.leaveTypeName || ''}"`,
      `"${new Date(l.startDate).toLocaleDateString()}"`,
      `"${new Date(l.endDate).toLocaleDateString()}"`,
      l.daysCount,
      `"${l.status}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${l.approver?.name || 'N/A'}"`,
      `"${(l.approverComment || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lms_leave_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leave records exported to CSV successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary-600" />
            Master Leave Records
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete organization-wide history of all employee leave applications
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm shadow-2xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Leave Types</option>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <button
          onClick={() => fetchLeaves(pagination.page)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Date Range</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approver</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading leave records...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{leave.employee?.name}</div>
                      <div className="text-xs text-slate-400">{leave.employee?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {leave.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {leave.daysCount} d
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {leave.approver?.name || <span className="text-slate-300 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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
          onPageChange={(p) => fetchLeaves(p)}
        />
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-base text-slate-900">{selectedLeave.employee?.name}</p>
                <p className="text-xs text-slate-400">
                  {selectedLeave.employee?.employeeId} • {selectedLeave.employee?.email}
                </p>
              </div>
              <Badge status={selectedLeave.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 text-xs">Leave Type</span>
                <p className="font-semibold text-slate-800">{selectedLeave.leaveTypeName}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Duration</span>
                <p className="font-semibold text-slate-800">
                  {selectedLeave.daysCount} working days
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Date Range</span>
                <p className="text-slate-700">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Applied On</span>
                <p className="text-slate-700">
                  {new Date(selectedLeave.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Reason
              </span>
              <p className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700">
                {selectedLeave.reason}
              </p>
            </div>

            {selectedLeave.approver && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Approver Note
                </span>
                <p className="text-slate-700 mt-1">
                  "{selectedLeave.approverComment || 'No comments'}"
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Reviewed by {selectedLeave.approver.name}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllLeaveRequests;
