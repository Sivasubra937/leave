import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { holidayApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const HolidaysPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    date: '',
    description: '',
    isRecurring: false,
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidayApi.getAll();
      setHolidays(res.data.holidays || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load company holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) {
      toast.error('Please provide name and date.');
      return;
    }

    setSubmitting(true);
    try {
      await holidayApi.create(form);
      toast.success('Holiday scheduled successfully');
      setIsModalOpen(false);
      setForm({ name: '', date: '', description: '', isRecurring: false });
      fetchHolidays();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add holiday';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the holiday '${name}'?`)) return;

    try {
      await holidayApi.delete(id);
      toast.success('Holiday removed');
      fetchHolidays();
    } catch (err) {
      toast.error('Failed to delete holiday');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary-600" />
            Company Holidays & Calendar
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Official holidays scheduled for the current operating year. These days are automatically excluded from working leave calculations.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
        )}
      </div>

      {/* Holidays Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : holidays.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Holidays Scheduled</h3>
          <p className="text-sm text-slate-500 mt-1">Company holidays have not been configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((h) => {
            const hDate = new Date(h.date);
            const isPast = hDate < today;
            const dayName = hDate.toLocaleDateString(undefined, { weekday: 'long' });
            const monthDay = hDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div
                key={h._id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-white ${
                  isPast ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-primary-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {monthDay}
                    </span>
                    {h.isRecurring && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        Annual
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(h._id, h.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Holiday"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-800 mt-3">{h.name}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {dayName}
                </p>

                {h.description && (
                  <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-50 line-clamp-2">
                    {h.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Add Holiday Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Company Holiday">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Labor Day, Spring Festival"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Holiday Date *
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief details about this official holiday..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-medium text-slate-700">Recurring Annual Holiday (Yearly)</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidaysPage;
