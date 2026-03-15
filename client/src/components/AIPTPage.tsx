import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Test } from '../data';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDataCache } from '../contexts/DataCacheContext';
import JEELoader from './JEELoader';
import JEEMInstructions from './JEEMInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';

type TestStatus = 'instructions' | 'inProgress' | 'submitted';

// AIPT-01 unlock time: 15 March 2026, 3:00 PM IST (UTC+5:30 = 9:30 AM UTC)
// TODO: Re-enable time lock before production launch
// const AIPT_UNLOCK_TIME = new Date('2026-03-15T09:30:00Z');
const AIPT_UNLOCK_TIME = new Date('2020-01-01T00:00:00Z'); // Disabled for testing

const AIPTPage: React.FC = () => {
  usePageTitle('AIPT');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { invalidateCache } = useDataCache();
  const [test, setTest] = useState<Test | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('instructions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const isUnlocked = now >= AIPT_UNLOCK_TIME;

  // Update time every second for the countdown
  useEffect(() => {
    if (isUnlocked) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isUnlocked]);

  useEffect(() => {
    let mounted = true;

    const fetchAIPTTest = async () => {
      try {
        // Fetch the AIPT-01 test from the database
        // Try exact match first, then fuzzy match
        let { data: testsArr, error: testError } = await supabase
          .from('tests')
          .select('*')
          .ilike('title', '%AIPT%')
          .limit(1);

        if (!mounted) return;

        if (testError || !testsArr || testsArr.length === 0) {
          // Fallback: fetch all tests and find AIPT by scanning titles
          const { data: allTests } = await supabase
            .from('tests')
            .select('*')
            .order('testID', { ascending: false });

          if (!mounted) return;

          const aiptTest = allTests?.find((t: any) =>
            t.title?.toLowerCase().includes('aipt') ||
            t.description?.toLowerCase().includes('aipt')
          );

          if (!aiptTest) {
            setError('AIPT test not found. Please ensure the test has been added to the database.');
            setIsLoading(false);
            return;
          }

          testsArr = [aiptTest];
        }

        const testData = testsArr[0];
        setTest(testData as Test);

        // Check if the user has already attempted this test
        if (user?.id && testData.testID) {
          const { data: submissions } = await supabase
            .from('student_tests')
            .select('id, result_url')
            .eq('user_id', user.id)
            .eq('test_id', String(testData.testID))
            .not('submitted_at', 'is', null)
            .limit(1);

          if (!mounted) return;

          if (submissions && submissions.length > 0) {
            // Redirect to results directly (same pattern as TestPage)
            navigate(`/results/${submissions[0].id}`, { replace: true });
            return;
          }
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load AIPT test.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAIPTTest();

    return () => {
      mounted = false;
    };
  }, [user?.id, navigate]);

  // Handle back button during test
  useEffect(() => {
    const handlePopState = () => {
      setTestStatus('instructions');
    };

    if (testStatus === 'inProgress' || testStatus === 'submitted') {
      window.history.pushState({ status: testStatus }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testStatus]);

  if (isLoading) {
    return (
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <JEELoader variant="compact" message="Loading AIPT..." />
          </div>
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <span className="material-icons-outlined text-red-500 text-5xl mb-4">error_outline</span>
            <p className="text-red-500 text-lg font-medium mb-4">{error || 'Test not found.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleStartTest = () => {
    setTestStatus('inProgress');
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  const handleSubmitSuccess = () => {
    invalidateCache('all');
    setTestStatus('submitted');
  };

  const isTestInProgress = testStatus === 'inProgress';

  const renderContent = () => {
    switch (testStatus) {
      case 'inProgress':
        return <TestInterface test={test} onSubmitSuccess={handleSubmitSuccess} exam={test.exam} />;
      case 'submitted':
        return <TestSubmitted />;
      case 'instructions':
      default:
        if (!isUnlocked) {
          const diff = AIPT_UNLOCK_TIME.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const countdownFooter = (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 min-w-[72px]">
                  <span className="text-2xl font-black text-primary">{String(hours).padStart(2, '0')}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Hours</span>
                </div>
                <span className="text-2xl font-bold text-text-secondary-light dark:text-text-secondary-dark">:</span>
                <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 min-w-[72px]">
                  <span className="text-2xl font-black text-primary">{String(minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Minutes</span>
                </div>
                <span className="text-2xl font-bold text-text-secondary-light dark:text-text-secondary-dark">:</span>
                <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 min-w-[72px]">
                  <span className="text-2xl font-black text-primary">{String(seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Seconds</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Test unlocks on 15th March, 3:00 PM IST
              </p>
            </div>
          );

          return <JEEMInstructions test={test} onStartTest={handleStartTest} footerOverride={countdownFooter} />;
        }
        return <JEEMInstructions test={test} onStartTest={handleStartTest} />;
    }
  };

  return (
    <main className={`flex-grow ${isTestInProgress ? 'h-screen overflow-hidden' : ''}`}>
      <div className={isTestInProgress
        ? "w-full h-full p-4 bg-background-light dark:bg-background-dark"
        : "container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 flex justify-center"
      }>
        {renderContent()}
      </div>
    </main>
  );
};

export default AIPTPage;
