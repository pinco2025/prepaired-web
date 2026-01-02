import React, { useEffect, useMemo, useState } from "react";
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

// --- Constants ---
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 50;
const PADDING_TOP = 5;
const PADDING_BOTTOM = 5;

// --- Helpers ---

/**
 * Catmull–Rom to Cubic Bezier conversion for smooth SVG paths.
 */
function buildSmoothPath(points: Point[]) {
  if (points.length < 2) return "";

  // Start at the first point
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

const PercentileCard: React.FC = () => {
  const percentileId = "percentile-counter";
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

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
  const { points, gridLines } = useMemo(() => {
    const values = MOCK_HISTORY.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Create a dynamic Y-domain with some buffer
    // Range: [min - buffer, max + buffer], clamped to [0, 100]
    const buffer = (maxVal - minVal) * 0.2 || 5;
    const domainMin = Math.max(0, Math.floor(minVal - buffer));
    const domainMax = Math.min(100, Math.ceil(maxVal + buffer));
    const domainRange = domainMax - domainMin || 1; // Avoid divide by zero

    // Grid lines: 3 lines (min, mid, max)
    const gridValues = [
      domainMin,
      domainMin + domainRange * 0.5,
      domainMax,
    ];

    const gridLines = gridValues.map((val) => ({
        value: val,
        y: VIEWBOX_HEIGHT - PADDING_BOTTOM - ((val - domainMin) / domainRange) * (VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM)
    }));

    // Calculate Points
    const calculatedPoints: Point[] = MOCK_HISTORY.map((d, i) => {
        // X: Distributed evenly
        const x = (i / (MOCK_HISTORY.length - 1)) * VIEWBOX_WIDTH;

        // Y: Scaled to available height inside padding
        // Invert Y because SVG coordinates go down
        const normalizedVal = (d.value - domainMin) / domainRange;
        const y = VIEWBOX_HEIGHT - PADDING_BOTTOM - (normalizedVal * (VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM));

        return { x, y, data: d };
    });

    return { points: calculatedPoints, gridLines };
  }, []);

  const linePath = useMemo(() => buildSmoothPath(points), [points]);

  // Close the path for the area fill
  const areaPath = `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`;

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
      <div className="flex items-baseline gap-2 mb-1 relative z-10">
        <span
          id={percentileId}
          className="text-5xl lg:text-6xl font-bold text-primary tracking-tight"
        />
        <span className="text-lg lg:text-xl text-text-secondary-light font-medium">
          %ile
        </span>
      </div>

      {/* Chart Container */}
      <div className="relative mt-auto flex-1 w-full min-h-[120px]">
        {/* Y-Axis Labels (Absolute positioned on the left/right or inline) */}
        {/* We can render them inside the SVG or as HTML overlays. HTML allows easier styling. */}
        <div className="absolute inset-0 pointer-events-none">
             {/* Render labels for grid lines */}
             {gridLines.map((line, i) => (
                 <div
                    key={i}
                    className="absolute right-0 text-[10px] text-text-secondary-light/50 dark:text-text-secondary-dark/50 transform translate-y-1/2"
                    style={{ bottom: `${((VIEWBOX_HEIGHT - line.y) / VIEWBOX_HEIGHT) * 100}%`, transform: 'translateY(50%)' }}
                 >
                     {Math.round(line.value)}
                 </div>
             ))}
        </div>

        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0066ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0066ff" stopOpacity="0.0" />
            </linearGradient>
            {/* Glow filter for the line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {gridLines.map((line, i) => (
             <line
                key={`grid-${i}`}
                x1="0"
                y1={line.y}
                x2={VIEWBOX_WIDTH}
                y2={line.y}
                stroke="currentColor"
                strokeOpacity="0.05"
                strokeDasharray="2 2"
                className="text-text-secondary-light dark:text-text-secondary-dark"
             />
          ))}

          {/* Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0066ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="path-animate"
            filter="url(#glow)"
          />

          {/* Interactive Layer */}
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            const isHovered = hoveredPoint === p;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer group"
              >
                {/* Invisible Hit Area */}
                <rect
                    x={p.x - (VIEWBOX_WIDTH / points.length / 2)}
                    y="0"
                    width={VIEWBOX_WIDTH / points.length}
                    height={VIEWBOX_HEIGHT}
                    fill="transparent"
                />

                {/* Visible Point (Only last or hovered) */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 2.5 : (isLast ? 2 : 0)}
                  fill={isLast || isHovered ? "#0066ff" : "transparent"}
                  stroke="white"
                  strokeWidth={0.5}
                  className={`transition-all duration-200 ${isHovered || isLast ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Vertical Cursor Line (Only hovered) */}
                 {isHovered && (
                    <line
                        x1={p.x}
                        y1={p.y}
                        x2={p.x}
                        y2={VIEWBOX_HEIGHT}
                        stroke="#0066ff"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                        className="opacity-50"
                    />
                 )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-surface-dark/90 backdrop-blur-sm text-white text-xs rounded-md px-2 py-1 pointer-events-none shadow-xl border border-white/10 z-20 whitespace-nowrap transition-all duration-75"
            style={{
              left: `${(hoveredPoint.x / VIEWBOX_WIDTH) * 100}%`,
              top: `${(hoveredPoint.y / VIEWBOX_HEIGHT) * 100}%`,
              transform: `translate(${hoveredPoint.x > VIEWBOX_WIDTH / 2 ? '-100%' : '0%'}, -130%)`,
              marginLeft: hoveredPoint.x > VIEWBOX_WIDTH / 2 ? '-8px' : '8px'
            }}
          >
            <div className="font-bold flex items-center gap-2">
                <span>{hoveredPoint.data.value}%</span>
            </div>
            <div className="text-[10px] text-gray-300">
              {hoveredPoint.data.label}
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
          animation: draw 2s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.2s;
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
