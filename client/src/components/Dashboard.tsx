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
    <div className="p-4 md:p-6 h-full md:h-screen animate-fade-in-up overflow-y-auto md:overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <div className="mb-4 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-text-light dark:text-text-dark">Welcome back, Alex!</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Here's your prepAIred learning summary.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 pb-4 md:min-h-0">
            {/* Row 1 */}
            <div className="col-span-1 md:col-span-12 lg:col-span-7 h-[380px] md:h-full md:min-h-0">
                 <SubjectsCard />
            </div>
            <div className="col-span-1 md:col-span-12 lg:col-span-5 h-[380px] md:h-full md:min-h-0">
                <PercentileCard />
            </div>

            {/* Row 2 */}
            <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
                <WeakAreasCard />
            </div>
            <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
                <AccuracyCard />
            </div>
            <div className="col-span-1 md:col-span-12 lg:col-span-4 h-[300px] md:h-full md:min-h-0">
                <AverageScoreCard />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
