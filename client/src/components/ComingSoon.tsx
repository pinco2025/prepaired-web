import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <main className="flex-grow flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="mb-4 text-6xl text-primary">🚀</div>
        <h1 className="text-5xl md:text-6xl font-bold text-primary">Coming Soon</h1>
        <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto">
          We're working hard to bring you this feature. Stay tuned!
        </p>
      </div>
    </main>
  );
};

export default ComingSoon;
