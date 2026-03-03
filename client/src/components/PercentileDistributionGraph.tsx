import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PercentileBracket {
    percentile: number;
    marks: number;
}

interface PercentileBracketPair {
    score: number;
    nearest_above: PercentileBracket | null;
    nearest_below: PercentileBracket | null;
}

interface PercentileReport {
    overall: PercentileBracketPair;
    subjects: {
        Mathematics: PercentileBracketPair;
        Physics: PercentileBracketPair;
        Chemistry: PercentileBracketPair;
    };
}

interface Props {
    percentileReport: PercentileReport;
    totalMarks?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DOT_CONFIG = [
    { key: 'overall', label: 'Overall', color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { key: 'Physics', label: 'Physics', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'Chemistry', label: 'Chemistry', color: '#a855f7', gradient: ['#a855f7', '#c084fc'] },
    { key: 'Mathematics', label: 'Mathematics', color: '#f97316', gradient: ['#f97316', '#fb923c'] },
] as const;

// ─── Gaussian math ──────────────────────────────────────────────────────────

/** Standard normal PDF */
function gaussianPDF(x: number, mean: number, sigma: number): number {
    const exp = -0.5 * ((x - mean) / sigma) ** 2;
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.E ** exp;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Interpolate estimated percentile from nearest_above & nearest_below */
function estimatePercentile(pair: PercentileBracketPair): number {
    const { nearest_above, nearest_below } = pair;
    if (nearest_above && nearest_below) {
        // Linear interpolation between the two brackets
        const range = nearest_above.marks - nearest_below.marks;
        if (range === 0) return nearest_above.percentile;
        const t = (pair.score - nearest_below.marks) / range;
        return nearest_below.percentile + t * (nearest_above.percentile - nearest_below.percentile);
    }
    if (nearest_above) return nearest_above.percentile;
    if (nearest_below) return nearest_below.percentile;
    return 50;
}

// ─── Component ───────────────────────────────────────────────────────────────

const PercentileDistributionGraph: React.FC<Props> = ({ percentileReport, totalMarks = 300 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 320 });
    const [hoveredDot, setHoveredDot] = useState<string | null>(null);
    const [animationProgress, setAnimationProgress] = useState(0);

    // ── Responsive sizing ────────────────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                setDimensions({ width: Math.max(w, 300), height: Math.min(360, Math.max(240, w * 0.36)) });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ── Entrance animation ───────────────────────────────────────────
    useEffect(() => {
        let raf: number;
        let start: number;
        const duration = 1200;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ts - start;
            const t = Math.min(1, elapsed / duration);
            // Ease-out cubic
            setAnimationProgress(1 - (1 - t) ** 3);
            if (t < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

    // ── Compute dot data ─────────────────────────────────────────────
    const dots = useMemo(() => {
        return DOT_CONFIG.map(cfg => {
            const pair: PercentileBracketPair =
                cfg.key === 'overall'
                    ? percentileReport.overall
                    : percentileReport.subjects[cfg.key as keyof typeof percentileReport.subjects];
            const pctile = estimatePercentile(pair);
            return { ...cfg, score: pair.score, percentile: pctile, pair };
        });
    }, [percentileReport]);

    // ── Zoom State ───────────────────────────────────────────────────
    const [zoomDomain, setZoomDomain] = useState<[number, number]>([0, 100]);

    // Initial load: Zoom to cluster
    useEffect(() => {
        const p_min = Math.min(...dots.map(d => d.percentile));
        const p_max = Math.max(...dots.map(d => d.percentile));
        const spread = p_max - p_min;
        const padding = Math.max(10, spread * 0.4);
        let zMin = Math.max(0, p_min - padding);
        let zMax = Math.min(100, p_max + padding);
        if (zMax - zMin < 20) {
            const center = (zMin + zMax) / 2;
            zMin = Math.max(0, center - 10);
            zMax = Math.min(100, center + 10);
        }
        setZoomDomain([zMin, zMax]);
    }, [dots]);

    // Center of user's dots
    const clusterCenter = useMemo(() => {
        if (!dots.length) return 50;
        const p_min = Math.min(...dots.map(d => d.percentile));
        const p_max = Math.max(...dots.map(d => d.percentile));
        return (p_min + p_max) / 2;
    }, [dots]);

    const handleZoomIn = () => {
        setZoomDomain(([minX, maxX]) => {
            const range = (maxX - minX) * 0.7; // zoom in by 30%
            let newMin = clusterCenter - range / 2;
            let newMax = clusterCenter + range / 2;
            if (newMin < 0) {
                newMin = 0;
                newMax = Math.min(100, range);
            }
            if (newMax > 100) {
                newMax = 100;
                newMin = Math.max(0, 100 - range);
            }
            return [newMin, newMax];
        });
    };

    const handleZoomOut = () => {
        setZoomDomain(([minX, maxX]) => {
            const range = (maxX - minX) * 1.5; // zoom out by 50%
            let newMin = clusterCenter - range / 2;
            let newMax = clusterCenter + range / 2;
            if (newMin < 0) {
                newMin = 0;
                newMax = Math.min(100, range);
            }
            if (newMax > 100) {
                newMax = 100;
                newMin = Math.max(0, 100 - range);
            }
            return [newMin, newMax];
        });
    };

    const handleResetZoom = () => {
        if (!dots.length) {
            setZoomDomain([0, 100]);
            return;
        }
        const p_min = Math.min(...dots.map(d => d.percentile));
        const p_max = Math.max(...dots.map(d => d.percentile));
        const spread = p_max - p_min;
        const padding = Math.max(10, spread * 0.4);
        let zMin = Math.max(0, p_min - padding);
        let zMax = Math.min(100, p_max + padding);
        if (zMax - zMin < 20) {
            const center = (zMin + zMax) / 2;
            zMin = Math.max(0, center - 10);
            zMax = Math.min(100, center + 10);
        }
        setZoomDomain([zMin, zMax]);
    };

    // ── Chart geometry ───────────────────────────────────────────────
    const isMobile = dimensions.width < 500;
    const margin = { top: 40, right: isMobile ? 24 : 30, bottom: 50, left: isMobile ? 24 : 30 };
    const chartW = dimensions.width - margin.left - margin.right;
    const chartH = dimensions.height - margin.top - margin.bottom;

    // We'll use a percentile X axis from 0 → 100
    // Mean at 50th percentile, σ chosen so curve looks good
    const mean = 50;
    const sigma = 16;

    // localPeakY is the maximum height of the gaussian curve *within the current zoom window*
    // This allows the curve to stretch vertically instead of laying flat when zoomed into the tails.
    const localPeakY = useMemo(() => {
        const [zMin, zMax] = zoomDomain;
        if (zMin <= mean && zMax >= mean) {
            return gaussianPDF(mean, mean, sigma);
        } else if (zMax < mean) {
            return gaussianPDF(zMax, mean, sigma);
        } else {
            return gaussianPDF(zMin, mean, sigma);
        }
    }, [zoomDomain]);

    // Scale functions based on current zoom domain
    const xScale = useCallback((pctile: number) => {
        const [zMin, zMax] = zoomDomain;
        const pRange = zMax - zMin;
        return margin.left + ((pctile - zMin) / pRange) * chartW;
    }, [margin.left, chartW, zoomDomain]);

    const yScale = useCallback((pdf: number) => margin.top + chartH - (pdf / localPeakY) * chartH * 0.92, [margin.top, chartH, localPeakY]);

    // Build the curve path
    const curvePath = useMemo(() => {
        const points: string[] = [];
        const steps = 200;
        const [zMin, zMax] = zoomDomain;
        for (let i = 0; i <= steps; i++) {
            const pctile = zMin + (i / steps) * (zMax - zMin);
            const x = xScale(pctile);
            const y = yScale(gaussianPDF(pctile, mean, sigma));
            points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
        }
        return points.join(' ');
    }, [xScale, yScale, zoomDomain]);

    // Build filled area path
    const areaPath = useMemo(() => {
        const baseline = margin.top + chartH;
        let d = `M${xScale(zoomDomain[0]).toFixed(2)},${baseline}`;
        const steps = 200;
        const [zMin, zMax] = zoomDomain;
        for (let i = 0; i <= steps; i++) {
            const pctile = zMin + (i / steps) * (zMax - zMin);
            const x = xScale(pctile);
            const y = yScale(gaussianPDF(pctile, mean, sigma));
            d += ` L${x.toFixed(2)},${y.toFixed(2)}`;
        }
        d += ` L${xScale(zoomDomain[1]).toFixed(2)},${baseline} Z`;
        return d;
    }, [xScale, yScale, chartH, margin.top, zoomDomain]);

    // ── X-axis ticks ─────────────────────────────────────────────────
    const allTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9];

    // Filter ticks so they don't overlap (prioritizing the right-most higher percentiles)
    const visibleTicks = useMemo(() => {
        const [zMin, zMax] = zoomDomain;
        const inDomain = allTicks.filter(t => t >= zMin && t <= zMax);

        const MIN_PX_DISTANCE = 45; // increased to 45px to prevent clutter
        const valid: number[] = [];

        // Iterate backwards to prioritize rendering 99.9 over 99 if they clash
        for (let i = inDomain.length - 1; i >= 0; i--) {
            const t = inDomain[i];
            const x = xScale(t);
            // check against already accepted ticks
            const conflict = valid.some(v => Math.abs(xScale(v) - x) < MIN_PX_DISTANCE);
            if (!conflict) {
                valid.push(t);
            }
        }
        return valid.sort((a, b) => a - b);
    }, [zoomDomain, xScale]);

    // ── Helper: bracket info text ────────────────────────────────────
    const bracketText = (pair: PercentileBracketPair): string => {
        const above = pair.nearest_above;
        const below = pair.nearest_below;
        if (above && below) {
            return `${below.percentile}-${above.percentile}%ile`;
        }
        if (above) return `≥ ${above.percentile}%ile`;
        if (below) return `≤ ${below.percentile}%ile`;
        return '';
    };

    return (
        <div className="glass-card p-5 md:p-6 w-full" ref={containerRef}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-base font-bold text-text-light dark:text-text-dark font-display flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">insights</span>
                        Percentile Distribution
                    </h3>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                        Your position on the score distribution curve for this shift
                    </p>
                </div>
                {/* Zoom Controls & Legend Wrapper */}
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button type="button" onClick={handleZoomOut} className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:shadow-sm transition-all" title="Zoom Out">
                            <span className="material-symbols-outlined text-sm sm:text-base">remove</span>
                        </button>
                        <button type="button" onClick={handleResetZoom} className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:shadow-sm transition-all" title="Reset View">
                            <span className="material-symbols-outlined text-sm sm:text-base">filter_center_focus</span>
                        </button>
                        <button type="button" onClick={handleZoomIn} className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:shadow-sm transition-all" title="Zoom In">
                            <span className="material-symbols-outlined text-sm sm:text-base">add</span>
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-end gap-x-2.5 sm:gap-x-4 gap-y-1.5 mt-1 sm:mt-0 opacity-90 text-[10px] sm:text-xs">
                        {DOT_CONFIG.map(cfg => (
                            <button
                                key={cfg.key}
                                type="button"
                                onMouseEnter={() => setHoveredDot(cfg.key)}
                                onMouseLeave={() => setHoveredDot(null)}
                                onClick={() => setHoveredDot(hoveredDot === cfg.key ? null : cfg.key)}
                                className={`flex items-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer select-none p-0.5 sm:p-0
                                    ${hoveredDot === cfg.key
                                        ? 'opacity-100 scale-105'
                                        : hoveredDot
                                            ? 'opacity-40'
                                            : 'opacity-80 hover:opacity-100'}`}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 shrink-0"
                                    style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
                                />
                                <span className="text-text-light dark:text-text-dark">{cfg.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SVG Graph */}
            <svg
                ref={svgRef}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                className="w-full"
                style={{ height: dimensions.height }}
                onClick={() => setHoveredDot(null)}
            >
                <defs>
                    <clipPath id="graphClip">
                        <rect x={margin.left} y={0} width={chartW} height={dimensions.height} />
                    </clipPath>
                    {/* Curve gradient */}
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Area fill gradient */}
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Drop shadow for tooltip */}
                    <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.04" />
                    </filter>
                    {/* Per-dot gradients */}
                    {DOT_CONFIG.map(cfg => (
                        <radialGradient key={cfg.key} id={`dotGrad-${cfg.key}`}>
                            <stop offset="0%" stopColor={cfg.gradient[1]} />
                            <stop offset="100%" stopColor={cfg.gradient[0]} />
                        </radialGradient>
                    ))}
                </defs>

                <g clipPath="url(#graphClip)">
                    {/* Grid lines */}
                    {visibleTicks.map(t => {
                        const x = xScale(t);
                        return (
                            <line
                                key={t}
                                x1={x} y1={margin.top}
                                x2={x} y2={margin.top + chartH}
                                stroke="currentColor"
                                className="text-gray-100 dark:text-gray-800"
                                strokeWidth="1"
                                strokeDasharray={t % 10 === 0 ? "0" : "3,3"}
                            />
                        );
                    })}

                    {/* Baseline */}
                    <line
                        x1={margin.left} y1={margin.top + chartH}
                        x2={margin.left + chartW} y2={margin.top + chartH}
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="1.5"
                    />

                    {/* Area fill (animated) */}
                    <path
                        d={areaPath}
                        fill="url(#areaFill)"
                        style={{
                            opacity: animationProgress,
                            transition: 'opacity 0.3s ease'
                        }}
                    />

                    {/* Curve line (animated via dash offset) */}
                    <path
                        d={curvePath}
                        fill="none"
                        stroke="url(#curveGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            strokeDasharray: 2000,
                            strokeDashoffset: 2000 * (1 - animationProgress),
                            transition: 'stroke-dashoffset 0.1s ease',
                        }}
                    />
                </g>

                {/* X-axis tick labels */}
                <g clipPath="url(#graphClip)">
                    {visibleTicks.map(t => (
                        <text
                            key={t}
                            x={xScale(t)}
                            y={margin.top + chartH + 20}
                            textAnchor="middle"
                            className="fill-gray-400 dark:fill-gray-500"
                            fontSize="10"
                            fontFamily="Inter, sans-serif"
                            fontWeight="500"
                        >
                            {t === 99.9 ? '99.9' : t}%ile
                        </text>
                    ))}
                </g>

                {/* Axis label */}
                <text
                    x={dimensions.width / 2}
                    y={dimensions.height - 4}
                    textAnchor="middle"
                    className="fill-gray-400 dark:fill-gray-500"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    letterSpacing="0.5"
                >
                    PERCENTILE
                </text>

                <g clipPath="url(#graphClip)">
                    {dots.map((dot, idx) => {
                        const cx = xScale(dot.percentile);
                        const cy = yScale(gaussianPDF(dot.percentile, mean, sigma));
                        const isHovered = hoveredDot === dot.key;
                        const dimmed = hoveredDot !== null && !isHovered;
                        const baseWidth = isHovered ? 8 : 6;
                        const animatedCy = margin.top + chartH + (cy - margin.top - chartH) * animationProgress;

                        let tooltipX = cx;
                        const tooltipWidth = 130;
                        if (tooltipX - tooltipWidth / 2 < margin.left) tooltipX = margin.left + tooltipWidth / 2;
                        if (tooltipX + tooltipWidth / 2 > dimensions.width - margin.right) tooltipX = dimensions.width - margin.right - tooltipWidth / 2;

                        // Sleek diamond path
                        const diamondD = `M ${cx} ${animatedCy - baseWidth * 1.5} L ${cx + baseWidth} ${animatedCy} L ${cx} ${animatedCy + baseWidth * 1.5} L ${cx - baseWidth} ${animatedCy} Z`;

                        return (
                            <g
                                key={dot.key}
                                onMouseEnter={() => setHoveredDot(dot.key)}
                                onMouseLeave={() => setHoveredDot(null)}
                                onClick={(e) => { e.stopPropagation(); setHoveredDot(hoveredDot === dot.key ? null : dot.key); }}
                                style={{
                                    cursor: 'pointer',
                                    opacity: dimmed ? 0.25 : 1,
                                    transition: 'opacity 0.3s ease',
                                }}
                            >
                                {/* Vertical drop line */}
                                <line
                                    x1={cx} y1={animatedCy}
                                    x2={cx} y2={margin.top + chartH}
                                    stroke={dot.color}
                                    strokeWidth={isHovered ? 2 : 1}
                                    strokeDasharray="4,3"
                                    strokeOpacity={isHovered ? 0.7 : 0.35}
                                    style={{ transition: 'all 0.3s ease' }}
                                />
                                {/* Main diamond marker */}
                                <path
                                    d={diamondD}
                                    fill={`url(#dotGrad-${dot.key})`}
                                    stroke="white"
                                    strokeWidth="1.5"
                                    filter={isHovered ? 'url(#dotGlow)' : undefined}
                                    style={{
                                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        filter: isHovered ? `drop-shadow(0 0 8px ${dot.color}80)` : `drop-shadow(0 0 4px ${dot.color}40)`,
                                        transformOrigin: `${cx}px ${animatedCy}px`,
                                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                                    }}
                                />

                                {/* Tooltip (shown on hover) */}
                                {isHovered && animationProgress > 0.5 && (
                                    <g className="pointer-events-none">
                                        {/* Tooltip pill background */}
                                        <rect
                                            x={tooltipX - 65}
                                            y={animatedCy - 54}
                                            width={130}
                                            height={42}
                                            rx={8}
                                            fill="white"
                                            className="dark:fill-gray-800"
                                            filter="url(#tooltipShadow)"
                                            stroke={dot.color}
                                            strokeWidth="1"
                                            strokeOpacity="0.2"
                                        />
                                        {/* Tooltip arrow points down to dot */}
                                        <polygon
                                            points={`${cx - 5},${animatedCy - 13} ${cx},${animatedCy - 8} ${cx + 5},${animatedCy - 13}`}
                                            fill="white"
                                            className="dark:fill-gray-800"
                                        />
                                        {/* Label & Score */}
                                        <text
                                            x={tooltipX}
                                            y={animatedCy - 36}
                                            textAnchor="middle"
                                            className="fill-gray-900 dark:fill-gray-100"
                                            fontSize="11"
                                            fontWeight="600"
                                            fontFamily="Inter, sans-serif"
                                        >
                                            {dot.label} • {dot.score}
                                        </text>
                                        {/* Percentile info */}
                                        <text
                                            x={tooltipX}
                                            y={animatedCy - 22}
                                            textAnchor="middle"
                                            className="fill-gray-500 dark:fill-gray-400"
                                            fontSize="10"
                                            fontWeight="500"
                                            fontFamily="Inter, sans-serif"
                                        >
                                            {bracketText(dot.pair)}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Bottom summary cards */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mt-4">
                {dots.map(dot => (
                    <button
                        key={dot.key}
                        type="button"
                        onMouseEnter={() => setHoveredDot(dot.key)}
                        onMouseLeave={() => setHoveredDot(null)}
                        onClick={() => setHoveredDot(hoveredDot === dot.key ? null : dot.key)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border transition-all duration-200
                            ${hoveredDot === dot.key
                                ? 'border-opacity-100 shadow-sm scale-105'
                                : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                            }`}
                        style={{
                            borderColor: hoveredDot === dot.key ? dot.color : undefined,
                            backgroundColor: hoveredDot === dot.key ? `${dot.color}15` : undefined,
                        }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: dot.color, boxShadow: `0 0 6px ${dot.color}40` }}
                        />
                        <div className="flex items-baseline gap-1.5 flex-nowrap whitespace-nowrap">
                            <span className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium leading-none">
                                {dot.label}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-text-light dark:text-text-dark leading-none">
                                {bracketText(dot.pair)}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PercentileDistributionGraph;
