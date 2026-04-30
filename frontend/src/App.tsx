import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import HeroPage from './pages/Auth/Hero';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import ApplicantDashboard from './pages/Applicant/Dashboard';
import ComplianceDashboard from './pages/Compliance/Dashboard';
import RegulatorDashboard from './pages/Regulator/Dashboard';
import TermsAndConditions from './pages/Legal/Terms';

import { useAppContext } from './context/AppContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { token, role } = useAppContext();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HeroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      
      {/* Dashboards */}
      <Route path="/dashboard/applicant" element={
        <ProtectedRoute allowedRoles={['applicant']}>
          <DashboardLayout><ApplicantDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/compliance" element={
        <ProtectedRoute allowedRoles={['compliance']}>
          <DashboardLayout><ComplianceDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/regulator" element={
        <ProtectedRoute allowedRoles={['regulator']}>
          <DashboardLayout><RegulatorDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
