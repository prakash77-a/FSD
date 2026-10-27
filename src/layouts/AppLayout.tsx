import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';
import Navbar from '../components/Navbar.tsx';
import DatabaseStatusModal from '../components/DatabaseStatusModal.tsx';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll for updates
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        unreadCount={unreadCount}
        onOpenDbStatus={() => setDbModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-60 min-w-0">
        <Navbar
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onRefreshNotifications={fetchNotifications}
          onOpenDbStatus={() => setDbModalOpen(true)}
        />

        {/* Content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Database connection details modal */}
      <DatabaseStatusModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
