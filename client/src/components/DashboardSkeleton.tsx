import React from 'react';

const Shimmer: React.FC = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>
);

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 ${className}`}>
    <Shimmer />
  </div>
);

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <SkeletonBox className="h-8 w-3/4 md:w-1/3 mb-2" />
          <SkeletonBox className="h-4 w-1/2 md:w-1/4" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
          <SkeletonBox className="col-span-1 md:col-span-12 lg:col-span-7 h-[380px]" />
          <SkeletonBox className="col-span-1 md:col-span-12 lg:col-span-5 h-[380px]" />
          <SkeletonBox className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px]" />
          <SkeletonBox className="col-span-1 md:col-span-6 lg:col-span-4 h-[300px]" />
          <SkeletonBox className="col-span-1 md:col-span-12 lg:col-span-4 h-[300px]" />
        </div>
      </div>
    </div>
  );
};

// Add shimmer keyframes to index.css or a global style sheet
/*
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
*/

export default DashboardSkeleton;
