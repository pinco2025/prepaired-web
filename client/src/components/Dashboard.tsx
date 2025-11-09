import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DailyStudyPlan from './DailyStudyPlan';
import RecentActivity from './RecentActivity';
import RecommendedForYou from './RecommendedForYou';

const Dashboard: React.FC = () => {
  const { user, examType, fullName } = useAuth();

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
            Welcome back, {(fullName ?? user?.user_metadata?.full_name) || 'Aspirant'}!
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Let's continue your journey to ace the {examType ?? 'JEE'} exam.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DailyStudyPlan />
            <RecentActivity />
          </div>
          <div className="lg:col-span-1">
            <RecommendedForYou />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
