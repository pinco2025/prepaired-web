import React, { useState, useEffect } from 'react';

const subjectsData = [
  { name: 'Physics', topic: 'Electrostatics', percentage: 78, color: 'blue' },
  { name: 'Chemistry', topic: 'Chemical Bonding', percentage: 64, color: 'green' },
  { name: 'Maths', topic: 'Calculus', percentage: 42, color: 'orange' },
];

const colorMap: { [key: string]: { [key: string]: string } } = {
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
    const [subjects, setSubjects] = useState(subjectsData.map(s => ({...s, currentPercentage: 0})));

    useEffect(() => {
        const timer = setTimeout(() => {
            setSubjects(subjectsData.map(s => ({...s, currentPercentage: s.percentage})));
        }, 300);
        return () => clearTimeout(timer);
    }, []);

  return (
    <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col justify-between h-[380px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Subjects</h2>
        <button className="text-sm font-medium text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors">View Details</button>
      </div>
      <div className="flex-1 flex items-center justify-around gap-4 px-2">
        {subjects.map((subject, index) => {
          const colors = colorMap[subject.color];
          return (
            <div key={index} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 overflow-hidden transition-transform group-hover:scale-105 ${colors.bg} ${colors.border} ${colors.shadow}`}>
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-text-light dark:text-text-dark bg-surface-light/60 dark:bg-surface-dark/40 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm border border-white/20">{subject.percentage}%</span>
                </div>
                <div
                  className={`absolute bottom-0 left-[-10%] w-[120%] opacity-90 liquid-shape rotate-3 transition-all duration-1000 ease-out group-hover:rotate-1 ${colors.liquid1}`}
                  style={{ height: `${subject.currentPercentage}%` }}
                ></div>
                <div
                  className={`absolute bottom-0 left-[-10%] w-[120%] opacity-60 liquid-shape -rotate-2 transition-all duration-1000 ease-out ${colors.liquid2}`}
                  style={{ height: `${subject.currentPercentage > 4 ? subject.currentPercentage - 4 : 0}%` }}
                ></div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-base text-text-light dark:text-text-dark">{subject.name}</h3>
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{subject.topic}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsCard;
