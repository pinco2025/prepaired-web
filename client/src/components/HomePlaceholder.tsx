import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="flex-grow flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark mb-6">
            Welcome to <span className="text-primary">prepAIred</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary-light dark:text-text-secondary-dark mb-10 leading-relaxed">
            Your personal AI-powered exam preparation assistant. <br className="hidden sm:block" />
            Sign up or log in to access your personalized dashboard and start learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium hover:bg-background-light dark:hover:bg-background-dark transition-colors shadow-sm"
             >
                Log In
             </button>
             <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
             >
                Sign Up
             </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePlaceholder;
