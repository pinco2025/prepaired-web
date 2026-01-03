import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Props = {
    children: React.ReactElement;
};

/**
 * PublicOnlyRoute - For routes that should NOT be accessible to paid users
 * Used for: /login, /register
 * 
 * Access Rules:
 * - Loading → Show spinner
 * - Not authenticated → Allow access
 * - Authenticated + free tier → Allow access (they need to see login/register to upgrade)
 * - Authenticated + paid tier → Redirect to /dashboard
 */
const PublicOnlyRoute: React.FC<Props> = ({ children }) => {
    const { isAuthenticated, isPaidUser, loading } = useAuth();

    // Show loading spinner while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Paid users should not access public-only routes
    if (isAuthenticated && isPaidUser) {
        return <Navigate to="/dashboard" replace />;
    }

    // Everyone else can access
    return children;
};

export default PublicOnlyRoute;
