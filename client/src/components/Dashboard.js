import React, { useState, useEffect } from 'react';
import DailyStudyPlan from './DailyStudyPlan';
import RecentActivity from './RecentActivity';
import RecommendedForYou from './RecommendedForYou';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-background-light dark:bg-background-dark">
      <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10"></div>
      <header className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border-light dark:border-border-dark shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-3 flex-shrink-0">
                <img alt="prepAIred logo" className="h-8 w-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdzj_WfIjmmM52JXz4zKQrlQgJkA4UmPvuySjzEbq9Bsdj31RsY7ncfFrEi-fD-BWSo0ZTpLvMe7hOv0DP_1JXMQbL8BW_EgaawiBsr0daDGG68D4iJN_47bGlm98RGzILkKm4sgrjxbv04CENGDP2nGSO6OWmZ8vg5Q9-vdcYbpfJrfN1QRe-Abx_bYN4iP1dZnaJMNe-Jycl4XN4_crPSiEv3ULZH5fzZGU9CbUHu7gVaJ3NCZ4o0LRozC1uo6aoEl7HLrY5k_En"/>
                <span className="text-xl font-bold text-text-light dark:text-text-dark">prep<span className="text-primary">AI</span>red</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <a className="text-sm font-semibold text-primary border-b-2 border-primary pb-1" href="#">Dashboard</a>
                <a className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors" href="#">Practice</a>
                <a className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors" href="#">Tests</a>
                <a className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors" href="#">Analytics</a>
                <a className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors" href="#">Resources</a>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
                <span className="material-icons-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button className="ml-4 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
                <img alt="User profile picture" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHE3oUlM1yUb7TA8XdWQV26WNdHzcgBDSKirGjXJIdxcOt5I09wPGatmTzwvZ-v8L8w-jPYAcySvVhjDZxdFNtQcHuxuydZ_luTJLKBeLxGz4fZl1bDm5NxbGWchY27b1ZydID7ghZJmMq6GSuBo0taVI_RRmVifP0b70PpM3btYMLVoRMdBXGhwwrDElzljgyoI9FbZIn8pSLFH0axsXyHGbcCPoCl2HG6R_vzcK3HrsyGv1OMaOwkcAXSX-uxUsV21-SnO9-vbyo"/>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Welcome back, Alex!</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Let's continue your journey to ace the JEE exam.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DailyStudyPlan />
              <RecentActivity />
            </div>
            <div className="lg:col-span-1">
              <RecommendedForYou />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
