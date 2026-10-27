import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ArrowRight, FolderOpen, AlertCircle } from 'lucide-react';
import api from '../services/api.ts';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError('Could not load notifications at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }

    if (n.complaint) {
      navigate(`/complaints/${n.complaint}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Activity Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            System notices regarding ticket submissions, status updates, and resolutions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-2 text-xs font-semibold text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              You will receive updates here whenever the status of your complaints changes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition ${
                  !n.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      !n.isRead
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs ${
                          !n.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'
                        }`}
                      >
                        {n.message}
                      </p>
                      {!n.isRead && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.complaintNumber && (
                        <span className="font-mono text-gray-500">
                          Ref: {n.complaintNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-gray-400 group-hover:text-gray-700">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
