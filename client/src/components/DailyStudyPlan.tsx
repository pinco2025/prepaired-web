import React from 'react';
import { studyPlan, StudyPlanItem } from '../data';

const colorMap: { [key: string]: { icon: string; button: string } } = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    button: 'bg-primary',
  },
  'green-500': {
    icon: 'bg-green-500/10 text-green-500',
    button: 'bg-green-500',
  },
  'orange-500': {
    icon: 'bg-orange-500/10 text-orange-500',
    button: 'bg-orange-500',
  },
};

const DailyStudyPlan: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Daily Study Plan
      </h2>
      <div className="space-y-4">
        {studyPlan.map((item: StudyPlanItem, index: number) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg"
          >
            <div
              className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full ${
                colorMap[item.buttonColor]?.icon || ''
              }`}
            >
              <span className="material-icons-outlined">{item.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold">{`${item.subject}: ${item.topic}`}</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {item.task}
              </p>
            </div>
            <button
              className={`ml-auto text-white font-medium px-4 py-2 text-sm rounded-md hover:opacity-90 transition-opacity whitespace-nowrap ${
                colorMap[item.buttonColor]?.button || ''
              }`}
            >
              {item.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyStudyPlan;
