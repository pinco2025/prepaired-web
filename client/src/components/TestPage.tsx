import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { testsData, Test } from '../data';
import TestInstructions from './TestInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';

type TestStatus = 'instructions' | 'inProgress' | 'submitted';

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('instructions');

  useEffect(() => {
    const foundTest = testsData
      .flatMap((category) => category.tests)
      .find((t) => t.id === testId);
    setTest(foundTest || null);
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
  };

  const handleSubmitSuccess = () => {
    setTestStatus('submitted');
  };

  const renderContent = () => {
    switch (testStatus) {
      case 'inProgress':
        return <TestInterface onSubmitSuccess={handleSubmitSuccess} />;
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
