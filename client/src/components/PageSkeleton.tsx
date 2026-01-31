import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarSkeleton from './SidebarSkeleton';
import DashboardSkeleton from './DashboardSkeleton';
import AuthSkeleton from './AuthSkeleton';
import ChapterSelectionSkeleton from './ChapterSelectionSkeleton';
import PracticeSkeleton from './PracticeSkeleton';

const PageSkeleton: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;

    // 1. Auth Routes (Login, Register) - Full Page, No Sidebar
    if (path === '/login' || path === '/register') {
        return <AuthSkeleton />;
    }

    // 2. Practice Routes - Distinct layout from sidebar apps
    // Matches /pyq-2026/:subject/practice/:chapterCode
    if (path.includes('/practice/')) {
        return <PracticeSkeleton />;
    }

    // 3. Chapter Selection Routes (Bubble Cloud)
    // Matches /subjects/:subject/:grade or /pyq-2026/:subject (but not nested practice)
    // Careful with regex or logic overlapping
    const isChapterSelection =
        (path.startsWith('/subjects/') && path.split('/').length === 4) || // /subjects/math/12
        (path.startsWith('/pyq-2026/') && !path.includes('/practice'));    // /pyq-2026/math

    if (isChapterSelection) {
        // Chapter Selection can have sidebar on desktop? Yes, usually.
        // Let's reuse the sidebar wrapper structure but swap the inner content.
        // Actually, ChapterSelection page HAS a sidebar in App.tsx structure? 
        // Yes, it's inside RequireAuth which is inside the main Routes.
        // But the Sidebar component itself renders conditionally in AppContent based on loading state...
        // Wait. App.tsx: `if (loading) return <PageSkeleton />`.
        // So PageSkeleton REPLACES the entire App layout including sidebar availability logic?
        // Yes. So PageSkeleton MUST provide the sidebar structure itself if the target page has one.
    }

    if (isChapterSelection) {
        return (
            <div className="min-h-screen flex flex-col md:flex-row relative">
                <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>
                <SidebarSkeleton />
                <main className="flex-1 w-full relative">
                    <ChapterSelectionSkeleton />
                </main>
            </div>
        );
    }

    // 4. Default / Dashboard / Generic Pages (Sidebar + Content)
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
