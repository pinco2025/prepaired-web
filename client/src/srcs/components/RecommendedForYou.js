import React from 'react';

const RecommendedForYou = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Recommended for You</h2>
      <div className="space-y-4">
        <div className="p-4 border border-border-light dark:border-border-dark rounded-lg">
          <h3 className="font-semibold">Weak Topic: Rotational Motion</h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 mb-3">Focus on this area to improve your Physics score.</p>
          <a className="text-sm font-semibold text-primary hover:underline" href="#">Start Practice</a>
        </div>
        <div className="p-4 border border-border-light dark:border-border-dark rounded-lg">
          <h3 className="font-semibold">Video Lecture: p-Block Elements</h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 mb-3">A quick revision video to solidify your concepts.</p>
          <a className="text-sm font-semibold text-primary hover:underline" href="#">Watch Now</a>
        </div>
        <div className="p-4 border border-border-light dark:border-border-dark rounded-lg">
          <h3 className="font-semibold">Timed Quiz: Calculus</h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 mb-3">Challenge yourself with a 20-minute quiz.</p>
          <a className="text-sm font-semibold text-primary hover:underline" href="#">Take Quiz</a>
        </div>
      </div>
    </div>
  );
};

export default RecommendedForYou;
