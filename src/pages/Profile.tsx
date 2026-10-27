import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const Profile: React.FC = () => {
  const { user, updateUserContext } = useAuth();

  // Name form state
  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);

    if (!name.trim()) {
      setNameMessage({ type: 'error', text: 'Name cannot be blank.' });
      return;
    }

    setNameLoading(true);
    try {
      const res = await api.patch('/users/profile', { name: name.trim() });
      if (res.data.success) {
        updateUserContext({ name: name.trim() });
        setNameMessage({ type: 'success', text: 'Profile name successfully updated.' });
      }
    } catch (err: any) {
      setNameMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update name.',
      });
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Please fill in both current and new passwords.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setPasswordMessage({
          type: 'success',
          text: 'Password updated successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          User Account Profile
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your personal details, review role permissions, and modify your security credentials.
        </p>
      </div>

      {/* Account Info Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg uppercase shadow-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">{user?.name}</h2>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>
                Account Registered:{' '}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update Name Form */}
      <form
        onSubmit={handleUpdateName}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4 text-xs"
      >
        <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-600" />
            Personal Details
          </h3>
        </div>

        {nameMessage && (
          <div
            className={`rounded-md p-2.5 text-xs flex items-center gap-2 ${
              nameMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {nameMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{nameMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Email Address (Read Only)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={nameLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            <Save className="h-3.5 w-3.5" />
            {nameLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4 text-xs"
      >
        <div className="border-b border-gray-100 pb-2">
          <h3 className="font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Key className="h-4 w-4 text-blue-600" />
            Security & Password
          </h3>
        </div>

        {passwordMessage && (
          <div
            className={`rounded-md p-2.5 text-xs flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            <Key className="h-3.5 w-3.5" />
            {passwordLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
