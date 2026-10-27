import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRight,
  Shield,
  RotateCcw,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  X,
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

const DEPARTMENTS = [
  'IT Operations',
  'Facilities & Maintenance',
  'AV Support Team',
  'Finance & Accounts',
  'Human Resources',
  'Corporate Security',
  'Admin Services',
];

export const AdminComplaints: React.FC = () => {
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

  // Quick Action Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalAssigned, setModalAssigned] = useState('');
  const [modalResolution, setModalResolution] = useState('');
  const [modalInternalNote, setModalInternalNote] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

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

      const res = await api.get('/admin/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
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

  const openActionModal = (c: any) => {
    setSelectedComplaint(c);
    setModalStatus(c.status);
    setModalAssigned(c.assignedTo || 'Unassigned');
    setModalResolution(c.resolutionNotes || '');
    setModalInternalNote(c.internalNotes || '');
    setModalError('');
    setModalSuccess('');
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setModalError('');
    setModalSuccess('');

    if (
      (modalStatus === 'Resolved' || modalStatus === 'Rejected') &&
      !modalResolution.trim()
    ) {
      setModalError(
        `Resolution notes are required when marking a complaint as ${modalStatus}.`
      );
      return;
    }

    setModalLoading(true);
    try {
      const id = selectedComplaint._id;

      // Update status & resolution
      if (
        modalStatus !== selectedComplaint.status ||
        modalResolution !== (selectedComplaint.resolutionNotes || '')
      ) {
        await api.patch(`/admin/complaints/${id}/status`, {
          status: modalStatus,
          resolutionNotes: modalResolution.trim(),
        });
      }

      // Update assignment
      if (modalAssigned !== (selectedComplaint.assignedTo || 'Unassigned')) {
        await api.patch(`/admin/complaints/${id}/assign`, {
          assignedTo: modalAssigned,
        });
      }

      // Update internal note
      if (
        modalInternalNote.trim() &&
        modalInternalNote !== (selectedComplaint.internalNotes || '')
      ) {
        await api.post(`/admin/complaints/${id}/internal-note`, {
          internalNotes: modalInternalNote.trim(),
        });
      }

      setModalSuccess('Complaint successfully updated!');
      fetchComplaints();
      setTimeout(() => {
        setSelectedComplaint(null);
      }, 1200);
    } catch (err: any) {
      console.error('Admin update failure:', err);
      setModalError(err.response?.data?.message || 'Failed to apply update.');
    } finally {
      setModalLoading(false);
    }
  };

  const isFiltered =
    search.trim() !== '' ||
    status !== 'All' ||
    category !== 'All' ||
    priority !== 'All' ||
    sort !== 'newest';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Enterprise Complaint Console
            </h1>
            <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage, reassign, add resolution outcomes, and close complaints submitted across the organization.
          </p>
        </div>
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
              placeholder="Search by Complaint #, employee name, or title keywords..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
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
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
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
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
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
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
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
              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
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

      {/* Main Complaints Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Querying MongoDB complaints database...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-gray-500">
            No complaints found matching current criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th scope="col" className="px-5 py-3">Reference #</th>
                    <th scope="col" className="px-5 py-3">Submitted By</th>
                    <th scope="col" className="px-5 py-3">Title</th>
                    <th scope="col" className="px-5 py-3">Category</th>
                    <th scope="col" className="px-5 py-3">Priority</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3">Assigned To</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {complaints.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono font-medium text-purple-700">
                        {c.complaintNumber}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="font-medium text-gray-900">{c.createdByName}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">
                          {c.createdByEmail}
                        </div>
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
                      <td className="whitespace-nowrap px-5 py-3.5 text-gray-600 font-medium">
                        {c.assignedTo || 'Unassigned'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openActionModal(c)}
                          className="inline-flex items-center gap-1 rounded border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                        >
                          <Edit3 className="h-3 w-3" />
                          Update
                        </button>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900 transition"
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

      {/* Quick Action Modal for Admin */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Update Complaint: {selectedComplaint.complaintNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  {modalSuccess}
                </div>
              )}

              <div>
                <span className="block font-semibold text-gray-700 mb-0.5">Subject</span>
                <p className="text-gray-900 font-medium">{selectedComplaint.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={modalAssigned}
                    onChange={(e) => setModalAssigned(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(modalStatus === 'Resolved' || modalStatus === 'Rejected') && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Resolution / Outcome Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={modalResolution}
                    onChange={(e) => setModalResolution(e.target.value)}
                    placeholder="Provide details on how the issue was fixed or reason for rejection..."
                    className="w-full rounded-md border border-gray-300 p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Internal Staff Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={modalInternalNote}
                  onChange={(e) => setModalInternalNote(e.target.value)}
                  placeholder="Private administrative notes..."
                  className="w-full rounded-md border border-gray-300 p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-md bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {modalLoading ? 'Saving...' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
