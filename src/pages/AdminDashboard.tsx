import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Layers,
  Flag,
} from 'lucide-react';
import api from '../services/api.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import PriorityBadge from '../components/PriorityBadge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message || 'Failed to load administrator metrics.');
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(
        err.response?.data?.message || 'Access denied or failed to load administrator dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    total: 0,
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
  };

  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: FileText,
      color: 'text-gray-900',
      badge: 'All Time',
    },
    {
      title: 'Pending Action',
      value: stats.Pending,
      icon: Clock,
      color: 'text-amber-700',
      badge: 'Action Required',
    },
    {
      title: 'In Progress',
      value: stats['In Progress'],
      icon: RefreshCw,
      color: 'text-blue-700',
      badge: 'Investigating',
    },
    {
      title: 'Resolved',
      value: stats.Resolved,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      badge: 'Completed',
    },
    {
      title: 'Rejected',
      value: stats.Rejected,
      icon: XCircle,
      color: 'text-rose-700',
      badge: 'Closed/Invalid',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Administrator Console
            </h1>
            <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              Staff RBAC Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time organizational complaint triage, resolution rate, and SLA monitoring.
          </p>
        </div>

        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition"
        >
          <ShieldAlert className="h-4 w-4" />
          Manage All Complaints
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-500">{c.title}</span>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {loading ? '—' : c.value}
            </div>
            <span className="mt-1 inline-block text-[10px] text-gray-400">
              {c.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown: Category & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              Complaints by Category
            </h2>
            <span className="text-[11px] text-gray-500">Live Breakdown</span>
          </div>

          <div className="space-y-3">
            {data?.categoryDistribution?.map((cat: any) => {
              const total = stats.total || 1;
              const percent = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{cat.category}</span>
                    <span className="text-gray-500 font-mono">
                      {cat.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-amber-600" />
              Complaints by Severity Priority
            </h2>
            <span className="text-[11px] text-gray-500">Urgency Level</span>
          </div>

          <div className="space-y-3">
            {data?.priorityDistribution?.map((pri: any) => {
              const total = stats.total || 1;
              const percent = Math.round((pri.count / total) * 100);
              const barColor =
                pri.priority === 'High'
                  ? 'bg-rose-500'
                  : pri.priority === 'Medium'
                  ? 'bg-amber-500'
                  : 'bg-slate-400';

              return (
                <div key={pri.priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{pri.priority} Priority</span>
                    <span className="text-gray-500 font-mono">
                      {pri.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Organization-wide Complaints Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Recent Organizational Submissions
            </h2>
          </div>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            Open Full Management Console
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Loading recent records...
          </div>
        ) : !data?.recentComplaints?.length ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No complaints currently recorded in system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3">Reference #</th>
                  <th scope="col" className="px-5 py-3">Employee</th>
                  <th scope="col" className="px-5 py-3">Title</th>
                  <th scope="col" className="px-5 py-3">Category</th>
                  <th scope="col" className="px-5 py-3">Priority</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Assigned</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.recentComplaints.map((c: any) => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono font-medium text-purple-700">
                      {c.complaintNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-900 font-medium">
                      {c.createdByName}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                      {c.category}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                      {c.assignedTo || 'Unassigned'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-purple-600 hover:text-purple-800"
                      >
                        Manage
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
