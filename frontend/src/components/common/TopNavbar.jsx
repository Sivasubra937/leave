import React, { useState, useEffect } from 'react';
import { Menu, Search, Calendar as CalendarIcon, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const TopNavbar = ({ onOpenSidebar, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight sm:text-xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize shadow-2xs shadow-slate-100">
          <Shield className="h-3 w-3 text-slate-400" />
          <span className="text-slate-600">
            {user?.role === 'employee' ? 'Student Mode' : user?.role === 'manager' ? 'Faculty Mode' : 'Dean / Admin Mode'}
          </span>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{user?.employeeId || user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
