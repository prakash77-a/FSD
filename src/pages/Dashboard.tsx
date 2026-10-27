import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import api from '../services/api.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import PriorityBadge from '../components/PriorityBadge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardStats {
  total: number;
  Pending: number;
  'In Progress': number;
  Resolved: number;
  Rejected: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/complaints/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentComplaints(res.data.recentComplaints || []);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Error loading dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Submitted',
      count: stats.total,
      icon: FileText,
      color: 'text-gray-900',
      bgColor: 'bg-white',
      border: 'border-gray-200',
      description: 'Lifetime complaints logged',
    },
    {
      title: 'Pending Review',
      count: stats.Pending,
      icon: Clock,
      color: 'text-amber-700',
      bgColor: 'bg-white',
      border: 'border-gray-200',
      description: 'Awaiting administrator action',
    },
    {
      title: 'In Progress',
      count: stats['In Progress'],
      icon: RefreshCw,
      color: 'text-blue-700',
      bgColor: 'bg-white',
      border: 'border-gray-200',
      description: 'Actively being investigated',
    },
    {
      title: 'Resolved',
      count: stats.Resolved,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-white',
      border: 'border-gray-200',
      description: 'Successfully resolved',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>. Track the status and progress of your submitted complaints.
          </p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          Submit New Complaint
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-lg border ${card.border} ${card.bgColor} p-4 shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{card.title}</span>
              <div className="p-1.5 rounded-md bg-gray-50 border border-gray-100">
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-bold tracking-tight ${card.color}`}>
                {loading ? '—' : card.count}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Complaints Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Recent Complaints
            </h2>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              {recentComplaints.length}
            </span>
          </div>
          <Link
            to="/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View all my complaints
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Loading recent complaints...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-2 text-xs font-semibold text-gray-900">
              No complaints submitted yet
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              You haven't filed any complaints. Use the button below to register an issue with facilities, IT, or operations.
            </p>
            <div className="mt-4">
              <Link
                to="/complaints/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Submit First Complaint
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3">Reference #</th>
                  <th scope="col" className="px-5 py-3">Title</th>
                  <th scope="col" className="px-5 py-3">Category</th>
                  <th scope="col" className="px-5 py-3">Priority</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono font-medium text-blue-600">
                      {c.complaintNumber}
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
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Details
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

export default Dashboard;
