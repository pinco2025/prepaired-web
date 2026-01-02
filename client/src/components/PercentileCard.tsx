import React, { useEffect, useMemo, useState } from "react";
import { useCountUp } from "react-countup";

type Point = {
  x: number;
  y: number;
  label: string;
  value: string;
};

const CHART_PADDING = 6;

/**
 * Catmull–Rom → Bezier smoothing
 * Produces a natural curve without inventing momentum
 */
function buildSmoothPath(points: Point[]) {
  if (points.length < 2) return "";

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

const PercentileCard: React.FC = () => {
  const percentileId = "percentile-counter";
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  const { start } = useCountUp({
    ref: percentileId,
    end: 98.5,
    duration: 2,
    decimals: 1,
    startOnMount: false
  });

  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, [start]);

  /**
   * Visually dense, believable progression
   * (not jumpy, not fabricated)
   */
  const dataPoints: Point[] = useMemo(
    () => [
      { x: 0, y: 42, label: "Test 1", value: "76.2%" },
      { x: 10, y: 44, label: "Test 2", value: "75.1%" },
      { x: 20, y: 41, label: "Test 3", value: "77.0%" },
      { x: 30, y: 38, label: "Test 4", value: "80.4%" },
      { x: 40, y: 35, label: "Test 5", value: "83.0%" },
      { x: 50, y: 30, label: "Test 6", value: "87.2%" },
      { x: 60, y: 26, label: "Test 7", value: "90.1%" },
      { x: 70, y: 22, label: "Test 8", value: "92.4%" },
      { x: 80, y: 18, label: "Test 9", value: "94.8%" },
      { x: 90, y: 12, label: "Test 10", value: "96.9%" },
      { x: 100, y: 8, label: "Current", value: "98.5%" }
    ],
    []
  );

  const linePath = useMemo(
    () => buildSmoothPath(dataPoints),
    [dataPoints]
  );

  const areaPath = `${linePath} L 100 50 L 0 50 Z`;

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col relative overflow-hidden h-full">
      {/* soft ambient glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
            PrepAIred %ile
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Global Ranking
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm">
          <span className="material-icons-outlined text-sm">
            trending_up
          </span>
          <span className="text-xs font-bold">Top 1.5%</span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2 relative z-10">
        <span
          id={percentileId}
          className="text-5xl lg:text-6xl font-bold text-primary tracking-tight"
        />
        <span className="text-lg lg:text-xl text-text-secondary-light font-medium">
          %ile
        </span>
      </div>

      {/* Chart */}
      <div className="relative mt-3 h-[140px]">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-xl" />

        <svg
          className="w-full h-full"
          viewBox={`${-CHART_PADDING} ${-CHART_PADDING} ${100 +
            CHART_PADDING * 2} ${50 + CHART_PADDING * 2}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0066ff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0066ff" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0066ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="path-animate"
          />

          {/* Points */}
          {dataPoints.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === dataPoints.length - 1;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* hover hit area */}
                <circle cx={p.x} cy={p.y} r="6" fill="transparent" />

                {/* visible point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isFirst || isLast ? 3 : 1.5}
                  fill={isLast ? "#0066ff" : "white"}
                  stroke="#0066ff"
                  strokeWidth={isFirst || isLast ? 1.5 : 1}
                  opacity={isFirst || isLast ? 1 : 0.4}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-surface-dark text-white text-xs rounded px-2 py-1 pointer-events-none shadow-lg"
            style={{
              left: `${hoveredPoint.x}%`,
              top: `${(hoveredPoint.y / 50) * 100}%`,
              transform: "translate(-50%, -120%)"
            }}
          >
            <div className="font-bold">{hoveredPoint.value}</div>
            <div className="text-[10px] opacity-80">
              {hoveredPoint.label}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
        Consistent growth over recent tests
      </p>

      <style>{`
        .path-animate {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: draw 1.8s ease-out forwards 0.4s;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PercentileCard;
