import React from 'react';
import { recentActivity, ActivityItem } from '../data';

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Recent Activity
      </h2>
      <ul className="divide-y divide-border-light dark:divide-border-dark">
        {recentActivity.map((item: ActivityItem, index: number) => (
          <li key={index} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {item.date}
              </p>
            </div>
            <span className={`font-semibold ${item.metricColor}`}>
              {`${item.metric}: ${item.value}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
