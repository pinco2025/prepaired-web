import React from 'react';

const SidebarSkeleton: React.FC = () => {
    return (
        <aside className="hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 ml-4 my-4 rounded-3xl border border-border-light dark:border-border-dark shadow-xl bg-surface-light dark:bg-surface-dark relative w-72 animate-pulse">
            <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark rounded-3xl p-6">
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-between shrink-0 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 space-y-4">
                    {/* Menu Items */}
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                        <div key={item} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0"></div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto space-y-4 pt-4 border-t border-border-light dark:border-border-dark">
                    {/* Dark Mode */}
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-2 rounded-xl border border-border-light dark:border-border-dark">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                        <div className="flex-1">
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-md mb-1"></div>
                            <div className="h-2 w-28 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidebarSkeleton;
