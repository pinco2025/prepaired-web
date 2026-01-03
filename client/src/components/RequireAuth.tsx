import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  children: React.ReactElement;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const { user, loading, subscriptionType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for loading to finish
    if (loading) return;

    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    // Check subscription status
    // Default to 'free' if null.
    // Normalized to lowercase in AuthContext.
    const isFree = !subscriptionType || subscriptionType === 'free';
    const isPaymentPage = location.pathname === '/payment';

    if (isFree && !isPaymentPage) {
        // If user is free and trying to access restricted pages (wrapped by RequireAuth), redirect to payment
        navigate('/payment', { replace: true });
    } else if (!isFree && isPaymentPage) {
        // If user is paid and trying to access payment page, redirect to dashboard
        navigate('/dashboard', { replace: true });
    }

  }, [user, loading, subscriptionType, navigate, location]);

  if (loading) {
      // You might want to render a loading spinner here
      return (
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  // If we decided to redirect, render null to avoid flashing content
  if (!user) return null;

  const isFree = !subscriptionType || subscriptionType === 'free';
  const isPaymentPage = location.pathname === '/payment';

  if (isFree && !isPaymentPage) return null;
  if (!isFree && isPaymentPage) return null;

  return children;
};

export default RequireAuth;
