import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Filter,
  ArrowUpDown,
  ArrowRight,
  FolderOpen,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import PriorityBadge from '../components/PriorityBadge.tsx';
import Pagination from '../components/Pagination.tsx';

const CATEGORIES = [
  'All',
  'Infrastructure',
  'Technical Issue',
  'Maintenance',
  'Staff or Service',
  'Billing',
  'Other',
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

export const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [page, status, category, priority, sort]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sort,
      };
      if (status !== 'All') params.status = status;
      if (category !== 'All') params.category = category;
      if (priority !== 'All') params.priority = priority;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/complaints/my', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setCategory('All');
    setPriority('All');
    setSort('newest');
    setPage(1);
  };

  const isFiltered =
    search.trim() !== '' ||
    status !== 'All' ||
    category !== 'All' ||
    priority !== 'All' ||
    sort !== 'newest';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View all tickets filed under your account, search history, and inspect ongoing resolution notes.
          </p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          Submit Complaint
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center h-full w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint # (e.g. CMP-2026-1001) or title keywords..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as 'newest' | 'oldest');
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {isFiltered && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Complaints Table Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Loading your complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-2 text-xs font-semibold text-gray-900">
              {isFiltered ? 'No matching complaints found' : 'No complaints recorded'}
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              {isFiltered
                ? 'Try adjusting your search criteria or clearing selected filters.'
                : 'You have not submitted any complaints yet.'}
            </p>
            {isFiltered ? (
              <button
                onClick={handleResetFilters}
                className="mt-4 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            ) : (
              <div className="mt-4">
                <Link
                  to="/complaints/new"
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Submit New Complaint
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th scope="col" className="px-5 py-3">Complaint #</th>
                    <th scope="col" className="px-5 py-3">Title</th>
                    <th scope="col" className="px-5 py-3">Category</th>
                    <th scope="col" className="px-5 py-3">Priority</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3">Assigned To</th>
                    <th scope="col" className="px-5 py-3">Submitted</th>
                    <th scope="col" className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {complaints.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
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
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                        {c.assignedTo || 'Unassigned'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <Link
                          to={`/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
