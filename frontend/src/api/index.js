import api from './axios';

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Leaves API
export const leaveApi = {
  apply: (leaveData) => api.post('/leaves/apply', leaveData),
  getMyLeaves: (params) => api.get('/leaves/my-leaves', { params }),
  getLeaveDetails: (id) => api.get(`/leaves/${id}`),
  cancelLeave: (id, data) => api.put(`/leaves/${id}/cancel`, data),
  getTeamLeaves: (params) => api.get('/leaves/team-leaves', { params }),
  reviewLeave: (id, reviewData) => api.put(`/leaves/${id}/review`, reviewData),
  getAllLeaves: (params) => api.get('/leaves/all', { params }),
  getStats: () => api.get('/leaves/stats'),
  getCalendar: (params) => api.get('/leaves/calendar', { params }),
};

// Users API
export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  toggleStatus: (id) => api.put(`/users/${id}/status`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getManagers: () => api.get('/users/managers'),
  getTeamMembers: () => api.get('/users/team-members'),
};

// Departments API
export const departmentApi = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Leave Types API
export const leaveTypeApi = {
  getAll: () => api.get('/leave-types'),
  create: (data) => api.post('/leave-types', data),
  update: (id, data) => api.put(`/leave-types/${id}`, data),
  delete: (id) => api.delete(`/leave-types/${id}`),
  resetBalances: () => api.post('/leave-types/reset-balances'),
};

// Holidays API
export const holidayApi = {
  getAll: (params) => api.get('/holidays', { params }),
  create: (data) => api.post('/holidays', data),
  delete: (id) => api.delete(`/holidays/${id}`),
};

// Notifications API
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

// Reports API
export const reportApi = {
  getAnalytics: () => api.get('/reports/analytics'),
  getLeaveSummary: () => api.get('/reports/leave-summary'),
  getAuditLogs: (params) => api.get('/reports/audit-logs', { params }),
};
