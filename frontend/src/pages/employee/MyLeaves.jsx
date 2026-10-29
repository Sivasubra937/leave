import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Filter,
  Eye,
  Ban,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react';
import { leaveApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const MyLeaves = () => {
  const { refreshUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Detail Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Cancellation State
  const [leaveToCancel, setLeaveToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyLeaves({
        status: statusFilter,
        leaveType: typeFilter,
        page,
        limit: 10,
      });
      setLeaves(res.data.leaves || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch my leaves', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  const handleCancelConfirm = async () => {
    if (!leaveToCancel) return;
    setCancelLoading(true);
    try {
      const res = await leaveApi.cancelLeave(leaveToCancel._id, {
        reason: 'Cancelled by employee request',
      });
      toast.success(res.data.message || 'Leave cancelled successfully');
      setLeaveToCancel(null);
      await refreshUser();
      fetchLeaves(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel leave';
      toast.error(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary-600" />
            My Leave Requests
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track status, review manager comments, or cancel pending applications
          </p>
        </div>

        <Link
          to="/apply-leave"
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <CalendarPlus className="h-4 w-4" />
          Apply New Leave
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            Filter By:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Date Range</th>
                <th className="px-6 py-4">Working Days</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approver Note</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                      Loading leave records...
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No leave requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{leave.leaveTypeName}</p>
                      <p className="text-xs text-slate-400">
                        Applied {new Date(leave.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {leave.approverComment || (
                        <span className="text-slate-300 italic">No comments</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {(leave.status === 'pending' || leave.status === 'approved') && (
                          <button
                            onClick={() => setLeaveToCancel(leave)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Request"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

      {/* Leave Details Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-base text-slate-900">{selectedLeave.leaveTypeName}</p>
                <p className="text-xs text-slate-400">
                  Applied on {new Date(selectedLeave.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge status={selectedLeave.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 text-xs">Date Range</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Duration</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedLeave.daysCount} Working Day(s)
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Reason for Application
              </span>
              <p className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                {selectedLeave.reason}
              </p>
            </div>

            {selectedLeave.approver && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Reviewer Feedback
                </span>
                <p className="text-slate-700 font-medium">
                  "{selectedLeave.approverComment || 'No comments provided'}"
                </p>
                <p className="text-[11px] text-slate-400">
                  Reviewed by {selectedLeave.approver.name} on{' '}
                  {selectedLeave.decisionDate
                    ? new Date(selectedLeave.decisionDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            )}

            {selectedLeave.status === 'cancelled' && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs">
                <strong>Cancelled:</strong>{' '}
                {selectedLeave.cancellationReason || 'Cancelled by employee'}
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

      {/* Confirmation Dialog for Cancel */}
      <ConfirmDialog
        isOpen={!!leaveToCancel}
        onClose={() => setLeaveToCancel(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Leave Request"
        message={
          leaveToCancel?.status === 'approved'
            ? `Are you sure you want to cancel this APPROVED ${leaveToCancel?.daysCount}-day ${leaveToCancel?.leaveTypeName}? The ${leaveToCancel?.daysCount} day(s) will be automatically refunded back to your leave balance.`
            : `Are you sure you want to cancel this pending ${leaveToCancel?.leaveTypeName} application?`
        }
        confirmText="Yes, Cancel Leave"
        cancelText="Keep Leave"
        isDanger={true}
        loading={cancelLoading}
      />
    </div>
  );
};

export default MyLeaves;
