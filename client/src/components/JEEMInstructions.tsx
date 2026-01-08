import React from 'react';
import { Test } from '../data';
import { formatDuration } from '../utils/formatters';

interface JEEMInstructionsProps {
  test: Test;
  onStartTest: () => void;
}

const JEEMInstructions: React.FC<JEEMInstructionsProps> = ({ test, onStartTest }) => {
  return (
    <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-8 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark tracking-tight">{test.title}</h1>
      </div>
      <div className="mb-8 border-b border-border-light dark:border-border-dark pb-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">timer</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Duration</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{formatDuration(test.duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">quiz</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Questions</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{test.totalQuestions}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">rule</span>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Marking Scheme</p>
              <p className="font-semibold text-text-light dark:text-text-dark">{test.markingScheme}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">Subject Specific Instructions</h2>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Physics / Chemistry / Mathematics</p>
        </div>
        <div className="mb-8 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            SECTION A <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal text-sm sm:text-base ml-1">(Maximum Marks: 80)</span>
          </h3>
          <ul className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark list-disc list-outside ml-4 mb-6 leading-relaxed">
            <li>This Section contains <strong className="text-text-light dark:text-text-dark">Twenty (20)</strong> questions for each subject.</li>
            <li>Each question has four options. <strong className="text-text-light dark:text-text-dark">ONLY ONE</strong> of these four options is the most appropriate or best answer, which will be considered the correct answer.</li>
            <li>Candidates are advised to do the calculations with the constants given (if any) in the questions. The answer should be rounded off to the nearest Integer.</li>
            <li>The answer to each question will be evaluated according to the following Marking Scheme:</li>
          </ul>
          <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-light dark:text-text-dark w-1/3">Result</th>
                  <th className="px-4 py-3 text-center font-semibold text-text-light dark:text-text-dark w-24">Marks</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-light dark:text-text-dark">Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">Full Marks</td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-bold">+4</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Correct answer</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">No Mark</td>
                  <td className="px-4 py-3 text-center text-text-secondary-light dark:text-text-secondary-dark">0</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Unanswered / Marked for review</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">Minus One Mark</td>
                  <td className="px-4 py-3 text-center text-red-500 dark:text-red-400 font-bold">-1</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Incorrect answer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-8 p-6 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            SECTION B <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal text-sm sm:text-base ml-1">(Maximum Marks: 20)</span>
          </h3>
          <ul className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark list-disc list-outside ml-4 mb-6 leading-relaxed">
            <li>This Section contains <strong className="text-text-light dark:text-text-dark">Ten (10)</strong> questions. Out of these Ten (10) questions, only <strong className="text-text-light dark:text-text-dark">Five (05)</strong> Questions need to be attempted.</li>
            <li>Candidates are advised to do the calculations with the constants given (if any) in the questions. The answer should be rounded off to the nearest Integer.</li>
            <li>For each question, enter the correct integer value of the answer using the mouse and the on-screen virtual numeric keypad in the place designated to enter the answer.</li>
            <li>The answer to each question will be evaluated according to the following Marking Scheme:</li>
          </ul>
          <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-light dark:text-text-dark w-1/3">Result</th>
                  <th className="px-4 py-3 text-center font-semibold text-text-light dark:text-text-dark w-24">Marks</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-light dark:text-text-dark">Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">Full Marks</td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-bold">+4</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Correct answer</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">No Mark</td>
                  <td className="px-4 py-3 text-center text-text-secondary-light dark:text-text-secondary-dark">0</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Unanswered / Marked for review</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">Minus One Mark</td>
                  <td className="px-4 py-3 text-center text-red-500 dark:text-red-400 font-bold">-1</td>
                  <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark">Incorrect answer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">Any given graphs are not to scale</p>
        </div>
      </div>
      <div className="text-center">
        <button
            onClick={onStartTest}
            className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-light dark:focus:ring-offset-surface-dark transition-colors duration-300">
            Start Test
            <span className="material-symbols-outlined ml-2">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default JEEMInstructions;