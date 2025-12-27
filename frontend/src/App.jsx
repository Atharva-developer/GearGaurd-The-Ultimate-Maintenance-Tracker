import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import KanbanBoard from './KanbanBoard';

// A simple placeholder for Forgot Password
const ForgotPassword = () => <h2 style={{textAlign:'center', marginTop: 50}}>Forgot Password Page (Under Construction)</h2>;

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if logged in

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Route: Dashboard */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? (
            <div style={{ padding: 20 }}>
               <h1>Welcome, {localStorage.getItem('user')}</h1>
               <KanbanBoard />
            </div>
          ) : (
            <Navigate to="/login" />
          )} 
        />
      </Routes>
    </Router>
  );
}

export default App;