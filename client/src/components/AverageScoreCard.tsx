import React, { useState, useEffect } from 'react';
import useCountUp from '../hooks/useCountUp';

const testScoresData = [
  { name: 'T1', score: 120, height: 40, isPrimary: false, isCurrent: false },
  { name: 'T2', score: 165, height: 55, isPrimary: false, isCurrent: false },
  { name: 'T3', score: 135, height: 45, isPrimary: true, isCurrent: false },
  { name: 'T4', score: 210, height: 70, isPrimary: true, isCurrent: false },
  { name: 'T5', score: 195, height: 65, isPrimary: true, isCurrent: true },
];

const gridLines = [0, 25, 50, 75, 100];

const AverageScoreCard: React.FC = () => {
  const [scores, setScores] = useState(testScoresData.map(s => ({ ...s, currentHeight: 0 })));
  const animatedScore = useCountUp(154, 2000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScores(testScoresData.map(s => ({ ...s, currentHeight: s.height })));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h2 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
          Average Score
        </h2>
        <span className="px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/10 rounded-full">
          Last 5 tests
        </span>
      </div>

      {/* Score Display */}
      <div className="mb-4 shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-text-light dark:text-text-dark">{animatedScore}</span>
          <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark">/300</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1.5 flex-1 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(animatedScore / 300) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">{Math.round((animatedScore / 300) * 100)}%</span>
        </div>
      </div>

      {/* Chart Container with Grid */}
      <div className="flex-1 flex flex-col justify-end min-h-0">
        <div className="relative h-full flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between h-full pr-2 shrink-0">
            {[...gridLines].reverse().map((val) => (
              <span key={val} className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark leading-none">
                {val === 100 ? '300' : val === 75 ? '225' : val === 50 ? '150' : val === 25 ? '75' : '0'}
              </span>
            ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex flex-col">
            {/* Grid + Bars Container */}
            <div className="flex-1 relative">
              {/* Horizontal Grid Lines - positioned from bottom */}
              {gridLines.map((val) => (
                <div
                  key={val}
                  className="absolute w-full border-t border-dashed border-border-light dark:border-border-dark opacity-50"
                  style={{ bottom: `${val}%` }}
                />
              ))}

              {/* Bars - positioned from bottom */}
              <div className="absolute inset-0 flex items-end justify-around px-2">
                {scores.map((test, index) => (
                  <div key={index} className="flex flex-col items-center h-full group cursor-pointer" style={{ width: '32px' }}>
                    {/* Bar with tooltip */}
                    <div className="w-full h-full relative flex items-end">
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                        <div className="bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-border-light dark:border-border-dark backdrop-blur-sm">
                          {test.score}
                        </div>
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-md relative transition-all duration-1000 ease-out transform group-hover:scale-110 origin-bottom
                          ${test.isPrimary
                            ? test.isCurrent
                              ? 'bg-gradient-to-t from-primary to-accent shadow-lg shadow-primary/20'
                              : 'bg-gradient-to-t from-primary/70 to-accent/70'
                            : 'bg-border-light dark:bg-border-dark'
                          }
                          ${test.isCurrent && 'ring-2 ring-primary/40 ring-offset-1 ring-offset-surface-light dark:ring-offset-surface-dark'}`}
                        style={{ height: `${test.currentHeight}%`, minHeight: test.currentHeight > 0 ? '4px' : '0' }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-md overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-around px-2 pt-2 shrink-0">
              {scores.map((test, index) => (
                <span
                  key={index}
                  className={`text-[10px] text-center font-medium transition-colors
                    ${test.isCurrent
                      ? 'text-primary font-bold'
                      : 'text-text-secondary-light dark:text-text-secondary-dark'
                    }`}
                  style={{ width: '32px' }}
                >
                  {test.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AverageScoreCard;
