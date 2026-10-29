import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type, message) => {
    if (message.includes('Approved') || message.includes('approved')) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
    if (message.includes('Rejected') || message.includes('rejected')) {
      return <XCircle className="h-4 w-4 text-rose-500" />;
    }
    return <FileText className="h-4 w-4 text-primary-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 z-50 border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-xs flex-shrink-0">
                    {getIcon(n.type, n.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
