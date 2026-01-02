import React, { useState, useEffect } from 'react';

const testScoresData = [
  { name: 'T1', score: 120, height: 40, isPrimary: false, isCurrent: false },
  { name: 'T2', score: 165, height: 55, isPrimary: false, isCurrent: false },
  { name: 'T3', score: 135, height: 45, isPrimary: true, isCurrent: false },
  { name: 'T4', score: 210, height: 70, isPrimary: true, isCurrent: false },
  { name: 'T5', score: 195, height: 65, isPrimary: true, isCurrent: true },
];

const AverageScoreCard: React.FC = () => {
  const [scores, setScores] = useState(testScoresData.map(s => ({...s, currentHeight: 0})));

  useEffect(() => {
    // Add a small delay to ensure DOM is ready for transition
    const timer = setTimeout(() => {
        setScores(testScoresData.map(s => ({...s, currentHeight: s.height})));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-2 lg:mb-4 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">equalizer</span> Average Score
        </h2>
      </div>
      <div className="flex-1 flex flex-col justify-end min-h-0">
        <div className="mb-2 lg:mb-4 shrink-0">
          <span className="text-2xl lg:text-3xl font-bold text-text-light dark:text-text-dark">154</span>
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark"> / 300</span>
          <div className="text-xs text-text-secondary-light mt-1">Average score over last 5 tests</div>
        </div>

        {/* Chart Container */}
        <div className="flex items-end justify-between flex-1 gap-3 mt-auto w-full pb-1 min-h-[60px]">
          {scores.map((test, index) => (
            <div key={index} className="w-full h-full flex flex-col justify-end group gap-1 lg:gap-2">
              <div className="w-full relative flex-1 flex flex-col justify-end">
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-sm relative transition-all duration-1000 ease-out group-hover:opacity-80
                      ${test.isPrimary ? (test.isCurrent ? 'bg-primary' : 'bg-primary/70') : 'bg-border-light dark:bg-border-dark'}
                      ${test.isCurrent && 'shadow-glow'}`}
                    style={{ height: `${Math.max(test.currentHeight, 4)}%` }} // Ensure min-height 4%
                  >
                     {/* Tooltip on Hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {test.score}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-surface-dark"></div>
                    </div>
                  </div>
              </div>
              <span className={`text-[10px] text-center font-medium ${test.isCurrent ? 'text-primary font-bold' : 'text-text-secondary-light'}`}>
                {test.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AverageScoreCard;
