import React from 'react';
import SidebarSkeleton from './SidebarSkeleton';
import DashboardSkeleton from './DashboardSkeleton';

const PageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            {/* Background layer */}
            <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>

            {/* Sidebar Skeleton (Desktop only) */}
            <SidebarSkeleton />

            {/* Main Content Area */}
            <main className="flex-1 w-full relative">
                {/* Mobile Header Skeleton */}
                <div className="md:hidden bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                    </div>
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>

                {/* Content Skeleton - Reuse DashboardSkeleton as a generic content placeholder */}
                <DashboardSkeleton />
            </main>
        </div>
    );
};

export default PageSkeleton;
