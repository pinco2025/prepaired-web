import React from 'react';

interface TestInstructionsProps {
  test: {
    id: string;
    title: string;
    description: string;
    duration: number;
    totalQuestions: number;
    markingScheme: string;
    instructions: string[];
  };
  onStartTest: () => void;
}

const formatDuration = (seconds: number) => {
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} Minute(s)`;
  }
  return `${(seconds / 3600).toFixed(1)} Hour(s)`;
};


const TestInstructions: React.FC<TestInstructionsProps> = ({ test, onStartTest }) => {
  return (
    <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-8 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark tracking-tight">{test.title}</h1>
      </div>
      <div className="mb-8 border-b border-border-light dark:border-border-dark pb-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-center">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-primary text-3xl">timer</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Duration</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{formatDuration(test.duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-primary text-3xl">quiz</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Questions</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{test.totalQuestions}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-primary text-3xl">rule</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Marking Scheme</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{test.markingScheme}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-6 text-center">Important Instructions</h2>
        <ul className="space-y-4 text-text-secondary-light dark:text-text-secondary-dark list-disc list-inside">
          {test.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
      <div className="text-center">
        <button
          onClick={onStartTest}
          className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-light dark:focus:ring-offset-surface-dark transition-colors duration-300"
        >
          Start Test
          <span className="material-icons-outlined ml-2">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default TestInstructions;
