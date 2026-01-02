import React, { useState, useEffect } from 'react';
import SubjectBubble from './SubjectBubble';

const subjectsData = [
  { name: 'Physics', topic: 'Electrostatics', percentage: 78, color: 'blue' },
  { name: 'Chemistry', topic: 'Chemical Bonding', percentage: 64, color: 'green' },
  { name: 'Maths', topic: 'Calculus', percentage: 42, color: 'orange' },
];

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

const SubjectsCard: React.FC = () => {
    // We don't need local state for animation here anymore as SubjectBubble handles it with useCountUp
    // But we still render the list

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col justify-between h-full min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Subjects</h2>
        <button className="text-sm font-medium text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors">View Details</button>
      </div>
      <div className="flex-1 flex items-center justify-around gap-4 px-2 overflow-hidden">
        {subjectsData.map((subject, index) => {
          const colors = colorMap[subject.color];
          return (
            <SubjectBubble
                key={index}
                name={subject.name}
                topic={subject.topic}
                percentage={subject.percentage}
                colorClasses={colors}
                sizeClass="w-24 h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40"
            />
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsCard;
