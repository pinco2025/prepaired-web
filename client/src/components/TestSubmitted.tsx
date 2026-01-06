import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';

const TestSubmitted: React.FC = () => {
  usePageTitle('Test Submitted');
  const location = useLocation();
  const navigate = useNavigate();
  const submissionId = location.state?.submissionId;
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleViewResult = async () => {
    if (!submissionId) {
      navigate('/dashboard');
      return;
    }

    setChecking(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('student_tests')
        .select('result_url')
        .eq('id', submissionId)
        .single();

      if (error) {
        throw error;
      }

      if (data && data.result_url) {
        navigate(`/results/${submissionId}`);
      } else {
        setMessage("Your result is being calculated, please wait for a couple of minutes.");
      }
    } catch (e) {
      console.error("Error checking result status:", e);
      setMessage("An error occurred while checking the result. Please try again later.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-lg text-center bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark translate-y-[-40px]">
        <div className="mb-6">
          <span className="material-icons-outlined text-green-500" style={{ fontSize: "80px" }}>check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">Thank You!</h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8">Your test has been successfully submitted.</p>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-primary bg-primary/10 border-2 border-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-icons-outlined">dashboard</span>
            Go to Dashboard
          </Link>

          {submissionId ? (
            <button
              onClick={handleViewResult}
              disabled={checking}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {checking ? (
                <>
                  <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                  Checking...
                </>
              ) : (
                <>
                  <span className="material-icons-outlined">bar_chart</span>
                  View Result
                </>
              )}
            </button>
          ) : (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
            >
              <span className="material-icons-outlined">bar_chart</span>
              View Result
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSubmitted;
