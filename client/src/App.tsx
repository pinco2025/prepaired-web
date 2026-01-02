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

const RootRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return (
      <div className="flex-grow flex items-center justify-center">
         {/* Simple loading state */}
      </div>
  );
  return user ? <Navigate to="/dashboard" replace /> : <HomePlaceholder />;
};

export const AppContent: React.FC = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/', '/login', '/register'];
  const isTestPage = location.pathname.startsWith('/tests/');
  const showHeader = !hideHeaderOnPaths.includes(location.pathname) && !isTestPage;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg -z-10"></div>
      {showHeader && <Sidebar />}
      <main className="flex-1 w-full relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/" element={<RootRoute />} />
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
          <Route path="/coming-soon" element={<ComingSoon />} />
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
