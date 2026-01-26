import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import RequireAuth from './components/RequireAuth';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ComingSoon from './components/ComingSoon';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import AdminPlaceholder from './components/AdminPlaceholder';
import LandingPage from './components/LandingPage';
import ChapterDetails from './components/ChapterDetails';
import Tests from './components/Tests';
import TestPage from './components/TestPage';
import TestSubmitted from './components/TestSubmitted';
import TestResult from './components/TestResult';
import TestReview from './components/TestReview';
import Super30 from './components/Super30';
import AppLayout from "./components/AppLayout";

/**
 * HomeRoute - Handles the root "/" route
 * 
 * Access Rules:
 * - Loading → Show spinner
 * - Not authenticated → Show landing page
 * - Authenticated + free tier → Show landing page
 * - Authenticated + paid tier → Redirect to /dashboard
 */
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isPaidUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Paid users get redirected to dashboard
  if (isAuthenticated && isPaidUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Free users get redirected to super30
  if (isAuthenticated && !isPaidUser) {
    return <Navigate to="/super30" replace />;
  }

  // Everyone else sees the landing page
  return <LandingPage />;
};

export const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check if user is on a test-taking route (hide sidebar during test)
  // Matches /tests/:testId but not /tests (the list page)
  const isTestRoute = /^\/tests\/[^/]+$/.test(location.pathname);

  // Also hide sidebar on the test-submitted page
  const isTestSubmittedRoute = location.pathname === '/test-submitted';

  // Determine if we should show the sidebar
  // Show sidebar for all authenticated users on protected routes
  // Hide sidebar when user is taking a test or on submission page
  const showSidebar = !loading && isAuthenticated && !isTestRoute && !isTestSubmittedRoute;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>
      {showSidebar && <Sidebar />}
      <main className="flex-1 w-full relative">
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public routes */}
            <Route path="/" element={<HomeRoute />} />

            {/* Auth routes - only for non-paid users */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/register" element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            } />

            {/* Protected routes - require IPFT-01-2026 subscription */}
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            <Route path="/subjects/:subject/:grade/:chapter" element={
              <RequireAuth>
                <ChapterDetails />
              </RequireAuth>
            } />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminPlaceholder />
              </RequireAuth>
            } />
            <Route path="/subjects" element={
              <RequireAuth>
                <ComingSoon />
              </RequireAuth>
            } />
            <Route path="/subjects/:subject/:grade" element={
              <RequireAuth>
                <ComingSoon />
              </RequireAuth>
            } />
            <Route path="/tests" element={
              <RequireAuth>
                <Tests />
              </RequireAuth>
            } />
            <Route path="/tests/:testId" element={
              <RequireAuth>
                <TestPage />
              </RequireAuth>
            } />
            <Route path="/super30" element={
              <RequireAuth allowFree>
                <Super30 />
              </RequireAuth>
            } />
            <Route path="/coming-soon" element={
              <RequireAuth allowFree>
                <ComingSoon />
              </RequireAuth>
            } />
            <Route path="/test-submitted" element={
              <RequireAuth>
                <TestSubmitted />
              </RequireAuth>
            } />
            <Route path="/results/:submissionId" element={
              <RequireAuth>
                <TestResult />
              </RequireAuth>
            } />
            <Route path="/review/:submissionId" element={
              <RequireAuth>
                <TestReview />
              </RequireAuth>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <DataCacheProvider>
          <AppContent />
        </DataCacheProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
