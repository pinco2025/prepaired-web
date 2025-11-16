import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { testsData, Test } from '../data';
import TestInstructions from './TestInstructions';
import TestInterface from './TestInterface';

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const foundTest = testsData
      .flatMap((category) => category.tests)
      .find((t) => t.id === testId);
    setTest(foundTest || null);
  }, [testId]);

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {testStarted ? (
          <TestInterface />
        ) : (
          <TestInstructions test={test} onStartTest={() => setTestStarted(true)} />
        )}
      </div>
    </main>
  );
};

export default TestPage;
