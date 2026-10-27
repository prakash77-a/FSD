import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Layers,
  Flag,
  User,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  UserCheck,
  Lock,
} from 'lucide-react';
import api from '../services/api.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import PriorityBadge from '../components/PriorityBadge.tsx';
import Timeline from '../components/Timeline.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const DEPARTMENTS = [
  'IT Operations',
  'Facilities & Maintenance',
  'AV Support Team',
  'Finance & Accounts',
  'Human Resources',
  'Corporate Security',
  'Admin Services',
];

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [complaint, setComplaint] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState(
    searchParams.get('created') ? 'Complaint has been registered successfully.' : ''
  );

  // Admin action controls
  const [actionStatus, setActionStatus] = useState<string>('');
  const [assignedDept, setAssignedDept] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setActivities(res.data.activities || []);
        setActionStatus(res.data.complaint.status);
        setAssignedDept(res.data.complaint.assignedTo || 'Unassigned');
      } else {
        setError(res.data.message || 'Complaint not found.');
      }
    } catch (err: any) {
      console.error('Fetch complaint error:', err);
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    if ((actionStatus === 'Resolved' || actionStatus === 'Rejected') && !resolutionNotes.trim()) {
      setActionError(`Resolution notes are required when marking a complaint as ${actionStatus}.`);
      return;
    }

    setUpdating(true);
    try {
      const res = await api.patch(`/admin/complaints/${id}/status`, {
        status: actionStatus,
        resolutionNotes: resolutionNotes.trim(),
      });

      if (res.data.success) {
        setSuccessBanner(`Complaint status successfully updated to ${actionStatus}.`);
        fetchComplaint();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!assignedDept.trim()) return;
    setActionError('');
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/complaints/${id}/assign`, {
        assignedTo: assignedDept.trim(),
      });
      if (res.data.success) {
        setSuccessBanner(`Complaint assigned to ${assignedDept}.`);
        fetchComplaint();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;
    setActionError('');
    setUpdating(true);
    try {
      const res = await api.post(`/admin/complaints/${id}/internal-note`, {
        internalNotes: internalNote.trim(),
      });
      if (res.data.success) {
        setInternalNote('');
        setSuccessBanner('Internal note recorded.');
        fetchComplaint();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add internal note.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-500">
        Loading complaint record...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
          <AlertCircle className="h-5 w-5 mx-auto mb-2 text-rose-500" />
          {error || 'The requested complaint could not be found.'}
        </div>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <Link
          to={isAdmin ? '/admin/complaints' : '/complaints'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isAdmin ? 'Back to All Complaints' : 'Back to My Complaints'}
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ref:</span>
          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {complaint.complaintNumber}
          </span>
        </div>
      </div>

      {successBanner && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Left Details & Right Timeline + Admin Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Header & Description Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                  Complaint Details
                </span>
                <h1 className="text-base font-bold text-gray-900 leading-snug">
                  {complaint.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50/70 p-3 rounded-md border border-gray-100">
              <div>
                <span className="text-gray-600 block text-[11px] font-semibold">Category</span>
                <span className="font-medium text-gray-900 mt-0.5 block">{complaint.category}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[11px] font-semibold">Location / Dept</span>
                <span className="font-medium text-gray-900 mt-0.5 block">
                  {complaint.locationOrDepartment || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block text-[11px] font-semibold">Submitted Date</span>
                <span className="font-medium text-gray-900 mt-0.5 block">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block text-[11px] font-semibold">Assigned To</span>
                <span className="font-medium text-gray-900 mt-0.5 block">
                  {complaint.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Submitter info for admin */}
            {isAdmin && (
              <div className="rounded-md border border-purple-100 bg-purple-50/40 p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">Submitted by:</span>
                  <span className="font-semibold text-gray-900">{complaint.createdByName}</span>
                  <span className="text-gray-500 font-mono">({complaint.createdByEmail})</span>
                </div>
              </div>
            )}

            {/* Description Body */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Description of Issue
              </h2>
              <div className="rounded-md border border-gray-200 bg-white p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>

            {/* Resolution Notes Box (if resolved/rejected) */}
            {complaint.resolutionNotes && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Resolution & Outcome Notes
                </div>
                <p className="text-emerald-950 whitespace-pre-wrap leading-relaxed pt-1">
                  {complaint.resolutionNotes}
                </p>
                {complaint.resolvedAt && (
                  <p className="text-[10px] text-emerald-700 pt-1">
                    Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Internal Notes Box (only visible to admin) */}
            {isAdmin && complaint.internalNotes && (
              <div className="rounded-md border border-amber-200 bg-amber-50/40 p-4 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Lock className="h-3.5 w-3.5 text-amber-700" />
                  Internal Administrative Notes (Staff Only)
                </div>
                <p className="text-amber-950 whitespace-pre-wrap leading-relaxed">
                  {complaint.internalNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Admin Action Console */}
        <div className="space-y-6">
          {/* Admin Control Panel (Only if logged in user is admin) */}
          {isAdmin ? (
            <div className="rounded-lg border border-purple-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Admin Action Panel
                  </h2>
                </div>
                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                  ADMIN ONLY
                </span>
              </div>

              {actionError && (
                <div className="rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Change Status
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {(actionStatus === 'Resolved' || actionStatus === 'Rejected') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Resolution Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Explain action taken or rationale for closing ticket..."
                      className="w-full rounded-md border border-gray-300 p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full rounded-md bg-purple-600 py-1.5 px-3 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </form>

              {/* Assign to Department */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="block text-[11px] font-semibold text-gray-700">
                  Assign Department
                </label>
                <div className="flex gap-2">
                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={updating}
                    className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="block text-[11px] font-semibold text-gray-700">
                  Add Internal Note
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Private note for administration staff..."
                  className="w-full rounded-md border border-gray-300 p-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddInternalNote}
                  disabled={updating || !internalNote.trim()}
                  className="w-full rounded-md border border-gray-300 bg-white py-1.5 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Internal Note
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs text-xs text-gray-600">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 mb-1">
                <Lock className="h-3.5 w-3.5 text-gray-500" />
                Read-Only Access
              </div>
              <p className="text-gray-500 text-[11px]">
                As a standard user, your complaint details and resolution history are visible here. Only assigned administrators can update status or append resolution logs.
              </p>
            </div>
          )}

          {/* Activity Timeline Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                Activity Timeline
              </h2>
              <span className="text-[11px] text-gray-400 font-mono">
                {activities.length} events
              </span>
            </div>

            <Timeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
