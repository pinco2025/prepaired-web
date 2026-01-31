import React from 'react';

const PracticeSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-4 rounded-none md:rounded-3xl overflow-hidden relative bg-surface-light dark:bg-surface-dark md:border border-border-light dark:border-border-dark">

            {/* Header Skeleton */}
            <header className="h-14 border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 md:px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            </header>

            {/* Content Skeleton */}
            <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-hidden flex flex-col relative">
                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                    {/* Question Card */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark p-6 mb-4 flex-1">
                        {/* Meta tags */}
                        <div className="flex gap-2 mb-6">
                            <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                            <div className="h-6 w-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        </div>

                        {/* Question Text Lines */}
                        <div className="space-y-3 mb-8">
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 w-[90%] bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 w-[95%] bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse mb-8 opacity-50"></div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 rounded-2xl border border-border-light dark:border-border-dark p-4 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0"></div>
                                    <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <footer className="fixed bottom-0 left-0 right-0 md:static h-16 md:h-auto border-t border-border-light dark:border-border-dark flex items-center px-6 md:px-8 py-4 bg-surface-light dark:bg-surface-dark">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="w-12 h-12 md:w-32 md:h-10 rounded-full key-capsule bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="w-14 h-14 md:w-32 md:h-10 rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse"></div>
                    <div className="w-12 h-12 md:w-32 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-pulse"></div>
                </div>
            </footer>
        </div>
    );
};

export default PracticeSkeleton;
