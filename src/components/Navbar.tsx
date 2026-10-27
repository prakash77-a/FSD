import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  ArrowRightLeft,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  notifications: any[];
  unreadCount: number;
  onRefreshNotifications: () => void;
  onOpenDbStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  notifications,
  unreadCount,
  onRefreshNotifications,
  onOpenDbStatus,
}) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (targetRole: 'admin' | 'user') => {
    setSwitchingRole(true);
    try {
      await quickDemoLogin(targetRole);
      setProfileDropdownOpen(false);
      navigate(targetRole === 'admin' ? '/admin' : '/dashboard');
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleMarkNotificationRead = async (id: string, complaintId?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      onRefreshNotifications();
      setNotifDropdownOpen(false);
      if (complaintId) {
        navigate(`/complaints/${complaintId}`);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      onRefreshNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span>ResolveDesk</span>
          <span>/</span>
          <span className="font-semibold text-gray-900">
            {user?.role === 'admin' ? 'Admin Console' : 'Employee Portal'}
          </span>
        </div>
      </div>

      {/* Right: Role Switcher, Database status pill, Notification bell, User profile */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher helper */}
        <div className="hidden lg:flex items-center bg-gray-100 rounded-md p-0.5 border border-gray-200 text-xs">
          <button
            onClick={() => handleQuickSwitch('user')}
            disabled={switchingRole || user?.role === 'user'}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
              user?.role === 'user'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Switch session to employee user"
          >
            <UserIcon className="h-3 w-3" />
            User Mode
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            disabled={switchingRole || user?.role === 'admin'}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
              user?.role === 'admin'
                ? 'bg-white text-purple-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Switch session to admin user"
          >
            <Shield className="h-3 w-3" />
            Admin Mode
          </button>
        </div>

        {/* Database Status Button */}
        <button
          onClick={onOpenDbStatus}
          className="hidden sm:inline-flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 transition"
          title="View MongoDB & Server Connection Status"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-gray-600">Database:</span>
          <span className="font-semibold text-gray-900">MERN Live</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() =>
                        handleMarkNotificationRead(n._id, n.complaint)
                      }
                      className={`p-3 text-xs cursor-pointer hover:bg-gray-50 transition ${
                        !n.isRead ? 'bg-blue-50/40 font-medium' : 'text-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-gray-900">{n.message}</span>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-800 font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-semibold text-gray-900 leading-tight">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                {user?.role}
              </div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                <span
                  className={`mt-1 inline-block rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Role: {user?.role}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                >
                  <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                  Account Profile
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50"
                  >
                    <Shield className="h-3.5 w-3.5 text-purple-600" />
                    Admin Panel
                  </Link>
                )}
              </div>

              {/* Quick switch inside dropdown */}
              <div className="border-t border-gray-100 px-4 py-2">
                <div className="text-[10px] uppercase font-semibold text-gray-600 mb-1">
                  Demo Switcher
                </div>
                {user?.role === 'admin' ? (
                  <button
                    onClick={() => handleQuickSwitch('user')}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    Switch to User (Sarah)
                  </button>
                ) : (
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    Switch to Admin (Alexander)
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
