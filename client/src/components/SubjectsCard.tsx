import React from 'react';
import SubjectBubble from './SubjectBubble';

const colorMap: { [key: string]: { [key: string]: string; bg: string; border: string; shadow: string; liquid1: string; liquid2: string } } = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-100 dark:border-blue-800/30',
    shadow: 'shadow-blue-500/10',
    liquid1: 'bg-blue-500',
    liquid2: 'bg-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-100 dark:border-green-800/30',
    shadow: 'shadow-green-500/10',
    liquid1: 'bg-green-500',
    liquid2: 'bg-green-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-100 dark:border-orange-800/30',
    shadow: 'shadow-orange-500/10',
    liquid1: 'bg-orange-500',
    liquid2: 'bg-orange-400',
  },
};

interface SubjectsCardProps {
  averages?: {
    physics: number;
    chemistry: number;
    maths: number;
  };
}

const SubjectsCard: React.FC<SubjectsCardProps> = ({ averages }) => {
  // We don't need local state for animation here anymore as SubjectBubble handles it with useCountUp

  const subjectsData = [
    { name: 'Physics', topic: 'Avg Score', percentage: averages?.physics || 0, color: 'blue' },
    { name: 'Chemistry', topic: 'Avg Score', percentage: averages?.chemistry || 0, color: 'green' },
    { name: 'Maths', topic: 'Avg Score', percentage: averages?.maths || 0, color: 'orange' },
  ];

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-surface-light dark:bg-surface-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col justify-between h-full min-h-0">
      <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-text-light dark:text-text-dark">Subject Average Score</h2>
        <button className="text-xs sm:text-sm font-medium text-primary hover:bg-primary/5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg transition-colors">View Details</button>
      </div>
      <div className="flex-1 flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-10 px-1 sm:px-2 py-2 sm:py-4 overflow-visible">
        {subjectsData.map((subject, index) => {
          const colors = colorMap[subject.color];
          return (
            <SubjectBubble
              key={index}
              name={subject.name}
              topic={subject.topic}
              percentage={subject.percentage}
              colorClasses={colors}
              sizeClass="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
            />
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsCard;
