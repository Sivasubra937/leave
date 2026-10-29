import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  CalendarPlus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  Clock,
  Sparkles,
  Paperclip,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leaveTypeApi, leaveApi } from '../../api';
import toast from 'react-hot-toast';

const ApplyLeave = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const selectedTypeId = watch('leaveTypeId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await leaveTypeApi.getAll();
        setLeaveTypes(res.data.leaveTypes || []);
      } catch (err) {
        console.error('Failed to load leave types', err);
      }
    };
    fetchTypes();
  }, []);

  // Client-side real-time calculation of working days (excluding Sat & Sun)
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedDays(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    setCalculatedDays(count);
  }, [startDate, endDate]);

  const selectedType = leaveTypes.find((t) => t._id === selectedTypeId);
  const currentAvailableBalance = selectedType
    ? user?.leaveBalances?.[selectedType.code] ?? 0
    : 0;
  const isBalanceExceeded = calculatedDays > currentAvailableBalance;

  // Format today's date in YYYY-MM-DD for min date constraint
  const todayStr = new Date().toISOString().split('T')[0];

  const onSubmit = async (data) => {
    if (calculatedDays === 0) {
      toast.error('The selected dates contain 0 working days (weekends only).');
      return;
    }

    if (isBalanceExceeded) {
      toast.error(
        `Insufficient leave balance. You requested ${calculatedDays} day(s) but have only ${currentAvailableBalance} remaining for ${selectedType.name}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('leaveTypeId', data.leaveTypeId);
        payload.append('startDate', data.startDate);
        payload.append('endDate', data.endDate);
        payload.append('reason', data.reason);
        payload.append('document', selectedFile);
      } else {
        payload = {
          leaveTypeId: data.leaveTypeId,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };
      }

      const res = await leaveApi.apply(payload);

      toast.success(res.data.message || 'Leave applied successfully!');
      await refreshUser();
      navigate('/my-leaves');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit leave application.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarPlus className="h-6 w-6 text-primary-600" />
          Apply for Leave
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit your leave request. Saturday and Sunday are automatically excluded from working days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Leave Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Leave Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('leaveTypeId', { required: 'Please select a leave type' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} (Balance: {user?.leaveBalances?.[t.code] ?? 0} days remaining)
                  </option>
                ))}
              </select>
              {errors.leaveTypeId && (
                <p className="text-xs text-rose-500 mt-1">{errors.leaveTypeId.message}</p>
              )}
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                />
                {errors.startDate && (
                  <p className="text-xs text-rose-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={startDate || todayStr}
                  {...register('endDate', { required: 'End date is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                />
                {errors.endDate && (
                  <p className="text-xs text-rose-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Live Calculation Pill */}
            {startDate && endDate && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isBalanceExceeded
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : calculatedDays > 0
                    ? 'bg-primary-50 border-primary-200 text-primary-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Calculated working duration: <strong>{calculatedDays} working day(s)</strong> (weekends excluded)
                  </span>
                </div>
                {isBalanceExceeded && (
                  <span className="font-bold text-rose-600 uppercase text-[10px] tracking-wider">
                    Balance Exceeded
                  </span>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for Leave <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Please state the reason for your leave request (e.g., medical appointment, family wedding, personal rest)..."
                {...register('reason', {
                  required: 'Reason is required',
                  minLength: { value: 5, message: 'Please provide at least 5 characters' },
                  maxLength: { value: 500, message: 'Max 500 characters' },
                })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all resize-none"
              />
              {errors.reason && (
                <p className="text-xs text-rose-500 mt-1">{errors.reason.message}</p>
              )}
            </div>

            {/* Optional Supporting Document Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Supporting Document (Optional)</span>
                <span className="text-[11px] text-slate-400 font-normal">PDF, PNG, JPG (Max 5MB)</span>
              </label>

              {!selectedFile ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50 hover:bg-primary-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Paperclip className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">
                    Click to select file
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    For medical proof, event invitation, etc.
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('File size exceeds the 5MB limit.');
                        return;
                      }
                      setSelectedFile(file);
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-primary-50/60 border border-primary-200 rounded-xl text-xs text-primary-900">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    <span className="truncate font-medium">{selectedFile.name}</span>
                    <span className="text-[10px] text-primary-500 flex-shrink-0">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-primary-200 rounded-lg text-primary-700 transition-colors ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || isBalanceExceeded || calculatedDays === 0}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Leave Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info & Balances */}
        <div className="space-y-4">
          {/* Selected Policy Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quota & Policy Details
            </h4>
            {selectedType ? (
              <div className="space-y-3">
                <p className="text-base font-bold text-slate-800">{selectedType.name}</p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Available Balance:</span>
                    <strong className="text-slate-900">{currentAvailableBalance} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Allocation:</span>
                    <span>{selectedType.annualQuota} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Leave:</span>
                    <span>{selectedType.isPaid ? 'Yes (Paid)' : 'No (Unpaid)'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedType.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a leave type from the dropdown to review its policy and your remaining balance.
              </p>
            )}
          </div>

          {/* Business Rules Help Card */}
          <div className="bg-primary-50/60 p-6 rounded-3xl border border-primary-100/60 text-xs text-primary-950 space-y-2.5">
            <h4 className="font-bold text-primary-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary-600" />
              LMS Business Rules
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>Weekends (Sat & Sun) are never deducted.</li>
              <li>Leave cannot be applied on past dates.</li>
              <li>Overlapping requests are automatically prevented.</li>
              <li>Balance is only deducted after your manager approves.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
