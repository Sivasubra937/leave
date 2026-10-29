import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Check,
  X,
  Eye,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { leaveApi, userApi } from '../../api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [activeReview, setActiveReview] = useState(null); // { leave, action: 'approve' | 'reject' }
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leavesRes] = await Promise.all([
        leaveApi.getStats(),
        leaveApi.getTeamLeaves({ status: 'pending', limit: 5 }),
      ]);
      setStats(statsRes.data.stats);
      setPendingRequests(leavesRes.data.leaves || []);
    } catch (err) {
      console.error('Failed to load manager dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReviewSubmit = async () => {
    if (!activeReview) return;
    if (activeReview.action === 'reject' && !reviewComment.trim()) {
      toast.error('A comment is required when rejecting a request.');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await leaveApi.reviewLeave(activeReview.leave._id, {
        action: activeReview.action,
        comments: reviewComment,
      });

      toast.success(res.data.message || `Leave request ${activeReview.action}d successfully`);
      setActiveReview(null);
      setReviewComment('');
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to review leave request';
      toast.error(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Manager Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review pending leave submissions and manage team attendance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/manager/calendar"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm shadow-2xs transition-all flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Team Calendar
          </Link>
          <Link
            to="/manager/requests"
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            All Team Requests
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Team Members"
            value={stats.teamSize}
            subtitle="Directly assigned employees"
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Requires your review"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Approved Total"
            value={stats.approvedTotal}
            subtitle="Leaves granted to date"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Rejected Total"
            value={stats.rejectedTotal}
            subtitle="Declined applications"
            icon={XCircle}
            color="rose"
          />
        </div>
      )}

      {/* Pending Approvals Queue */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Pending Approvals Queue</h3>
            <p className="text-xs text-slate-500">Applications awaiting your decision</p>
          </div>
          <Link
            to="/manager/requests"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Date Range</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                      Loading pending requests...
                    </div>
                  </td>
                </tr>
              ) : pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All caught up! No pending leave requests currently require your approval.
                  </td>
                </tr>
              ) : (
                pendingRequests.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{leave.employee?.name}</div>
                      <div className="text-xs text-slate-400">
                        {leave.employee?.jobTitle || leave.employee?.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {leave.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {leave.daysCount} working {leave.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveReview({ leave, action: 'approve' });
                            setReviewComment('Approved. Have a good break!');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setActiveReview({ leave, action: 'reject' });
                            setReviewComment('');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Confirmation Modal */}
      <Modal
        isOpen={!!activeReview}
        onClose={() => setActiveReview(null)}
        title={
          activeReview?.action === 'approve'
            ? 'Approve Leave Request'
            : 'Reject Leave Request'
        }
      >
        {activeReview && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-800">
                  {activeReview.leave.employee?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Type:</span>
                <span className="font-semibold text-slate-800">
                  {activeReview.leave.leaveTypeName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Duration:</span>
                <span className="font-bold text-slate-800">
                  {activeReview.leave.daysCount} working day(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Balance:</span>
                <span className="font-bold text-indigo-700">
                  {activeReview.leave.employee?.leaveBalances?.[
                    activeReview.leave.leaveTypeCode
                  ] ?? 'N/A'}{' '}
                  days
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {activeReview.action === 'approve' ? 'Comments (Optional)' : 'Rejection Reason *'}
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  activeReview.action === 'approve'
                    ? 'e.g. Approved. Please ensure task handover.'
                    : 'e.g. Due to product launch milestone, please reschedule to next week...'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={handleReviewSubmit}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 ${
                  activeReview.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {reviewLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Confirm {activeReview.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
