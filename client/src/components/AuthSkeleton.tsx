import React from 'react';

const AuthSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Background Grid - mimic AppLayout */}
            <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10 opacity-60"></div>

            {/* Card Skeleton */}
            <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-2xl relative z-10 mx-4">
                {/* Logo Placeholder */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>

                {/* Title Placeholder */}
                <div className="h-8 w-48 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-64 mx-auto bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-8"></div>

                {/* Input Fields */}
                <div className="space-y-5">
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>

                    {/* Action Button */}
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mt-6"></div>
                </div>

                {/* Footer Link */}
                <div className="mt-6 flex justify-center">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthSkeleton;
