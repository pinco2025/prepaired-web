import React from 'react';
import { Link } from 'react-router-dom';

const TestSubmitted: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-lg text-center bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark translate-y-[-40px]">
        <div className="mb-6">
          <span className="material-icons-outlined text-green-500" style={{ fontSize: "80px" }}>check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">Thank You!</h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8">Your test has been successfully submitted.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-primary bg-primary/10 border-2 border-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-icons-outlined">dashboard</span>
            Go to Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
          >
            <span className="material-icons-outlined">bar_chart</span>
            View Result
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestSubmitted;
