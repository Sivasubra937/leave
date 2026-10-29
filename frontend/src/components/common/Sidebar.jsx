import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Clock,
  Calendar,
  Users,
  CheckSquare,
  ShieldCheck,
  Building2,
  Sliders,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  User,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isEmployee, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-md shadow-primary-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              LeaveMS
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-md">
                College
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Student & Faculty Portal</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Employee Navigation */}
          {isEmployee && (
            <div>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Student Portal
              </p>
              <nav className="space-y-1">
                <NavLink to="/dashboard" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/apply-leave" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <CalendarPlus className="h-4 w-4" />
                  Apply Leave
                </NavLink>
                <NavLink to="/my-leaves" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Clock className="h-4 w-4" />
                  My Requests
                </NavLink>
                <NavLink to="/calendar" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" />
                  Leave Calendar
                </NavLink>
                <NavLink to="/holidays" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" />
                  Academic Calendar
                </NavLink>
              </nav>
            </div>
          )}

          {/* Manager Navigation */}
          {isManager && (
            <div>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Faculty Workspace
              </p>
              <nav className="space-y-1">
                <NavLink to="/manager/dashboard" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Faculty Overview
                </NavLink>
                <NavLink to="/manager/requests" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <CheckSquare className="h-4 w-4" />
                  Student Approvals
                </NavLink>
                <NavLink to="/manager/calendar" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" />
                  Academic Calendar
                </NavLink>
                <NavLink to="/manager/team" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Users className="h-4 w-4" />
                  Assigned Students
                </NavLink>
                <NavLink to="/holidays" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" />
                  College Holidays
                </NavLink>
              </nav>

              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-4 mb-2">
                Faculty Leaves
              </p>
              <nav className="space-y-1">
                <NavLink to="/apply-leave" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <CalendarPlus className="h-4 w-4" />
                  Apply Leave
                </NavLink>
                <NavLink to="/my-leaves" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Clock className="h-4 w-4" />
                  My Requests
                </NavLink>
              </nav>
            </div>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Dean & Administration
              </p>
              <nav className="space-y-1">
                <NavLink to="/admin/dashboard" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dean Overview
                </NavLink>
                <NavLink to="/admin/all-leaves" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Briefcase className="h-4 w-4" />
                  All Leave Requests
                </NavLink>
                <NavLink to="/admin/employees" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Users className="h-4 w-4" />
                  Student & Faculty Directory
                </NavLink>
                <NavLink to="/admin/departments" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Building2 className="h-4 w-4" />
                  Academic Departments
                </NavLink>
                <NavLink to="/admin/policies" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Sliders className="h-4 w-4" />
                  Leave Policies
                </NavLink>
                <NavLink to="/admin/reports" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <BarChart3 className="h-4 w-4" />
                  Reports & Analytics
                </NavLink>
                <NavLink to="/admin/audit-logs" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <ShieldCheck className="h-4 w-4" />
                  Audit Trail
                </NavLink>
                <NavLink to="/holidays" className={navItemClass} onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" />
                  Academic Calendar
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {user?.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/profile"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
