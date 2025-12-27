import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import KanbanBoard from './KanbanBoard';
import EquipmentPage from './EquipmentPage';
import NewRequestPage from './NewRequestPage';
import TeamsPage from './TeamsPage';
import ReportsPage from './ReportsPage';
import WorkCentersPage from './WorkCentersPage';
import SettingsPage from './SettingsPage';
import MaintenanceCalendar from './MaintenanceCalendar';
// Simple placeholder so the link doesn't crash the app
const ForgotPassword = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <h2 className="text-xl text-gray-600">Forgot Password Page (Under Construction)</h2>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 2. Protected Dashboard (Only allows access if logged in) */}
        <Route 
          path="/kanban" 
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/equipment" 
          element={
            <div style={{ padding: 0 }}>
               <EquipmentPage />
            </div>
          } 
        />
        <Route 
          path="/maintenance/new" 
          element={
            <ProtectedRoute>
              <NewRequestPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teams" 
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/work-centers" 
          element={
            <ProtectedRoute>
              <WorkCentersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance/calendar" 
          element={
            <ProtectedRoute>
              <MaintenanceCalendar />
            </ProtectedRoute>
          } 
        />

        {/* 3. Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;