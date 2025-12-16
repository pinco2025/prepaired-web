import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SubjectMastery from './SubjectMastery';
import ScoreAndStreak from './ScoreAndStreak';
import FocusAreas from './FocusAreas';

const Dashboard: React.FC = () => {
  const { user: authUser, loading: authLoading, examType } = useAuth();

  if (authLoading) {
    return (
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-8 text-center">
            <div className="text-xl font-semibold mb-2">Loading dashboard…</div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Please wait while we fetch your profile and settings.</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome back, {authUser?.user_metadata?.full_name || 'Alex'}!</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Let's continue your journey to ace the {examType ?? 'JEE'} exam.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <SubjectMastery />
          </div>
          <div className="lg:col-span-1">
            <ScoreAndStreak />
          </div>
        </div>
        <FocusAreas />
      </div>
    </main>
  );
};

export default Dashboard;
