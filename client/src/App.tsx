import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import RequireAuth from './components/RequireAuth';
import ComingSoon from './components/ComingSoon';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminPlaceholder from './components/AdminPlaceholder';
import HomePlaceholder from './components/HomePlaceholder';
import Subjects from './components/Subjects';
import SubjectDetails from './components/SubjectDetails';
import ChapterDetails from './components/ChapterDetails';
import Tests from './components/Tests';
import TestPage from './components/TestPage';
import TestSubmitted from './components/TestSubmitted';
import TestResult from './components/TestResult';
import TestReview from './components/TestReview';
import AppLayout from "./components/AppLayout";
import PaymentPage from './components/PaymentPage';

const RootRoute: React.FC = () => {
  const { user, loading, subscriptionType } = useAuth();
  if (loading) return (
      <div className="flex-grow flex items-center justify-center">
         {/* Simple loading state */}
      </div>
  );
  if (user) {
    if (!subscriptionType || subscriptionType === 'free') {
      return <HomePlaceholder />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <HomePlaceholder />;
};

export const AppContent: React.FC = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/', '/login', '/register', '/payment'];
  const isTestPage = location.pathname.startsWith('/tests/');
  const showHeader = !hideHeaderOnPaths.includes(location.pathname) && !isTestPage;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg -z-10"></div>
      {showHeader && <Sidebar />}
      <main className="flex-1 w-full relative">
        <Routes>
          <Route element={<AppLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/" element={<RootRoute />} />
          <Route
            path="/payment"
            element={
              <RequireAuth>
                <PaymentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects/:subject/:grade/:chapter"
            element={
              <RequireAuth>
                <ChapterDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPlaceholder />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects"
            element={
              <RequireAuth>
                <Subjects />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects/:subject/:grade"
            element={
              <RequireAuth>
                <SubjectDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/tests"
            element={
              <RequireAuth>
                <Tests />
              </RequireAuth>
            }
          />
          <Route
            path="/tests/:testId"
            element={
              <RequireAuth>
                <TestPage />
              </RequireAuth>
            }
          />
          <Route
            path="/coming-soon"
            element={
              <RequireAuth>
                <ComingSoon />
              </RequireAuth>
            }
          />
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
