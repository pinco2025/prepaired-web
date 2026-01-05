import React, { useRef, useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import useCountUp from '../hooks/useCountUp';

export interface ChartData {
    label: string;
    date: string;
    value: number;
    testId?: string;  // Test ID to display in tooltip
    trend?: 'up' | 'down' | 'neutral';  // Trend indicator for colors
}

interface PercentileCardProps {
    percentile?: number;
    historyData?: ChartData[];
}

const PercentileCard: React.FC<PercentileCardProps> = ({ percentile = 0, historyData = [] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const animatedPercentile = useCountUp(percentile);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const { width, height } = dimensions;
    const padding = 20;

    // Autoscaling Logic
    const dataValues = historyData.map(d => d.value);
    const dataMin = dataValues.length > 0 ? Math.min(...dataValues) : 0;
    const dataMax = dataValues.length > 0 ? Math.max(...dataValues) : 100;

    // Calculate dynamic range
    let minDomain = dataMin - 5;
    let maxDomain = dataMax + 5;

    // Clamp to 0-100
    minDomain = Math.max(0, minDomain);
    maxDomain = Math.min(100, maxDomain);

    // Ensure minimum spread for visual appeal
    if (maxDomain - minDomain < 20) {
        const center = (minDomain + maxDomain) / 2;
        minDomain = Math.max(0, center - 10);
        maxDomain = Math.min(100, center + 10);

        // Re-clamp if center adjustment pushed it out
        if (minDomain === 0) maxDomain = Math.min(100, minDomain + 20);
        if (maxDomain === 100) minDomain = Math.max(0, maxDomain - 20);
    }

    const minVal = minDomain;
    const maxVal = maxDomain;

    // Calculate points
    const points = historyData.map((d, i) => {
        let x;
        if (historyData.length <= 1) {
            x = width / 2; // Center if only 1 point
        } else {
            x = padding + (i * (width - 2 * padding)) / (historyData.length - 1);
        }

        // Protect against divide by zero if maxVal === minVal
        const range = maxVal - minVal || 1;
        const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);

        return { x, y, value: d.value, label: d.label, date: d.date, testId: d.testId, trend: d.trend };
    });

    // Helper to build a smooth path (Catmull-Rom like or Cubic Bezier)
    // For simplicity and "smoothness", we can use a basic cubic bezier strategy.
    // control point = previous point + (current - previous) * tension
    const buildSmoothPath = (points: { x: number, y: number }[]) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];

            // Calculate control points using a simplified tension model (0.2 is tension)
            const cp1x = p1.x + (p2.x - p0.x) * 0.15;
            const cp1y = p1.y + (p2.y - p0.y) * 0.15;
            const cp2x = p2.x - (p3.x - p1.x) * 0.15;
            const cp2y = p2.y - (p3.y - p1.y) * 0.15;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    // Create path string for the line
    const pathD = buildSmoothPath(points);

    // Create path for the area fill
    const areaPathD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
        : '';

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm">PrepAIred Percentile</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <div className="flex items-baseline text-primary"><span className="text-5xl font-bold">{animatedPercentile}</span><span className="text-3xl font-bold">%ile</span></div>
                        <span className="text-success-light dark:text-success-dark text-sm font-large">Top {Math.max(1, 100 - percentile)}%</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative" ref={containerRef}>
                {width > 0 && height > 0 && historyData.length > 0 ? (
                    <svg width={width} height={height} className="overflow-visible">
                        {/* Gradients */}
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#818CF8" />
                                <stop offset="100%" stopColor="#C084FC" />
                            </linearGradient>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Area Fill */}
                        <path
                            d={areaPathD}
                            fill="url(#areaGradient)"
                            className="animate-fade-in-up"
                        />

                        {/* Line Segments - colored by trend */}
                        {points.length > 1 && points.slice(1).map((p, i) => {
                            const prev = points[i];
                            const segmentColor = p.trend === 'up'
                                ? '#22c55e'  // green-500
                                : p.trend === 'down'
                                    ? '#ef4444'  // red-500
                                    : '#818CF8'; // primary purple
                            return (
                                <line
                                    key={i}
                                    x1={prev.x}
                                    y1={prev.y}
                                    x2={p.x}
                                    y2={p.y}
                                    stroke={segmentColor}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                />
                            );
                        })}

                        {/* Points */}
                        {points.map((p, i) => (
                            <g key={i} className="group">
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="5"
                                    className={`transition-all duration-300 group-hover:r-7 stroke-2 ${p.trend === 'up'
                                        ? 'fill-green-500 stroke-green-600'
                                        : p.trend === 'down'
                                            ? 'fill-red-500 stroke-red-600'
                                            : 'fill-primary stroke-primary-dark'
                                        }`}
                                />
                                {/* Tooltip */}
                                <foreignObject x={p.x - 40} y={p.y - 48} width="80" height="44" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
                                    <div className="flex flex-col items-center justify-center px-2 py-1.5 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark backdrop-blur-sm">
                                        <span className="text-[11px] font-semibold">{p.value}%ile</span>
                                        <span className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark">{p.testId || p.label}</span>
                                    </div>
                                </foreignObject>
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark text-sm">
                        No history data available
                    </div>
                )}
            </div>
            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default PercentileCard;
