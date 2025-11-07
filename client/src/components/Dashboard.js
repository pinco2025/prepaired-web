import React, { useState, useEffect } from 'react';
import DailyStudyPlan from './DailyStudyPlan';
import RecentActivity from './RecentActivity';
import RecommendedForYou from './RecommendedForYou';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome back, Alex!</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Let's continue your journey to ace the JEE exam.</p>
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
    </div>
  );
};

export default Dashboard;
