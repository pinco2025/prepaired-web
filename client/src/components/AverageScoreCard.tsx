import React, { useState, useEffect } from 'react';

const testScoresData = [
  { name: 'T1', score: null, height: 40, isPrimary: false, isCurrent: false },
  { name: 'T2', score: null, height: 55, isPrimary: false, isCurrent: false },
  { name: 'T3', score: null, height: 45, isPrimary: true, isCurrent: false },
  { name: 'T4', score: null, height: 70, isPrimary: true, isCurrent: false },
  { name: 'T5', score: 175, height: 65, isPrimary: true, isCurrent: true },
];

const AverageScoreCard: React.FC = () => {
  const [scores, setScores] = useState(testScoresData.map(s => ({...s, currentHeight: 0})));

  useEffect(() => {
    const timer = setTimeout(() => {
        setScores(testScoresData.map(s => ({...s, currentHeight: s.height})));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">equalizer</span> Average Score
        </h2>
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <div className="mb-4">
          <span className="text-3xl font-bold text-text-light dark:text-text-dark">154</span>
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark"> / 300</span>
          <div className="text-xs text-text-secondary-light mt-1">Average score over last 5 tests</div>
        </div>
        <div className="flex items-end justify-between h-32 gap-3 mt-auto w-full">
          {scores.map((test, index) => (
            <div key={index} className="w-full flex flex-col justify-end group gap-1">
              <div
                className={`w-full rounded-t-sm relative transition-all duration-700 ease-out group-hover:opacity-80
                  ${test.isPrimary ? (test.isCurrent ? 'bg-primary' : 'bg-primary/70') : 'bg-border-light dark:bg-border-dark'}
                  ${test.isCurrent && 'shadow-glow'}`}
                style={{ height: `${test.currentHeight}%` }}
              >
                {test.isCurrent && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {test.score}
                  </div>
                )}
              </div>
              <span className={`text-[10px] text-center ${test.isCurrent ? 'font-bold text-primary' : 'text-text-secondary-light'}`}>
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
