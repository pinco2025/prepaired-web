import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import JEELoader from './JEELoader';

// Define interfaces for the result data based on sample_result.json
interface SectionScore {
  score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  total_questions: number;
}

interface TestResultData {
  testId: string;
  totalMarks: number;
  totalQuestions: number;
  sections: { name: string; marksPerQuestion: number }[];
  section_scores: Record<string, SectionScore>;
  total_stats: {
    total_score: number;
    total_attempted: number;
    total_correct: number;
    total_wrong: number;
    total_unattempted: number;
  };
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

const subjectIcons: Record<string, string> = {
  Physics: 'science',
  Chemistry: 'biotech',
  Mathematics: 'calculate',
};

const TestResult: React.FC = () => {
  usePageTitle('Test Result');
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultData | null>(null);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const pollCountRef = useRef(0);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchResultData = async (isRetry = false) => {
      if (!submissionId) return;

      if (!isRetry) setLoading(true);

      try {
        const { data: submissionData, error } = await supabase
          .from('student_tests')
          .select('submitted_at, started_at, result_url')
          .eq('id', submissionId)
          .single();

        if (cancelled) return;
        if (error || !submissionData) throw new Error('Submission not found');

        setSubmissionTime(submissionData.submitted_at);
        setStartTime(submissionData.started_at);

        if (submissionData.result_url) {
          const response = await fetch(submissionData.result_url);
          if (!response.ok) throw new Error('Failed to fetch result data');
          const data = await response.json();
          if (cancelled) return;
          setResult(data as TestResultData);
          setPolling(false);
        } else {
          // Result not ready — poll every 5s, up to 24 times (~2 min)
          setResult(null);
          pollCountRef.current += 1;
          if (pollCountRef.current < 24 && !cancelled) {
            setPolling(true);
            pollTimer = setTimeout(() => fetchResultData(true), 5000);
          } else {
            setPolling(false);
          }
        }

      } catch (error) {
        console.error('Error fetching result data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResultData();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [submissionId]);

  if (loading) {
    return <JEELoader message="Loading results..." />;
  }

  if (!result) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4 sm:px-6">
        {polling ? (
          <>
            <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-3 border-primary border-t-transparent rounded-full mb-4 sm:mb-6"></div>
            <h2 className="text-lg sm:text-2xl font-semibold mb-2">Calculating your results...</h2>
            <p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark">This usually takes a few seconds. Checking automatically.</p>
          </>
        ) : (
          <>
            <span className="material-icons-outlined text-4xl sm:text-5xl text-text-secondary-light mb-3 sm:mb-4">hourglass_empty</span>
            <h2 className="text-lg sm:text-2xl font-semibold mb-2">Results are being processed</h2>
            <p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark mb-4 sm:mb-6">This is taking longer than expected.</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
            >
              <span className="material-icons-outlined">refresh</span>
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }

  const { total_stats, totalMarks, section_scores } = result;
  const accuracy = total_stats.total_attempted > 0 ? (total_stats.total_correct / total_stats.total_attempted) * 100 : 0;
  const scorePercentage = (total_stats.total_score / totalMarks) * 100;

  let timeTakenFormatted = "??";
  if (startTime && submissionTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(submissionTime).getTime();
    const diff = end - start;
    if (diff > 0) {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const parts = [];
      if (hours > 0) parts.push(`${hours} H`);
      if (minutes > 0 || hours === 0) parts.push(`${minutes} Min`);
      timeTakenFormatted = parts.join(' ');
    }
  }

  return (
    <main className="flex-grow container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-8 sm:pb-10 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark truncate">Test Result: {result.testId}</h1>
            <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
              <span className="material-icons-outlined text-xs sm:text-sm">event</span>
              {submissionTime ? `Completed on ${new Date(submissionTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-surface-light/50 dark:bg-surface-dark/50 p-1.5 sm:p-2 pl-3 sm:pl-4 rounded-xl border border-border-light dark:border-border-dark backdrop-blur-sm w-full sm:w-auto">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text-light dark:text-text-dark">Analysis</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Compare with key</p>
            </div>
            <p className="sm:hidden text-sm font-medium text-text-light dark:text-text-dark">Review answers</p>
            <button
              onClick={() => navigate(`/review/${submissionId}`)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm text-sm sm:text-base ml-auto sm:ml-0"
            >
              Start Review
              <span className="material-icons-outlined text-base sm:text-lg">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Score Overview Card */}
        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-12">
            <div className="flex-shrink-0 relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle className="text-border-light dark:text-border-dark" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-primary" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={440 - (440 * scorePercentage) / 100} strokeLinecap="round" strokeWidth="12"></circle>
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark">{total_stats.total_score}</span>
                <span className="block text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">/ {totalMarks}</span>
              </div>
            </div>
            <div className="flex-grow w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">Accuracy</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-text-light dark:text-text-dark">{accuracy.toFixed(0)}%</p>
                <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-1.5 mt-1 sm:mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${accuracy}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">Time Taken</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-text-light dark:text-text-dark">{timeTakenFormatted}</p>
                <p className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark">Avg: --</p>
              </div>
              <div className="col-span-2 md:col-span-2 flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30">
                <span className="material-icons-outlined text-amber-500 dark:text-amber-400 text-xl sm:text-2xl flex-shrink-0">schedule</span>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-text-light dark:text-text-dark">Rank & Percentile drop at 9 PM tonight.</p>
                  <p className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Till then, review your answers and sharpen your weak spots.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis & Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Question Analysis */}
          <div className="lg:col-span-1 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-4 sm:mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-primary text-xl sm:text-[24px]">analytics</span>
              Question Analysis
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="material-icons-outlined text-success-light dark:text-success-dark text-xl sm:text-[24px]">check_circle</span>
                  <span className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark">Correct</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-success-light dark:text-success-dark">{total_stats.total_correct}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="material-icons-outlined text-error-light dark:text-error-dark text-xl sm:text-[24px]">cancel</span>
                  <span className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark">Incorrect</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-error-light dark:text-error-dark">{total_stats.total_wrong}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30 transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl sm:text-[24px]">remove_circle</span>
                  <span className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark">Skipped</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-text-secondary-light dark:text-text-secondary-dark">{total_stats.total_unattempted}</span>
              </div>
            </div>
            <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-border-light dark:border-border-dark">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Attempted</span>
                <span className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark">{total_stats.total_attempted}<span className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark font-normal">/{result.totalQuestions}</span></span>
              </div>
              <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2 overflow-hidden flex">
                <div className="bg-success-light dark:bg-success-dark h-full" style={{ width: `${(total_stats.total_correct / result.totalQuestions) * 100}%` }}></div>
                <div className="bg-error-light dark:bg-error-dark h-full" style={{ width: `${(total_stats.total_wrong / result.totalQuestions) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="lg:col-span-2 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-4 sm:mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-primary text-xl sm:text-[24px]">subject</span>
              Subject Breakdown
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(section_scores).map(([sectionName, data]) => {
                const subjectName = sectionName.replace(/ (A|B)$/, '').trim();
                const style = subjectStyles[subjectName] || defaultSubjectStyle;
                const sectionInfo = result.sections.find(s => s.name === sectionName);
                const sectionMaxScore = data.total_questions * (sectionInfo?.marksPerQuestion || 0);
                return (
                  <div className="group" key={sectionName}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1.5 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${style.bg} ${style.text} flex-shrink-0`}>
                          <span className="material-icons-outlined text-[18px] sm:text-[20px]">{subjectIcons[subjectName] || 'subject'}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-medium text-text-light dark:text-text-dark">{sectionName}</h4>
                          <p className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark">Score: {data.score}/{sectionMaxScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-shrink-0 ml-9 sm:ml-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-green-600 dark:text-green-400 font-medium">
                          <span className="material-icons-outlined text-[16px] sm:text-[18px]">check_circle</span>
                          <span>{data.correct}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-red-600 dark:text-red-400 font-medium">
                          <span className="material-icons-outlined text-[16px] sm:text-[18px]">cancel</span>
                          <span>{data.incorrect}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
                          <span className="material-icons-outlined text-[16px] sm:text-[18px]">remove_circle</span>
                          <span>{data.unattempted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full h-2 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full rounded-full ${style.bar}`} style={{ width: `${Math.max(0, (data.score / sectionMaxScore) * 100)}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default TestResult;
