import React, { useEffect } from 'react';
import { useCountUp } from 'react-countup';

const PercentileCard: React.FC = () => {
    const percentileId = "percentile-counter";
    const { start } = useCountUp({
        ref: percentileId,
        end: 98.5,
        duration: 2,
        decimal: '.',
        decimals: 1,
        startOnMount: false,
    });

    useEffect(() => {
      const timer = setTimeout(() => {
        start();
      }, 500);
      return () => clearTimeout(timer);
    }, [start]);

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark h-[380px] relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">PrepAIred %ile</h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Global Ranking</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm">
          <span className="material-icons-outlined text-sm">trending_up</span>
          <span className="text-xs font-bold">Top 1.5%</span>
        </div>
      </div>
      <div className="relative z-10 flex flex-col h-full pb-10 justify-center">
        <div className="flex items-baseline gap-2 mb-6">
          <span id={percentileId} className="text-6xl font-bold text-primary tracking-tight" />
          <span className="text-xl text-text-secondary-light font-medium">%ile</span>
        </div>
        <div className="w-full h-32 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
            <defs>
              <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0066ff', stopOpacity: 0.2 }}></stop>
                <stop offset="100%" style={{ stopColor: '#0066ff', stopOpacity: 0 }}></stop>
              </linearGradient>
            </defs>
            <path d="M0 40 Q 20 45, 40 30 T 70 15 T 100 5 V 50 H 0 Z" fill="url(#gradient)" className="opacity-0 animate-fade-in-up delay-300"></path>
            <path d="M0 40 Q 20 45, 40 30 T 70 15 T 100 5" fill="none" stroke="#0066ff" strokeLinecap="round" strokeWidth="2" className="path-animate"></path>
            <circle cx="40" cy="30" fill="white" r="1.5" stroke="#0066ff" strokeWidth="1" className="opacity-0 animate-fade-in-up delay-200"></circle>
            <circle cx="70" cy="15" fill="white" r="1.5" stroke="#0066ff" strokeWidth="1" className="opacity-0 animate-fade-in-up delay-300"></circle>
            <circle className="animate-pulse" cx="100" cy="5" fill="#0066ff" r="2.5" stroke="white" strokeWidth="1"></circle>
          </svg>
        </div>
        <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">Consistent growth over last 5 tests</p>
      </div>
      <style>{`
        .path-animate {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw 2s ease-out forwards 0.5s;
        }
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PercentileCard;
