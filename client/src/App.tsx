import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import RequireAuth from './components/RequireAuth';
import ComingSoon from './components/ComingSoon';
import { AuthProvider } from './contexts/AuthContext';
import AdminPlaceholder from './components/AdminPlaceholder';
import HomePlaceholder from './components/HomePlaceholder';
import Subjects from './components/Subjects';

const AppContent: React.FC = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/login', '/register'];
  const showHeader = !hideHeaderOnPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>
      {showHeader && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/" element={<HomePlaceholder />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
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
        <Route path="/coming-soon" element={<ComingSoon />} />
      </Routes>
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
