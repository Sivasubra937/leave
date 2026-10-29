import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Power,
  Shield,
  Briefcase,
  Building2,
  RefreshCw,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { userApi, departmentApi } from '../../api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const EmployeeManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    manager: '',
    jobTitle: '',
    phone: '',
    casual: 12,
    sick: 10,
    earned: 15,
    unpaid: 30,
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await userApi.getUsers({
        search: search || undefined,
        role: roleFilter,
        department: deptFilter,
        page,
        limit: 10,
      });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, deptFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, mgrRes] = await Promise.all([
          departmentApi.getAll(),
          userApi.getManagers(),
        ]);
        setDepartments(deptRes.data.departments || []);
        setManagers(mgrRes.data.managers || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Password@123',
      role: 'employee',
      department: '',
      manager: '',
      jobTitle: '',
      phone: '',
      casual: 12,
      sick: 10,
      earned: 15,
      unpaid: 30,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department?._id || '',
      manager: user.manager?._id || '',
      jobTitle: user.jobTitle || '',
      phone: user.phone || '',
      casual: user.leaveBalances?.casual ?? 12,
      sick: user.leaveBalances?.sick ?? 10,
      earned: user.leaveBalances?.earned ?? 15,
      unpaid: user.leaveBalances?.unpaid ?? 30,
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department || null,
        manager: formData.manager || null,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        leaveBalances: {
          casual: Number(formData.casual),
          sick: Number(formData.sick),
          earned: Number(formData.earned),
          unpaid: Number(formData.unpaid),
        },
      });
      toast.success('Employee created successfully');
      setCreateModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      await userApi.updateUser(editUser._id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department || null,
        manager: formData.manager || null,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        leaveBalances: {
          casual: Number(formData.casual),
          sick: Number(formData.sick),
          earned: Number(formData.earned),
          unpaid: Number(formData.unpaid),
        },
      });
      toast.success('User details updated successfully');
      setEditUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      const res = await userApi.toggleStatus(statusTarget._id);
      toast.success(res.data.message || 'Status updated');
      setStatusTarget(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await userApi.deleteUser(deleteTarget._id);
      toast.success('User account deleted successfully');
      setDeleteTarget(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" />
            Employee Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create accounts, assign managers & departments, configure quotas, and manage access
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employees</option>
            <option value="manager">Managers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => fetchUsers(pagination.page)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Leave Balances</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.employeeId} • {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {u.department?.name || <span className="text-slate-300 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {u.manager?.name || <span className="text-slate-300 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex gap-1.5 font-mono text-[11px]">
                        <span title="Casual" className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">C:{u.leaveBalances?.casual ?? 0}</span>
                        <span title="Sick" className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold">S:{u.leaveBalances?.sick ?? 0}</span>
                        <span title="Earned" className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded font-semibold">E:{u.leaveBalances?.earned ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setStatusTarget(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
          onPageChange={(p) => fetchUsers(p)}
        />
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={createModalOpen || !!editUser}
        onClose={() => {
          setCreateModalOpen(false);
          setEditUser(null);
        }}
        title={editUser ? 'Edit Employee Details' : 'Create New Employee Account'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={editUser ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {!editUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                User Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">No Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reporting Manager
              </label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">No Manager</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Designer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="+1 555-0123"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Leave Quota Balances Assignment */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Leave Balances (Days Remaining)
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Casual</label>
                <input
                  type="number"
                  min="0"
                  value={formData.casual}
                  onChange={(e) => setFormData({ ...formData, casual: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Sick</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sick}
                  onChange={(e) => setFormData({ ...formData, sick: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Earned</label>
                <input
                  type="number"
                  min="0"
                  value={formData.earned}
                  onChange={(e) => setFormData({ ...formData, earned: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Unpaid</label>
                <input
                  type="number"
                  min="0"
                  value={formData.unpaid}
                  onChange={(e) => setFormData({ ...formData, unpaid: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setEditUser(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              {submitting ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        title={`${statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${statusTarget?.status === 'active' ? 'deactivate' : 'activate'} ${statusTarget?.name}? ${statusTarget?.status === 'active' ? 'They will not be able to log in to the portal.' : 'Their account access will be restored.'}`}
        confirmText={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDanger={statusTarget?.status === 'active'}
      />

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the account of ${deleteTarget?.name} (${deleteTarget?.email})? This action cannot be undone.`}
        confirmText="Delete Account"
        isDanger={true}
      />
    </div>
  );
};

export default EmployeeManagement;
