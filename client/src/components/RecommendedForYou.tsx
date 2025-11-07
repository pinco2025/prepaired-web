import React from 'react';
import { recommendations, RecommendationItem } from '../data';

const RecommendedForYou: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Recommended for You
      </h2>
      <div className="space-y-4">
        {recommendations.map((item: RecommendationItem, index: number) => (
          <div
            key={index}
            className="p-4 border border-border-light dark:border-border-dark rounded-lg"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 mb-3">
              {item.description}
            </p>
            <a
              className="text-sm font-semibold text-primary hover:underline"
              href="#"
            >
              {item.actionText}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedForYou;
