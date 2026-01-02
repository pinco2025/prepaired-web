import React, { useState, useEffect } from 'react';
import SubjectsCard from './SubjectsCard';
import PercentileCard from './PercentileCard';
import WeakAreasCard from './WeakAreasCard';
import AccuracyCard from './AccuracyCard';
import AverageScoreCard from './AverageScoreCard';
import DashboardSkeleton from './DashboardSkeleton';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 h-full animate-fade-in-up">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">Welcome back, Alex!</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Here's your prepAIred learning summary.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
            <SubjectsCard />
            <PercentileCard />
            <WeakAreasCard />
            <AccuracyCard />
            <AverageScoreCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
