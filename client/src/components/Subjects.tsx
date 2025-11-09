import React from 'react';

const Subjects: React.FC = () => {
  return (
    <main className="flex-grow flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Subjects</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Choose a subject to start your preparation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <a
            className="group block bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark subject-card-hover border border-transparent hover:border-primary dark:hover:border-primary"
            href="#"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <span
                  className="material-icons-outlined text-4xl text-blue-500 dark:text-blue-400"
                  style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  rocket_launch
                </span>
              </div>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">Physics</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Motion, Energy, Waves, &amp; more.
              </p>
              <span className="mt-4 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Start Learning →
              </span>
            </div>
          </a>
          <a
            className="group block bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark subject-card-hover border border-transparent hover:border-green-500 dark:hover:border-green-500"
            href="#"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <span
                  className="material-icons-outlined text-4xl text-green-500 dark:text-green-400"
                  style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  science
                </span>
              </div>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">Chemistry</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Atoms, Reactions, Bonds, &amp; more.
              </p>
              <span className="mt-4 text-green-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Start Learning →
              </span>
            </div>
          </a>
          <a
            className="group block bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark subject-card-hover border border-transparent hover:border-orange-500 dark:hover:border-orange-500"
            href="#"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                <span
                  className="material-icons-outlined text-4xl text-orange-500 dark:text-orange-400"
                  style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  calculate
                </span>
              </div>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">Maths</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Algebra, Calculus, Geometry, &amp; more.
              </p>
              <span className="mt-4 text-orange-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Start Learning →
              </span>
            </div>
          </a>
          <a
            className="group block bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark subject-card-hover border border-transparent hover:border-purple-500 dark:hover:border-purple-500"
            href="#"
          >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                  <span
                    className="material-icons-outlined text-4xl text-purple-500 dark:text-purple-400"
                    style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                  >
                    translate
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">English</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Grammar, Vocabulary, Reading, &amp; more.
                </p>
                <span className="mt-4 text-purple-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Learning →
                </span>
              </div>
          </a>
        </div>
      </div>
    </main>
  );
};

export default Subjects;
