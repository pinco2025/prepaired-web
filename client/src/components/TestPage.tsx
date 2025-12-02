import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import TestInstructions from './TestInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';

type TestStatus = 'instructions' | 'inProgress' | 'submitted';

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('instructions');

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
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
    };

    fetchTest();
  }, [testId]);

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
    setTestStatus('submitted');
  };

  const renderContent = () => {
    if (!test) {
      return <div>Loading test...</div>;
    }
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

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        {renderContent()}
      </div>
    </main>
  );
};

export default TestPage;
