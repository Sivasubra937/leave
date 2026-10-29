import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, Shield } from 'lucide-react';
import { departmentApi, userApi } from '../../api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
  });

  const fetchData = async () => {
    try {
      const [deptRes, mgrRes] = await Promise.all([
        departmentApi.getAll(),
        userApi.getManagers(),
      ]);
      setDepartments(deptRes.data.departments || []);
      setManagers(mgrRes.data.managers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({ name: '', code: '', description: '', head: '' });
    setCreateModal(true);
  };

  const handleOpenEdit = (d) => {
    setEditDept(d);
    setFormData({
      name: d.name,
      code: d.code,
      description: d.description || '',
      head: d.head?._id || '',
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await departmentApi.create(formData);
      toast.success('Department created successfully');
      setCreateModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDept) return;
    setSubmitting(true);
    try {
      await departmentApi.update(editDept._id, formData);
      toast.success('Department updated successfully');
      setEditDept(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await departmentApi.delete(deleteTarget._id);
      toast.success('Department deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-600" />
            Department Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Organize company structure and assign departmental leadership
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            No departments defined yet.
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                    {dept.code}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dept)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{dept.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {dept.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Shield className="h-3.5 w-3.5 text-primary-500" />
                  <span className="font-semibold">{dept.head?.name || 'No Head Assigned'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={createModal || !!editDept}
        onClose={() => {
          setCreateModal(false);
          setEditDept(null);
        }}
        title={editDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={editDept ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quality Assurance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. QA"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department Head
            </label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">No Head Assigned</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Responsibilities and domain..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCreateModal(false);
                setEditDept(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              {submitting ? 'Saving...' : editDept ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? You cannot delete a department if employees are currently assigned to it.`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default DepartmentManagement;
