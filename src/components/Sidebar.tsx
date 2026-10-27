import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  Shield,
  ShieldAlert,
  X,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount?: number;
  onOpenDbStatus: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  unreadCount = 0,
  onOpenDbStatus,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', path: '/complaints', icon: FileText },
    { name: 'Submit Complaint', path: '/complaints/new', icon: PlusCircle },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: Shield },
    { name: 'Manage Complaints', path: '/admin/complaints', icon: ShieldAlert },
  ];

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const content = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-gray-200">
      <div>
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm shadow-xs">
              RD
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight block leading-tight">
                ResolveDesk
              </span>
              <span className="text-[10px] text-gray-500 font-normal">
                Enterprise Complaint Portal
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onCloseMobile}
              className={linkClasses}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge !== undefined && (
                <span className="inline-flex items-center rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Admin Panel Section - visible ONLY to administrators */}
          {isAdmin && (
            <div className="pt-4 space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <span>Administration</span>
                <span className="bg-purple-100 text-purple-800 text-[9px] px-1 rounded font-bold">
                  ADMIN
                </span>
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onCloseMobile}
                  className={linkClasses}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-purple-600" />
                  <span className="flex-1">{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Database connection status badge at bottom */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        <button
          onClick={onOpenDbStatus}
          className="w-full text-left rounded-md border border-gray-200 bg-white p-2 text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
        >
          <Database className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <div className="truncate flex-1">
            <div className="font-semibold text-gray-900 leading-tight">MongoDB Engine</div>
            <div className="text-[10px] text-emerald-700 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected & Healthy
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
