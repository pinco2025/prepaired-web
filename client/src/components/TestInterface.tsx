import React, { useState } from 'react';

const TestInterface: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-xl shadow-card-light dark:shadow-card-dark flex flex-col">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Question 5 of 90</h2>
            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark px-3 py-1 rounded-full">Physics</span>
          </div>
          <p className="text-base text-text-light dark:text-text-dark leading-relaxed mb-8">A block of mass 'm' is placed on a smooth inclined plane of inclination θ with the horizontal. What is the acceleration of the block down the incline?</p>
          <div className="space-y-4">
            <button
              onClick={() => setSelectedOption('A')}
              className={`w-full flex items-center text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedOption === 'A'
                  ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
              }`}
            >
              <span
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${
                  selectedOption === 'A'
                    ? 'text-white bg-primary border-primary'
                    : 'text-primary border-primary'
                }`}
              >
                A
              </span>
              <span className="text-text-light dark:text-text-dark">g tan(θ)</span>
            </button>
            <button
              onClick={() => setSelectedOption('B')}
              className={`w-full flex items-center text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedOption === 'B'
                  ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
              }`}
            >
              <span
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${
                  selectedOption === 'B'
                    ? 'text-white bg-primary border-primary'
                    : 'text-primary border-primary'
                }`}
              >
                B
              </span>
              <span className="text-text-light dark:text-text-dark font-medium">g sin(θ)</span>
            </button>
            <button
              onClick={() => setSelectedOption('C')}
              className={`w-full flex items-center text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedOption === 'C'
                  ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
              }`}
            >
              <span
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${
                  selectedOption === 'C'
                    ? 'text-white bg-primary border-primary'
                    : 'text-primary border-primary'
                }`}
              >
                C
              </span>
              <span className="text-text-light dark:text-text-dark">g cos(θ)</span>
            </button>
            <button
              onClick={() => setSelectedOption('D')}
              className={`w-full flex items-center text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedOption === 'D'
                  ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
              }`}
            >
              <span
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${
                  selectedOption === 'D'
                    ? 'text-white bg-primary border-primary'
                    : 'text-primary border-primary'
                }`}
              >
                D
              </span>
              <span className="text-text-light dark:text-text-dark">g</span>
            </button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors">
            <span className="material-icons-outlined">arrow_back</span>
            Previous
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
            <span className="material-icons-outlined">bookmark_border</span>
            Mark for Review
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-white bg-primary hover:opacity-90 transition-opacity">
            Next
            <span className="material-icons-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
      <aside className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
        <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <a key={i} href="#" className={`w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors ${
              i + 1 === 1 ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500' :
              i + 1 === 3 ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500' :
              i + 1 === 4 || i + 1 === 7 ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500' :
              i + 1 === 5 ? 'bg-primary text-white ring-2 ring-primary-focus' :
              'bg-background-light dark:bg-background-dark hover:border-primary dark:hover:text-primary border border-border-light dark:border-border-dark'
            }`}>
              {i + 1}
            </a>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-500/20 border border-green-500"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500"></div>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500"></div>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark"></div>
            <span>Not Visited</span>
          </div>
        </div>
        <button className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">Submit Test</button>
      </aside>
    </div>
  );
};

export default TestInterface;
