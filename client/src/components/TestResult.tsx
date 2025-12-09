import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Test, Question } from '../data';

interface Submission {
  id: string;
  testID: string;
  answers: Record<string, any>;
  started_at: string;
  submitted_at: string;
  score: number;
}

const subjectStyles: Record<string, { bg: string; text: string; bar: string }> = {
  Physics: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
  },
  Chemistry: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-purple-500',
  },
  Mathematics: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    bar: 'bg-orange-500',
  },
};
const defaultSubjectStyle = {
  bg: 'bg-gray-50 dark:bg-gray-900/20',
  text: 'text-gray-600 dark:text-gray-400',
  bar: 'bg-gray-500',
};

const TestResult: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!submissionId) return;

      try {
        const { data: submissionData, error: submissionError } = await supabase
          .from('student_tests')
          .select('*')
          .eq('id', submissionId)
          .single();

        if (submissionError) throw submissionError;
        setSubmission(submissionData);

        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('testID', submissionData.testID)
          .single();

        if (testError) throw testError;
        setTest(testData as Test);

      } catch (error) {
        console.error('Error fetching result data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [submissionId]);

  const allQuestions = useMemo(() => {
    if (!test || !test.questions) return [];
    return test.questions.flatMap((section: { questions: Question[] }) => section.questions);
  }, [test]);

  const analysis = useMemo(() => {
    if (!submission || !test || allQuestions.length === 0) {
      return null;
    }

    const answers = submission.answers || {};
    let correct = 0;
    let incorrect = 0;
    const attemptedCount = Object.keys(answers).length;

    allQuestions.forEach((q: Question) => {
      const userAnswer = answers[q.uuid];
      if (userAnswer !== undefined) {
        if (q.correctOption === userAnswer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const skipped = allQuestions.length - attemptedCount;
    const accuracy = attemptedCount > 0 ? (correct / attemptedCount) * 100 : 0;
    const timeTakenMs = new Date(submission.submitted_at).getTime() - new Date(submission.started_at).getTime();
    const timeTakenMins = Math.floor(timeTakenMs / 60000);
    const timeTakenHours = Math.floor(timeTakenMins / 60);
    const timeTakenStr = `${timeTakenHours}h ${timeTakenMins % 60}m`;

    return { correct, incorrect, skipped, accuracy, timeTakenStr, attemptedCount };
  }, [submission, test, allQuestions]);

  const subjectBreakdown = useMemo(() => {
    if (!test || !test.questions || !submission) return {};

    const subjectMap: Record<string, { correct: number; incorrect: number; skipped: number; score: number; totalQuestions: number; maxScore: number }> = {};
    const markingScheme = JSON.parse(test.markingScheme)
    test.questions.forEach((section: {name: string, questions: Question[]}) => {
      const subjectName = section.name.replace(/ (A|B)$/, '').trim();
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { correct: 0, incorrect: 0, skipped: 0, score: 0, totalQuestions: 0, maxScore: 0 };
      }

      section.questions.forEach((q: Question) => {
        const userAnswer = submission.answers[q.uuid];
        subjectMap[subjectName].totalQuestions++;
        subjectMap[subjectName].maxScore += markingScheme.correct;

        if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
          if (q.correctOption === userAnswer) {
            subjectMap[subjectName].correct++;
            subjectMap[subjectName].score += markingScheme.correct;
          } else {
            subjectMap[subjectName].incorrect++;
            subjectMap[subjectName].score -= markingScheme.incorrect;
          }
        } else {
          subjectMap[subjectName].skipped++;
        }
      });
    });

    return subjectMap;
  }, [test, submission]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!submission || !test || !analysis) {
    return <div className="flex justify-center items-center h-screen">Result not found.</div>;
  }

  const scorePercentage = (submission.score / (test.maximum_marks || 1)) * 100;

  const subjectIcons: Record<string, string> = {
    'Physics': 'science',
    'Chemistry': 'biotech',
    'Mathematics': 'calculate',
  };

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Test Result: {test.title}</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Completed on {new Date(submission.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
        </div>

        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-shrink-0 relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-border-light dark:text-border-dark" cx="50%" cy="50%" fill="none" r="70" stroke="currentColor" strokeWidth="12"></circle>
                        <circle className="text-primary" cx="50%" cy="50%" fill="none" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={440 - (440 * scorePercentage) / 100} strokeLinecap="round" strokeWidth="12"></circle>
                    </svg>
                    <div className="absolute text-center">
                        <span className="block text-4xl font-bold text-text-light dark:text-text-dark">{submission.score}</span>
                        <span className="block text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">/ {test.maximum_marks}</span>
                    </div>
                </div>
                <div className="flex-grow w-full grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Accuracy</p>
                        <p className="text-2xl font-bold text-text-light dark:text-text-dark">{analysis.accuracy.toFixed(0)}%</p>
                        <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-1.5 mt-2">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${analysis.accuracy}%` }}></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Percentile</p>
                        <p className="text-2xl font-bold text-text-light dark:text-text-dark">?</p>
                        <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-1.5 mt-2">
                          <div className="bg-success-light dark:bg-success-dark h-1.5 rounded-full" style={{ width: `0%` }}></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Time Taken</p>
                        <p className="text-2xl font-bold text-text-light dark:text-text-dark">{analysis.timeTakenStr}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Rank</p>
                        <p className="text-2xl font-bold text-text-light dark:text-text-dark">?</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-6">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Question Analysis
              </h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-success-light dark:bg-success-dark"></div>
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">Correct</span>
                      </div>
                      <span className="font-bold text-success-light dark:text-success-dark">{analysis.correct}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-error-light dark:bg-error-dark"></div>
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">Incorrect</span>
                      </div>
                      <span className="font-bold text-error-light dark:text-error-dark">{analysis.incorrect}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-text-secondary-light dark:bg-text-secondary-dark"></div>
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">Skipped</span>
                      </div>
                      <span className="font-bold text-text-secondary-light dark:text-text-secondary-dark">{analysis.skipped}</span>
                  </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Attempted</span>
                      <span className="text-lg font-bold text-text-light dark:text-text-dark">{analysis.attemptedCount}<span className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-normal">/{allQuestions.length}</span></span>
                  </div>
                  <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2 overflow-hidden flex">
                      <div className="bg-success-light dark:bg-success-dark h-full" style={{ width: `${(analysis.correct/allQuestions.length)*100}%` }}></div>
                      <div className="bg-error-light dark:bg-error-dark h-full" style={{ width: `${(analysis.incorrect/allQuestions.length)*100}%` }}></div>
                  </div>
              </div>
          </div>
          <div className="lg:col-span-2 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-6">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">subject</span>
              Subject Breakdown
            </h3>
            <div className="space-y-6">
              {Object.entries(subjectBreakdown).map(([subject, data]) => {
                const style = subjectStyles[subject] || defaultSubjectStyle;
                return (
                  <div className="group" key={subject}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${style.bg} ${style.text}`}>
                          <span className="material-symbols-outlined text-[20px]">{subjectIcons[subject] || 'subject'}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-light dark:text-text-dark">{subject}</h4>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Score: {data.score}/{data.maxScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-success-light dark:text-success-dark">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          <span>{data.correct}</span>
                        </div>
                        <div className="flex items-center gap-1 text-error-light dark:text-error-dark">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                          <span>{data.incorrect}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                          <span>{data.skipped}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full h-2 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full rounded-full ${style.bar}`} style={{ width: `${(data.score/data.maxScore)*100}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <span className="material-symbols-outlined text-3xl">fact_check</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-light dark:text-text-dark">User Attempt vs. Answer Key</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Review every question in detail to understand where you went wrong.</p>
              </div>
            </div>
            <Link to="#" className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity w-full md:w-auto justify-center">
              Start Review
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TestResult;
