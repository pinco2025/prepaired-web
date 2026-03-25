import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import TestInstructions from './TestInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDataCache } from '../contexts/DataCacheContext';
import { NTAModeDialog, NTABackWarningDialog } from './NTADialogs';

type TestStatus = 'instructions' | 'inProgress' | 'submitted';

const TestPage: React.FC = () => {
  usePageTitle('Test');
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReattempt = searchParams.get('reattempt') === 'true';
  const { invalidateCache } = useDataCache();
  const [test, setTest] = useState<Test | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('instructions');
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [ntaMode, setNtaMode] = useState(false);
  const [showNtaDialog, setShowNtaDialog] = useState(false);
  const [ntaBackWarning, setNtaBackWarning] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      if (!testId) return;

      try {
        // 1. Check for existing attempt
        const { data: { user } } = await supabase.auth.getUser();

        if (user && !isReattempt) {
          const { data: attempts } = await supabase
            .from('student_tests')
            .select('id')
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
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('testID', testId)
          .single();

        if (testError || !testData) {
          console.error('Test not found');
          setTest(null);
        } else {
          setTest(testData as Test);
        }
      } catch (error) {
        console.error('Error initializing test page:', error);
      } finally {
        setCheckingAttempt(false);
      }
    };

    initPage();
  }, [testId, navigate, isReattempt]);

  useEffect(() => {
    const handlePopState = () => {
      if (ntaMode && testStatus === 'inProgress') {
        setNtaBackWarning(true);
        window.history.pushState({ status: testStatus }, '');
        return;
      }
      // Ignore popstate events triggered by fullscreen exit — re-push the state
      // and keep the test running
      if (document.fullscreenElement === null && testStatus === 'inProgress') {
        window.history.pushState({ status: testStatus }, '');
        return;
      }
      // When the user actually navigates back, return to the instructions
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
  }, [testStatus, ntaMode]);

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
    const isMobile = window.innerWidth < 768;
    if (!isMobile && test.exam?.toUpperCase() === 'JEE') {
      setShowNtaDialog(true);
    } else {
      startTest(false);
    }
  };

  const startTest = (useNta: boolean) => {
    setShowNtaDialog(false);
    setNtaMode(useNta);
    setTestStatus('inProgress');
    if (useNta) {
      window.dispatchEvent(new CustomEvent('ntamodechange', { detail: true }));
    }
    // Only request fullscreen on desktop
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  const handleSubmitSuccess = () => {
    // Invalidate all caches so Dashboard and Tests show fresh data
    invalidateCache('all');
    setNtaMode(false);
    setTestStatus('submitted');
    window.dispatchEvent(new CustomEvent('ntamodechange', { detail: false }));
  };

  const renderContent = () => {
    switch (testStatus) {
      case 'inProgress':
        return (
          <>
            <TestInterface test={test} onSubmitSuccess={handleSubmitSuccess} exam={test.exam} ntaMode={ntaMode} isReattempt={isReattempt} />
            {ntaBackWarning && (
              <NTABackWarningDialog
                onStay={() => {
                  setNtaBackWarning(false);
                  window.history.pushState({ status: testStatus }, '');
                }}
                onLeave={() => {
                  setNtaBackWarning(false);
                  setNtaMode(false);
                  setTestStatus('instructions');
                  window.dispatchEvent(new CustomEvent('ntamodechange', { detail: false }));
                }}
              />
            )}
          </>
        );
      case 'submitted':
        return <TestSubmitted />;
      case 'instructions':
      default:
        return (
          <>
            <TestInstructions test={test} onStartTest={handleStartTest} />
            {showNtaDialog && (
              <NTAModeDialog
                onSelectNTA={() => startTest(true)}
                onSelectStandard={() => startTest(false)}
              />
            )}
          </>
        );
    }
  };

  const isTestInProgress = testStatus === 'inProgress';

  return (
    <main className={`flex-grow ${isTestInProgress ? 'h-[100dvh] overflow-hidden' : ''}`}>
      <div className={isTestInProgress
        ? "w-full h-full p-2 sm:p-4 bg-background-light dark:bg-background-dark"
        : "container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 flex justify-center"
      }>
        {renderContent()}
      </div>
    </main>
  );
};

export default TestPage;
