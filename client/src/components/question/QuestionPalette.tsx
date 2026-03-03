import React from 'react';
import { QuestionStatus, PaletteVariant } from './types';

interface QuestionPaletteProps {
    total: number;
    current: number;
    onSelect: (index: number) => void;
    statuses?: Record<number, QuestionStatus>;
    columns?: number;
    showLegend?: boolean;
    variant?: PaletteVariant;
    onClose?: () => void;
}

/**
 * Question navigation grid/palette.
 * Supports sidebar, overlay, and header variants.
 */
const QuestionPalette: React.FC<QuestionPaletteProps> = ({
    total,
    current,
    onSelect,
    statuses = {},
    columns = 5,
    showLegend = true,
    variant = 'sidebar',
    onClose,
}) => {
    const getButtonClasses = (index: number): string => {
        const isCurrent = current === index;
        const status = statuses[index] || 'not-visited';

        let baseClass = 'font-bold text-sm flex items-center justify-center transition-all ';

        // Size based on variant
        if (variant === 'header') {
            baseClass += 'w-7 h-7 rounded-full text-xs ';
        } else {
            baseClass += 'w-10 h-10 rounded-xl ';
        }

        // Current question ring
        if (isCurrent) {
            baseClass += 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 z-10 ';
            if (variant === 'header') {
                baseClass += 'scale-110 shadow-lg bg-white dark:bg-slate-800 text-primary ';
            } else {
                baseClass += 'bg-primary text-white shadow-md shadow-primary/30 ';
            }
            return baseClass;
        }

        // Status-based styling
        switch (status) {
            case 'correct':
                return baseClass + 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
            case 'wrong':
                return baseClass + 'bg-red-500 text-white shadow-md shadow-red-500/20';
            case 'answered':
                return baseClass + 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            case 'not-answered':
                return baseClass + 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
            case 'marked-for-review':
                return baseClass + 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
            case 'unattempted':
                return baseClass + 'bg-amber-400 text-white shadow-md shadow-amber-500/20';
            default:
                return baseClass + 'border border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary/50 bg-slate-50 dark:bg-slate-800/50';
        }
    };

    const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

    return (
        <div className="h-full flex flex-col">
            {/* Header with close button for overlay/sidebar */}
            {(variant === 'sidebar' || variant === 'overlay') && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-light dark:text-text-dark">Question Palette</h3>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className="grid gap-2 pb-4" style={gridStyle}>
                {Array.from({ length: total }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(idx)}
                        className={getButtonClasses(idx)}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            {/* Legend */}
            {showLegend && variant !== 'header' && (
                <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" />
                        <span className="text-text-secondary-light">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
                        <span className="text-text-secondary-light">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800" />
                        <span className="text-text-secondary-light">Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50" />
                        <span className="text-text-secondary-light">Not Visited</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionPalette;
