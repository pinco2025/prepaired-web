import React from 'react';

const HomePlaceholder: React.FC = () => {
  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Welcome to prepAIred</h1>
          <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark">
            This is the public home page placeholder. Sign up or log in to access your dashboard.
          </p>
        </div>
      </div>
    </main>
  );
};

export default HomePlaceholder;
