import React from 'react';

const RecentActivity = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Recent Activity</h2>
      <ul className="divide-y divide-border-light dark:divide-border-dark">
        <li className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium">Mock Test - Physics #3</p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Completed on Oct 26</p>
          </div>
          <span className="font-semibold text-green-600 dark:text-green-400">Score: 85%</span>
        </li>
        <li className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium">Practice: Organic Chemistry</p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Completed on Oct 25</p>
          </div>
          <span className="font-semibold text-orange-500 dark:text-orange-400">Accuracy: 72%</span>
        </li>
        <li className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium">Full Syllabus Test #1</p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Completed on Oct 24</p>
          </div>
          <span className="font-semibold text-red-500 dark:text-red-400">Score: 64%</span>
        </li>
      </ul>
    </div>
  );
};

export default RecentActivity;
