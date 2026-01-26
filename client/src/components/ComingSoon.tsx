import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

const ComingSoon: React.FC = () => {
  usePageTitle('Test Series - Coming Soon');
  return (
    <main className="flex-grow flex items-center justify-center min-h-[100dvh] overflow-x-hidden overflow-y-auto relative px-4 py-12">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-[500px] h-64 md:h-[500px] rounded-full bg-indigo-500/5 blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-lg mx-auto text-center relative z-10">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-light dark:text-white mb-3">
          Test Series for{' '}
          <span className="text-primary">JEE Mains</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-8 sm:mb-12">
          Session 2
        </p>

        {/* Date - Main Focus */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 font-medium">
            Launching
          </p>
          <div className="inline-flex items-baseline gap-2 sm:gap-3">
            <span className="text-6xl sm:text-7xl md:text-8xl font-black text-primary leading-none">
              15
            </span>
            <div className="text-left">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-text-light dark:text-white">
                February
              </div>
              <div className="text-sm sm:text-base text-slate-400 dark:text-slate-500">
                2025
              </div>
            </div>
          </div>
        </div>

        {/* Minimal divider */}
        <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 mx-auto mb-6 sm:mb-8"></div>

        {/* Simple tagline */}
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Full syllabus tests with detailed solutions
        </p>

      </div>
    </main>
  );
};

export default ComingSoon;
