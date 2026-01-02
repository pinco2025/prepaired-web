import React, { useEffect, useState } from 'react';
import { useCountUp } from 'react-countup';

const PercentileCard: React.FC = () => {
    const percentileId = "percentile-counter";
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: string, label: string } | null>(null);

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

    // Data points for the graph
    const dataPoints = [
        { cx: 0, cy: 40, label: "Test 1", value: "82.5%" },
        { cx: 20, cy: 45, label: "Test 2", value: "80.0%" },
        { cx: 40, cy: 30, label: "Test 3", value: "88.0%" },
        { cx: 70, cy: 15, label: "Test 4", value: "95.0%" },
        { cx: 100, cy: 5, label: "Current", value: "98.5%" }
    ];

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col relative overflow-hidden group h-full min-h-0">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-2 lg:mb-4 relative z-10 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">PrepAIred %ile</h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Global Ranking</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm">
          <span className="material-icons-outlined text-sm">trending_up</span>
          <span className="text-xs font-bold">Top 1.5%</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 justify-between">
        <div className="flex items-baseline gap-2 mb-2 shrink-0">
          <span id={percentileId} className="text-4xl lg:text-6xl font-bold text-primary tracking-tight" />
          <span className="text-lg lg:text-xl text-text-secondary-light font-medium">%ile</span>
        </div>

        {/* Graph Container - Flex grow to fill space */}
        <div className="flex-1 w-full relative min-h-0">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
            <defs>
              <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0066ff', stopOpacity: 0.2 }}></stop>
                <stop offset="100%" style={{ stopColor: '#0066ff', stopOpacity: 0 }}></stop>
              </linearGradient>
            </defs>
            {/* Area Path */}
            <path d="M0 40 Q 20 45, 40 30 T 70 15 T 100 5 V 50 H 0 Z" fill="url(#gradient)" className="opacity-0 animate-fade-in-up delay-300"></path>

            {/* Line Path */}
            <path d="M0 40 Q 20 45, 40 30 T 70 15 T 100 5" fill="none" stroke="#0066ff" strokeLinecap="round" strokeWidth="2" className="path-animate"></path>

            {/* Interactive Points */}
            {dataPoints.map((point, index) => (
                <g key={index}
                   className="cursor-pointer group/point"
                   onMouseEnter={() => setHoveredPoint({ x: point.cx, y: point.cy, value: point.value, label: point.label })}
                   onMouseLeave={() => setHoveredPoint(null)}
                >
                    {/* Invisible larger hit area */}
                    <circle cx={point.cx} cy={point.cy} r="8" fill="transparent" />

                    {/* Visible point */}
                    <circle
                        cx={point.cx}
                        cy={point.cy}
                        fill={index === dataPoints.length - 1 ? "#0066ff" : "white"}
                        r={index === dataPoints.length - 1 ? "2.5" : "1.5"}
                        stroke={index === dataPoints.length - 1 ? "white" : "#0066ff"}
                        strokeWidth="1"
                        className={`transition-all duration-300 ${index === dataPoints.length - 1 ? 'animate-pulse' : 'opacity-0 animate-fade-in-up'}`}
                        style={{ animationDelay: `${200 + index * 100}ms` }}
                    />
                </g>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredPoint && (
              <div
                className="absolute bg-surface-dark text-white text-xs rounded px-2 py-1 pointer-events-none transform -translate-x-1/2 -translate-y-full z-20 shadow-lg"
                style={{
                    left: `${hoveredPoint.x}%`,
                    top: `${(hoveredPoint.y / 50) * 100}%`,
                    marginTop: '-8px'
                }}
              >
                  <div className="font-bold">{hoveredPoint.value}</div>
                  <div className="text-[10px] opacity-80">{hoveredPoint.label}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-surface-dark"></div>
              </div>
          )}
        </div>

        <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-2 shrink-0">Consistent growth over last 5 tests</p>
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
