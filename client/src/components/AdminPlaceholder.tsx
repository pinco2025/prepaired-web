import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPlaceholder: React.FC = () => {
  const { subscriptionType, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (subscriptionType !== 'admin') {
        // redirect non-admins to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [subscriptionType, loading, navigate]);

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Admin Panel (Placeholder)</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            This is a placeholder admin route. You'll add admin-specific UI here later.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AdminPlaceholder;
