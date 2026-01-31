import React from 'react';

const ChapterSelectionSkeleton: React.FC = () => {
    // Generate random positions for bubble placeholders to mimic phyllotaxis or random scattered look
    const bubbles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() > 0.5 ? 'w-24 h-24' : 'w-32 h-32',
        left: `${Math.random() * 60 + 20}%`,
        top: `${Math.random() * 60 + 20}%`,
        delay: i * 0.1
    }));

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Header Skeleton */}
            <div className="p-8 z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-4"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Bubble Cloud Area */}
            <div className="flex-1 relative mx-8 mb-8 rounded-3xl border border-border-light/30 dark:border-border-dark/30 bg-surface-light/30 dark:bg-surface-dark/30 overflow-hidden">
                {/* Center generic bubble */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-slate-200/50 dark:bg-slate-700/50 animate-pulse blur-3xl"></div>

                {/* Scattered Bubbles */}
                {bubbles.map((b) => (
                    <div
                        key={b.id}
                        className={`absolute rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse opacity-60 ${b.size}`}
                        style={{
                            left: b.left,
                            top: b.top,
                            animationDelay: `${b.delay}s`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    ></div>
                ))}

                {/* Floating controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default ChapterSelectionSkeleton;
