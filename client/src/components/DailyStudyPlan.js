import React from 'react';

const DailyStudyPlan = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Daily Study Plan</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
          <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center rounded-full">
            <span className="material-icons-outlined">science</span>
          </div>
          <div>
            <h3 className="font-semibold">Physics: Electrostatics</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Complete 20 practice questions.</p>
          </div>
          <button onClick={() => console.log('Start Physics')} className="ml-auto bg-primary text-white font-medium px-4 py-2 text-sm rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">Start</button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
          <div className="w-12 h-12 flex-shrink-0 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full">
            <span className="material-icons-outlined">biotech</span>
          </div>
          <div>
            <h3 className="font-semibold">Chemistry: Chemical Bonding</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Review chapter notes.</p>
          </div>
          <button onClick={() => console.log('Review Chemistry')} className="ml-auto bg-green-500 text-white font-medium px-4 py-2 text-sm rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">Review</button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
          <div className="w-12 h-12 flex-shrink-0 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-full">
            <span className="material-icons-outlined">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold">Maths: Limits &amp; Continuity</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Take a short quiz (15 mins).</p>
          </div>
          <button onClick={() => console.log('Start Maths Quiz')} className="ml-auto bg-orange-500 text-white font-medium px-4 py-2 text-sm rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default DailyStudyPlan;
