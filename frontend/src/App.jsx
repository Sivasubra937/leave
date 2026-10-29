import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import EmployeeCalendarPage from './pages/employee/EmployeeCalendarPage';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamRequests from './pages/manager/TeamRequests';
import TeamCalendarPage from './pages/manager/TeamCalendarPage';
import TeamMembers from './pages/manager/TeamMembers';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllLeaveRequests from './pages/admin/AllLeaveRequests';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import LeavePolicySettings from './pages/admin/LeavePolicySettings';
import ReportsPage from './pages/admin/ReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Shared Pages & Wrapper
import ProfilePage from './pages/shared/ProfilePage';
import HolidaysPage from './pages/shared/HolidaysPage';
import NotFound from './pages/shared/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';

// Root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Employee & Shared Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['employee', 'manager', 'admin']}
              pageTitle="Leave Portal"
            />
          }
        >
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/apply-leave" element={<ApplyLeave />} />
          <Route path="/my-leaves" element={<MyLeaves />} />
          <Route path="/calendar" element={<EmployeeCalendarPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/holidays" element={<HolidaysPage />} />
        </Route>

        {/* Manager Workspace Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['manager', 'admin']}
              pageTitle="Manager Workspace"
            />
          }
        >
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/requests" element={<TeamRequests />} />
          <Route path="/manager/calendar" element={<TeamCalendarPage />} />
          <Route path="/manager/team" element={<TeamMembers />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              pageTitle="Administration Portal"
            />
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/all-leaves" element={<AllLeaveRequests />} />
          <Route path="/admin/employees" element={<EmployeeManagement />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/policies" element={<LeavePolicySettings />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
