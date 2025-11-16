import React from 'react';
import { Link } from 'react-router-dom';
import { testsData } from '../data';

const Tests: React.FC = () => {
  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-light dark:text-text-dark tracking-tight">Select Your Test</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-lg">Choose a category to begin your assessment.</p>
          </div>
          <div className="space-y-8">
            {testsData.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-4 flex items-center gap-3">
                  <span className="material-icons-outlined text-primary text-3xl">{category.icon}</span>
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tests.map((test) => (
                    <Link
                      key={test.id}
                      data-testid={`test-link-${test.id}`}
                      to={`/tests/${test.id}`}
                      className="group block p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-transparent hover:border-primary dark:hover:border-primary transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{test.title}</h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{test.description}</p>
                        </div>
                        <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">arrow_forward</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-4 flex items-center gap-3">
                <span className="material-icons-outlined text-primary text-3xl">folder_open</span>
                Chapter-wise Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a className="group block p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-transparent hover:border-primary dark:hover:border-primary transition-all duration-300" href="#">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Physics</h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">24 Chapters</p>
                    </div>
                    <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                </a>
                <a className="group block p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-transparent hover:border-primary dark:hover:border-primary transition-all duration-300" href="#">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Chemistry</h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">30 Chapters</p>
                    </div>
                    <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                </a>
                <a className="group block p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-transparent hover:border-primary dark:hover:border-primary transition-all duration-300" href="#">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Mathematics</h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">16 Chapters</p>
                    </div>
                    <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Tests;
