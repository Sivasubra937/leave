import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Filter,
  Check,
  X,
  Eye,
  RefreshCw,
  Clock,
  User,
  Paperclip,
} from 'lucide-react';
import { leaveApi, userApi } from '../../api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const TeamRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Details Modal
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Review Modal
  const [reviewTarget, setReviewTarget] = useState(null); // { leave, action }
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await userApi.getTeamMembers();
        setTeamMembers(res.data.members || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, []);

  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await leaveApi.getTeamLeaves({
        status: statusFilter,
        employeeId: employeeFilter || undefined,
        leaveType: typeFilter,
        page,
        limit: 10,
      });
      setLeaves(res.data.leaves || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, employeeFilter, typeFilter]);

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    if (reviewTarget.action === 'reject' && !comment.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await leaveApi.reviewLeave(reviewTarget.leave._id, {
        action: reviewTarget.action,
        comments: comment,
      });

      toast.success(res.data.message || 'Review processed successfully');
      setReviewTarget(null);
      setComment('');
      fetchLeaves(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to review leave request';
      toast.error(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary-600" />
          Team Leave Applications
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review, approve, or decline leave requests from your assigned team members
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            Filter:
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
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="">All Team Members</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.employeeId})
              </option>
            ))}
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading team requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No team leave applications found matching current criteria.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{leave.employee?.name}</div>
                      <div className="text-xs text-slate-400">
                        {leave.employee?.employeeId} • {leave.employee?.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {leave.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {leave.daysCount} working {leave.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={leave.status} />
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

                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setReviewTarget({ leave, action: 'approve' });
                                setComment('Approved. Ensure project notes are updated.');
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReviewTarget({ leave, action: 'reject' });
                                setComment('');
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
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

            {selectedLeave.approverComment && (
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Review Comment
                </span>
                <p className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700">
                  {selectedLeave.approverComment}
                </p>
              </div>
            )}

            {selectedLeave.documentUrl && (
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Supporting Document
                </span>
                <div className="mt-1">
                  <a
                    href={`http://localhost:5000/api/leaves/${selectedLeave._id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    View Attached Certificate / Document
                  </a>
                </div>
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

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={
          reviewTarget?.action === 'approve'
            ? 'Approve Team Request'
            : 'Reject Team Request'
        }
      >
        {reviewTarget && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p>
                <strong>Applicant:</strong> {reviewTarget.leave.employee?.name}
              </p>
              <p>
                <strong>Leave:</strong> {reviewTarget.leave.daysCount} day(s) of{' '}
                {reviewTarget.leave.leaveTypeName}
              </p>
              <p>
                <strong>Current Balance:</strong>{' '}
                {reviewTarget.leave.employee?.leaveBalances?.[
                  reviewTarget.leave.leaveTypeCode
                ] ?? 'N/A'}{' '}
                days
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {reviewTarget.action === 'approve' ? 'Comments (Optional)' : 'Rejection Reason *'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  reviewTarget.action === 'approve'
                    ? 'Comments for applicant...'
                    : 'Explain reason for declining this request...'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={handleReviewSubmit}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg ${
                  reviewTarget.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {reviewLoading ? 'Processing...' : `Confirm ${reviewTarget.action}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamRequests;
