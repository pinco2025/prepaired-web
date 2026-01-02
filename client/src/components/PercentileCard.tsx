import React, { useEffect, useMemo, useState, useRef } from "react";
import { useCountUp } from "react-countup";

// --- Types ---
interface ChartData {
  label: string;
  date: string;
  value: number;
}

interface Point {
  x: number;
  y: number;
  data: ChartData;
}

// --- Constants ---
const PRIMARY_COLOR = "#0066ff";

// --- Mock Data ---
const MOCK_HISTORY: ChartData[] = [
  { label: "Test 1", date: "2023-10-01", value: 76.2 },
  { label: "Test 2", date: "2023-10-05", value: 75.1 },
  { label: "Test 3", date: "2023-10-12", value: 77.0 },
  { label: "Test 4", date: "2023-10-20", value: 80.4 },
  { label: "Test 5", date: "2023-10-28", value: 83.0 },
  { label: "Test 6", date: "2023-11-05", value: 87.2 },
  { label: "Test 7", date: "2023-11-12", value: 90.1 },
  { label: "Test 8", date: "2023-11-20", value: 92.4 },
  { label: "Test 9", date: "2023-11-28", value: 94.8 },
  { label: "Test 10", date: "2023-12-05", value: 96.9 },
  { label: "Current", date: "2023-12-15", value: 98.5 }
];

// --- Hooks ---
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, width: size.width, height: size.height };
}

// --- Math Helpers ---

/**
 * Generates a smooth SVG path from points using a simplified smoothing algorithm.
 */
function buildSmoothPath(points: Point[]) {
  if (points.length < 2) return "";

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    // Tension factor
    const t = 0.2;

    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;

    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}


const PercentileCard: React.FC = () => {
  const percentileId = "percentile-counter";
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  // Padding inside the SVG to prevent clipping of circles/stroke
  const PADDING = { TOP: 20, BOTTOM: 30, LEFT: 10, RIGHT: 40 };

  // --- Animation ---
  const { start } = useCountUp({
    ref: percentileId,
    end: MOCK_HISTORY[MOCK_HISTORY.length - 1].value,
    duration: 2,
    decimals: 1,
    startOnMount: false
  });

  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, [start]);

  // --- Data Processing ---
  const { points, gridLines, areaPath, linePath } = useMemo(() => {
    if (!width || !height) return { points: [], gridLines: [], areaPath: "", linePath: "" };

    const chartW = width - PADDING.LEFT - PADDING.RIGHT;
    const chartH = height - PADDING.TOP - PADDING.BOTTOM;

    const values = MOCK_HISTORY.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Domain scaling
    const buffer = (maxVal - minVal) * 0.5 || 5;
    const domainMin = Math.floor(Math.max(0, minVal - buffer));
    const domainMax = Math.ceil(Math.min(100, maxVal + buffer * 0.5));
    const domainRange = domainMax - domainMin || 1;

    // Grid Lines (3 lines)
    const gridValues = [domainMin, domainMin + domainRange * 0.5, domainMax];
    const gridLines = gridValues.map(val => ({
        value: val,
        y: PADDING.TOP + chartH - ((val - domainMin) / domainRange) * chartH
    }));

    // Calculate Points
    const calculatedPoints: Point[] = MOCK_HISTORY.map((d, i) => {
        const x = PADDING.LEFT + (i / (MOCK_HISTORY.length - 1)) * chartW;
        const y = PADDING.TOP + chartH - ((d.value - domainMin) / domainRange) * chartH;
        return { x, y, data: d };
    });

    const path = buildSmoothPath(calculatedPoints);
    const area = `${path} L ${PADDING.LEFT + chartW} ${PADDING.TOP + chartH} L ${PADDING.LEFT} ${PADDING.TOP + chartH} Z`;

    return { points: calculatedPoints, gridLines, linePath: path, areaPath: area };
  }, [width, height]);


  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col relative overflow-hidden h-full">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-2 relative z-10 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
            PrepAIred %ile
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Global Ranking
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-success-light/10 text-success-dark px-2.5 py-1 rounded-full border border-success-light/20">
          <span className="material-icons-outlined text-sm">trending_up</span>
          <span className="text-xs font-bold">Top 1.5%</span>
        </div>
      </div>

      {/* Big Value */}
      <div className="flex items-baseline gap-2 mb-4 relative z-10 shrink-0">
        <span
          id={percentileId}
          className="text-4xl md:text-5xl font-bold text-primary tracking-tight"
        />
        <span className="text-base text-text-secondary-light font-medium">%ile</span>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-[140px] relative" ref={ref}>
        {width > 0 && height > 0 && (
            <>
                <svg width={width} height={height} className="overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {gridLines.map((line, i) => (
                        <g key={`grid-${i}`}>
                            <line
                                x1={PADDING.LEFT}
                                y1={line.y}
                                x2={width - PADDING.RIGHT}
                                y2={line.y}
                                stroke="currentColor"
                                strokeOpacity="0.06"
                                strokeDasharray="4 4"
                                className="text-text-secondary-light dark:text-text-secondary-dark"
                            />
                            {/* Y-Axis Label */}
                            <text
                                x={width - PADDING.RIGHT + 8}
                                y={line.y}
                                dy="0.3em"
                                fontSize="10"
                                fill="currentColor"
                                opacity="0.5"
                                className="text-text-secondary-light dark:text-text-secondary-dark font-mono"
                            >
                                {Math.round(line.value)}
                            </text>
                        </g>
                    ))}

                    {/* Area Fill */}
                    <path d={areaPath} fill="url(#chartGradient)" />

                    {/* Main Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke={PRIMARY_COLOR}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-line"
                    />

                    {/* Interactive Points */}
                    {points.map((p, i) => {
                         const isLast = i === points.length - 1;
                         const isHovered = hoveredPoint === p;
                         // Only show points on hover or if it's the last one
                         const isVisible = isLast || isHovered;

                         return (
                            <g
                                key={i}
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                                className="cursor-pointer"
                            >
                                {/* Invisible Hit Target (Larger) */}
                                <circle cx={p.x} cy={p.y} r="15" fill="transparent" />

                                {/* Visible Dot */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isHovered ? 5 : 4}
                                    fill={isLast || isHovered ? PRIMARY_COLOR : "var(--background)"}
                                    stroke="white"
                                    strokeWidth="2"
                                    className={`transition-all duration-200 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {isLast && !isHovered && (
                                     <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="4"
                                        fill={PRIMARY_COLOR}
                                        stroke="white"
                                        strokeWidth="2"
                                     />
                                )}
                            </g>
                         );
                    })}
                </svg>

                {/* Tooltip (HTML overlay for easier styling/z-index) */}
                {hoveredPoint && (
                    <div
                        className="absolute z-20 pointer-events-none transition-all duration-100 ease-out"
                        style={{
                            left: hoveredPoint.x,
                            top: hoveredPoint.y,
                            transform: `translate(-50%, -130%)`
                        }}
                    >
                        <div className="bg-surface-dark text-white text-xs py-1.5 px-3 rounded-lg shadow-xl flex flex-col items-center min-w-[60px] border border-white/10">
                            <span className="font-bold text-sm">{hoveredPoint.data.value}%</span>
                            <span className="text-[10px] text-gray-400">{hoveredPoint.data.label}</span>
                        </div>
                        {/* Little triangle arrow */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-surface-dark absolute left-1/2 -bottom-[5px] -translate-x-1/2"></div>
                    </div>
                )}
            </>
        )}
      </div>

      <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-2 shrink-0">
        Your performance is trending upward
      </p>

      <style>{`
        .animate-draw-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default PercentileCard;
