/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import AppLayout from './layouts/AppLayout.tsx';

// Pages
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import SubmitComplaint from './pages/SubmitComplaint.tsx';
import MyComplaints from './pages/MyComplaints.tsx';
import ComplaintDetails from './pages/ComplaintDetails.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminComplaints from './pages/AdminComplaints.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import Profile from './pages/Profile.tsx';
import NotFound from './pages/NotFound.tsx';

// Protected Route Guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs text-gray-500 font-medium">
        Authenticating enterprise session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin-Only Route Guard
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs text-gray-500 font-medium">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Redirect if already logged in
function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            }
          />

          {/* Authenticated Application Routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/new" element={<SubmitComplaint />} />
            <Route path="complaints/:id" element={<ComplaintDetails />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<Profile />} />

            {/* Admin-only Routes */}
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="admin/complaints"
              element={
                <RequireAdmin>
                  <AdminComplaints />
                </RequireAdmin>
              }
            />

            {/* Nested 404 inside layout */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Standalone 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
