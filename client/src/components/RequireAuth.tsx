import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JEELoader from './JEELoader';
import ComingSoon from './ComingSoon';

type Props = {
  children: React.ReactElement;
  allowFree?: boolean;
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
const RequireAuth: React.FC<Props> = ({ children, allowFree = false }) => {
  const { isAuthenticated, isPaidUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return <JEELoader message="Verifying access..." />;
  }

  // Not logged in → redirect to login, save intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but free tier
  if (!isPaidUser) {
    // If route allows free users, let them in
    if (allowFree) {
      return children;
    }
    // Otherwise show Coming Soon instead of redirecting to home
    // This allows them to stay on the route but see the restricted message
    return <ComingSoon />;
  }

  // Paid user → allow access
  return children;
};

export default RequireAuth;
