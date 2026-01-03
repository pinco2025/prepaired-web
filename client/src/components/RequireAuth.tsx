import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  children: React.ReactElement;
};

/**
 * RequireAuth - Protects routes that require PAID subscription (IPFT-01-2026)
 * 
 * Access Rules:
 * - Not authenticated → Redirect to /login
 * - Authenticated + loading → Show spinner
 * - Authenticated + free tier → Redirect to /
 * - Authenticated + paid tier → Allow access
 */
const RequireAuth: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isPaidUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in → redirect to login, save intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but free tier → redirect to home
  if (!isPaidUser) {
    return <Navigate to="/" replace />;
  }

  // Paid user → allow access
  return children;
};

export default RequireAuth;
