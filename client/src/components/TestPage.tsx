import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import TestInstructions from './TestInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDataCache } from '../contexts/DataCacheContext';

type TestStatus = 'instructions' | 'inProgress' | 'submitted';

const TestPage: React.FC = () => {
  usePageTitle('Test');
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { invalidateCache } = useDataCache();
  const [test, setTest] = useState<Test | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('instructions');
  const [checkingAttempt, setCheckingAttempt] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      if (!testId) return;

      try {
        // 1. Check for existing attempt
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: attempts } = await supabase
            .from('student_tests')
            .select('id, submitted_at')
            .eq('test_id', testId)
            .eq('user_id', user.id)
            .not('submitted_at', 'is', null)
            .limit(1);

          if (attempts && attempts.length > 0) {
            // Redirect to results if already attempted (submitted)
            navigate(`/results/${attempts[0].id}`, { replace: true });
            return;
          }
        }

        // 2. If no completed attempt, fetch test details
        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .eq('testID', testId)
          .single();

        if (error) {
          console.error('Error fetching test:', error);
          setTest(null);
        } else {
          setTest(data as Test);
        }
      } catch (error) {
        console.error('Error initializing test page:', error);
      } finally {
        setCheckingAttempt(false);
      }
    };

    initPage();
  }, [testId, navigate]);

  useEffect(() => {
    const handlePopState = () => {
      // When the user navigates back, always return to the instructions
      setTestStatus('instructions');
    };

    if (testStatus === 'inProgress' || testStatus === 'submitted') {
      // Push a new state to the history stack to "trap" the user
      window.history.pushState({ status: testStatus }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testStatus]);

  if (checkingAttempt) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test) {
    return <div>Test not found</div>;
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
    // Invalidate all caches so Dashboard and Tests show fresh data
    invalidateCache('all');
    setTestStatus('submitted');
  };

  const renderContent = () => {
    switch (testStatus) {
      case 'inProgress':
        return <TestInterface test={test} onSubmitSuccess={handleSubmitSuccess} exam={test.exam} />;
      case 'submitted':
        return <TestSubmitted />;
      case 'instructions':
      default:
        return <TestInstructions test={test} onStartTest={handleStartTest} />;
    }
  };

  const isTestInProgress = testStatus === 'inProgress';

  return (
    <main className={`flex-grow ${isTestInProgress ? 'h-screen overflow-hidden' : ''}`}>
      <div className={isTestInProgress
        ? "w-full h-full p-4 bg-background-light dark:bg-background-dark"
        : "container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center"
      }>
        {renderContent()}
      </div>
    </main>
  );
};

export default TestPage;
