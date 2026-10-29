import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Edit2, ShieldAlert, Check } from 'lucide-react';
import { leaveTypeApi } from '../../api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const LeavePolicySettings = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editType, setEditType] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    annualQuota: 12,
    description: '',
    isPaid: true,
  });

  const fetchTypes = async () => {
    try {
      const res = await leaveTypeApi.getAll();
      setLeaveTypes(res.data.leaveTypes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleOpenEdit = (t) => {
    setEditType(t);
    setFormData({
      annualQuota: t.annualQuota,
      description: t.description || '',
      isPaid: t.isPaid,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editType) return;
    setSubmitting(true);
    try {
      await leaveTypeApi.update(editType._id, formData);
      toast.success(`${editType.name} policy updated successfully`);
      setEditType(null);
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetBalances = async () => {
    setSubmitting(true);
    try {
      const res = await leaveTypeApi.resetBalances();
      toast.success(res.data.message || 'Balances refreshed for all active employees');
      setResetConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh balances');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="h-6 w-6 text-primary-600" />
            Leave Policies & Annual Quotas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure default annual day entitlements and compensation rules for each leave type
          </p>
        </div>

        <button
          onClick={() => setResetConfirmOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Annual Balances
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            Loading policies...
          </div>
        ) : (
          leaveTypes.map((t) => (
            <div
              key={t._id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{t.name}</h4>
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                    Code: {t.code}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition-colors"
                  title="Edit Policy"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400">Annual Quota</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{t.annualQuota} Days / Year</p>
                </div>
                <div>
                  <span className="text-slate-400">Compensation</span>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {t.isPaid ? 'Paid Leave' : 'Unpaid (Salary Loss)'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {t.description || 'No policy description specified.'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Edit Policy Modal */}
      <Modal
        isOpen={!!editType}
        onClose={() => setEditType(null)}
        title={`Configure ${editType?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Annual Quota (Days) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.annualQuota}
              onChange={(e) => setFormData({ ...formData, annualQuota: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <label htmlFor="isPaid" className="text-xs font-bold text-slate-700">
              Is Paid Leave (Salary is preserved)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Policy Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              {submitting ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Balances Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetBalances}
        title="Reset All Employee Balances?"
        message="This will reset the leave balances of ALL active employees to match the current annual quotas. Normally performed at the start of a new calendar year. Proceed?"
        confirmText="Yes, Reset Balances"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};

export default LeavePolicySettings;
