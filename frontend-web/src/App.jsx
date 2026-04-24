import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apollo-client';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import TestVerification from './pages/TestVerification';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard'
import CommunityPage from './pages/CommunityPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Exam from './pages/Exam';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/test-verify" element={<TestVerification />} />
          <Route path="/exam/:roomId" element={<Exam />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TUTOR']}>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:batchId"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};


export default App;

