import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

import DashboardPage from '../pages/DashboardPage';
import EmployeesPage from '../pages/EmployeesPage';
import EmployeeDetailsPage from '../pages/EmployeeDetailsPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import RolesPage from '../pages/RolesPage';
import AttendancePage from '../pages/AttendancePage';
import MyAttendancePage from '../pages/MyAttendancePage';
import SalariesPage from '../pages/SalariesPage';
import MySalariesPage from '../pages/MySalariesPage';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../hooks/useAuth';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root Redirection */}
      <Route
        path="/"
        element={
          loading ? null : isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Protected Routes wrapped in MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Role-based protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_HR']} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/salaries" element={<SalariesPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/roles" element={<RolesPage />} />
          </Route>

          {/* Self-service / General Protected Routes */}
          <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
          <Route path="/my-attendance" element={<MyAttendancePage />} />
          <Route path="/my-salaries" element={<MySalariesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
