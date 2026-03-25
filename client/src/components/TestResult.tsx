import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import SubscriptionModal from './SubscriptionModal';
import PaymentSuccessOverlay from './PaymentSuccessOverlay';
import JEELoader from './JEELoader';

interface SectionScore {
  score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  total_questions: number;
}

interface AttemptEntry {
  question_uuid: string;
  question_id: string;
  section: string;
  chapter_tag: string;
  user_response: string | null;
  correct_response: string;
  status: string;
  marks_awarded: number;
  blunder?: boolean;
}

interface TestResultData {
  testId: string;
  totalMarks: number;
  totalQuestions: number;
  sections: { name: string; marksPerQuestion: number }[];
  section_scores: Record<string, SectionScore>;
  chapter_scores?: Record<string, unknown>;
  attempt_comparison?: AttemptEntry[];
  total_stats: {
    total_score: number;
    total_attempted: number;
    total_correct: number;
    total_wrong: number;
    total_unattempted: number;
  };
}


const SUBJECT_COLORS = {
  Physics: {
    text: 'text-primary',
    icon: 'text-primary',
    bar: 'bg-primary',
    tile: 'bg-primary text-white',
    glow: 'bg-primary/5',
    border: 'border-primary/20',
    label: 'text-primary',
  },
  Chemistry: {
    text: 'text-green-500',
    icon: 'text-green-500',
    bar: 'bg-green-500',
    tile: 'bg-green-500 text-white',
    glow: 'bg-green-500/5',
    border: 'border-green-500/20',
    label: 'text-green-500',
  },
  Mathematics: {
    text: 'text-orange-500',
    icon: 'text-orange-500',
    bar: 'bg-orange-500',
    tile: 'bg-orange-500 text-white',
    glow: 'bg-orange-500/5',
    border: 'border-orange-500/20',
    label: 'text-orange-500',
  },
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics: 'flare',
  Chemistry: 'biotech',
  Mathematics: 'functions',
};

interface AttemptInfo {
  id: string;
  submitted_at: string;
  started_at: string;
}

const TestResult: React.FC = () => {
  usePageTitle('Test Result');
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user, isPaidUser, refreshSubscription } = useAuth();
  const [result, setResult] = useState<TestResultData | null>(null);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [percentile99Score, setPercentile99Score] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const pollCountRef = useRef(0);

  // Multi-attempt state
  const [allAttempts, setAllAttempts] = useState<AttemptInfo[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [attemptDropdownOpen, setAttemptDropdownOpen] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const {
    initiateSubscription,
    showSuccess,
    successPlanType,
    handleSuccessComplete
  } = useRazorpay({
    refreshSubscription,
    onPaymentSuccess: () => setShowPaymentModal(false),
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAttemptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all attempts for this test
  useEffect(() => {
    if (!testId || !user?.id) return;
    const fetchAttempts = async () => {
      const { data } = await supabase
        .from('student_tests')
        .select('id, submitted_at, started_at')
        .eq('test_id', testId)
        .eq('user_id', user.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });
      if (data && data.length > 0) {
        setAllAttempts(data as AttemptInfo[]);
      }
    };
    fetchAttempts();
  }, [testId, user?.id]);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // Use activeSubmissionId if set (user switched attempt), otherwise use URL param
    const currentId = activeSubmissionId || submissionId;

    const fetchResultData = async (isRetry = false) => {
      if (!currentId) return;
      if (!isRetry) setLoading(true);
      try {
        const { data: submissionData, error } = await supabase
          .from('student_tests')
          .select('submitted_at, started_at, result_url, test_id')
          .eq('id', currentId)
          .single();

        if (cancelled) return;
        if (error || !submissionData) throw new Error('Submission not found');

        setSubmissionTime(submissionData.submitted_at);
        setStartTime(submissionData.started_at);
        if (submissionData.test_id) setTestId(submissionData.test_id);

        if (submissionData.test_id) {
          const { data: testMeta } = await supabase
            .from('tests')
            .select('99ile')
            .eq('testID', submissionData.test_id)
            .single();
          if (!cancelled && testMeta) {
            setPercentile99Score(testMeta['99ile'] ?? null);
          }
        }

        if (submissionData.result_url) {
          const response = await fetch(submissionData.result_url);
          if (!response.ok) throw new Error('Failed to fetch result data');
          const data = await response.json();
          if (cancelled) return;
          setResult(data as TestResultData);
          setPolling(false);
        } else {
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

    pollCountRef.current = 0;
    fetchResultData();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [submissionId, activeSubmissionId]);

  if (loading) return <JEELoader message="Loading results..." />;

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

  const { total_stats, section_scores } = result;
  const accuracy = total_stats.total_attempted > 0
    ? (total_stats.total_correct / total_stats.total_attempted) * 100
    : 0;
  const scorePercentage = (total_stats.total_score / 300) * 100;
  const circumference = 2 * Math.PI * 54;

  const isJEEFormat = result.sections.some(s => / [AB]$/.test(s.name));

  const subjectBreakdown = ['Physics', 'Chemistry', 'Mathematics'].map(subject => {
    const secA = section_scores[`${subject} A`];
    const secB = section_scores[`${subject} B`];
    const secSingle = section_scores[subject];
    const secs = [
      secA ? { label: 'Sec A', key: `${subject} A`, data: secA } : null,
      secB ? { label: 'Sec B', key: `${subject} B`, data: secB } : null,
      secSingle ? { label: subject, key: subject, data: secSingle } : null,
    ].filter((s): s is { label: string; key: string; data: SectionScore } => s !== null);
    const totalScore = secs.reduce((sum, s) => sum + s.data.score, 0);
    const totalMax = secs.reduce((sum, s) => {
      const info = result.sections.find(si => si.name === s.key);
      return sum + s.data.total_questions * (info?.marksPerQuestion ?? 0);
    }, 0);
    const pct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    return { subject, secs, totalScore, totalMax, pct };
  }).filter(s => s.secs.length > 0);

  let timeTakenFormatted = '--';
  if (startTime && submissionTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(submissionTime).getTime();
    const diff = end - start;
    if (diff > 0) {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
      timeTakenFormatted = parts.join(' ');
    }
  }

  let percentileValue: number | null = null;
  if (percentile99Score != null && percentile99Score > 0) {
    const raw = (total_stats.total_score / percentile99Score) * 99;
    percentileValue = raw < 0 ? Math.abs(raw) / 10 : raw;
  }

  const blundersBySubject = (['Physics', 'Chemistry', 'Mathematics'] as const).reduce<Record<string, AttemptEntry[]>>((acc, subject) => {
    acc[subject] = (result.attempt_comparison ?? []).filter(
      q => q.blunder === true && q.section.startsWith(subject)
    );
    return acc;
  }, {});
  const hasBlunders = Object.values(blundersBySubject).some(arr => arr.length > 0);

  return (
    <main className="flex-grow container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-8 sm:pb-10 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2">
              <span>Tests</span>
              <span className="material-icons-outlined text-[13px]">chevron_right</span>
              <span>{result.testId}</span>
              <span className="material-icons-outlined text-[13px]">chevron_right</span>
              <span className="text-primary">Results</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">
              {result.testId} <span className="text-primary">Results</span>
            </h1>

            {/* Completed On — with attempt dropdown if multiple attempts */}
            <div className="relative mt-1" ref={dropdownRef}>
              <button
                onClick={() => allAttempts.length > 1 && setAttemptDropdownOpen(prev => !prev)}
                className={`text-text-secondary-light dark:text-text-secondary-dark text-sm flex items-center gap-1.5 ${allAttempts.length > 1 ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-default'}`}
              >
                <span className="material-icons-outlined text-sm">event</span>
                {/* On mobile with multiple attempts: show only attempt number */}
                {allAttempts.length > 1 ? (
                  <>
                    <span className="hidden sm:inline">
                      {submissionTime
                        ? `Completed on ${new Date(submissionTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`
                        : ''}
                    </span>
                    <span className="text-xs text-primary font-medium sm:ml-1">
                      Attempt {allAttempts.findIndex(a => a.id === (activeSubmissionId || submissionId)) + 1}
                      <span className="hidden sm:inline"> of {allAttempts.length}</span>
                    </span>
                    <span className={`material-icons-outlined text-sm transition-transform ${attemptDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </>
                ) : (
                  <span>
                    {submissionTime
                      ? `Completed on ${new Date(submissionTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`
                      : ''}
                  </span>
                )}
              </button>

              {/* Attempt Selector Dropdown */}
              {attemptDropdownOpen && allAttempts.length > 1 && (
                <div className="absolute top-full left-0 mt-1 z-50 w-72 sm:w-80 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
                  <div className="px-3 py-2 border-b border-border-light dark:border-border-dark">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Select Attempt</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {allAttempts.map((attempt, idx) => {
                      const isActive = attempt.id === (activeSubmissionId || submissionId);
                      return (
                        <button
                          key={attempt.id}
                          onClick={() => {
                            setActiveSubmissionId(attempt.id);
                            setAttemptDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 flex items-center justify-between text-left text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-text-light dark:text-text-dark hover:bg-border-light/50 dark:hover:bg-border-dark/50'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-primary text-white' : 'bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark'}`}>
                              {allAttempts.length - idx}
                            </span>
                            {new Date(attempt.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                          {isActive && <span className="material-icons-outlined text-primary text-base">check</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              onClick={() => navigate(`/review/${activeSubmissionId || submissionId}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm text-sm"
            >
              <span className="material-icons-outlined text-base">rate_review</span>
              Start Review
            </button>
            <button
              onClick={() => {
                if (isPaidUser) {
                  navigate(`/tests/${testId}?reattempt=true`);
                } else {
                  setShowPaymentModal(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-primary text-primary hover:bg-primary/10 transition-colors shadow-sm"
            >
              <span className="material-icons-outlined text-base">replay</span>
              Re-attempt
            </button>
          </div>
        </header>

        {/* Top Row: Hero Score + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Hero Score Card */}
          <section className="lg:col-span-5 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-widest">Total Score</h3>
              </div>
              <div className="flex items-center gap-6 mt-4">
                {/* Donut ring */}
                <div className="relative flex-shrink-0 w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-border-light dark:text-border-dark" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke="#0066ff"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (circumference * Math.min(scorePercentage, 100)) / 100}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block text-2xl font-extrabold text-text-light dark:text-text-dark leading-none">{total_stats.total_score}</span>
                    <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark">/300</span>
                  </div>
                </div>
                {/* Percentile */}
                <div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider font-medium mb-1">PrepAIred Percentile</p>
                  {percentileValue != null ? (
                    <p className="text-5xl font-extrabold text-primary leading-none">
                      {percentileValue < 90 ? '<90' : percentileValue.toFixed(1)}<span className="text-2xl font-bold">%ile</span>
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-text-light dark:text-text-dark">At 9 PM</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Time */}
            <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
              <span className="material-icons-outlined text-primary mb-3">timer</span>
              <div>
                <span className="block text-2xl font-bold text-text-light dark:text-text-dark">{timeTakenFormatted}</span>
                <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">Time Taken</span>
              </div>
            </div>
            {/* Accuracy */}
            <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
              <span className="material-icons-outlined text-success-light dark:text-success-dark mb-3">track_changes</span>
              <div>
                <span className="block text-2xl font-bold text-text-light dark:text-text-dark">{accuracy.toFixed(0)}%</span>
                <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">Accuracy</span>
              </div>
            </div>
            {/* Attempted */}
            <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
              <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark mb-3">edit_note</span>
              <div>
                <span className="block text-2xl font-bold text-text-light dark:text-text-dark">{total_stats.total_attempted}<span className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-normal"> / {result.totalQuestions}</span></span>
                <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">Attempted</span>
              </div>
            </div>

            {/* Generate Insights CTA — spans 2 or 3 cols */}
            <div className="col-span-2 sm:col-span-3 bg-gradient-to-br from-surface-light to-border-light/30 dark:from-surface-dark dark:to-border-dark/30 rounded-2xl border border-primary/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center relative flex-shrink-0">
                  <span className="material-icons-outlined text-2xl sm:text-3xl text-primary">auto_awesome</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-text-light dark:text-text-dark">PrepAIred Analysis</h4>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm">Deep insights into your weak areas and cognitive patterns.</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/insights/${activeSubmissionId || submissionId}`)}
                className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm text-center"
              >
                Generate Insights
              </button>
            </div>
          </section>
        </div>

        {/* Subject Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjectBreakdown.map(({ subject, secs, totalScore, totalMax, pct }) => {
            const colors = SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS] ?? SUBJECT_COLORS.Physics;
            const icon = SUBJECT_ICONS[subject] ?? 'subject';
            return (
              <div
                key={subject}
                className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-6 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.glow} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`} />
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-border-light dark:bg-border-dark/50 flex items-center justify-center">
                      <span className={`material-icons-outlined text-[20px] ${colors.icon}`}>{icon}</span>
                    </div>
                    <h3 className="font-bold text-text-light dark:text-text-dark">{subject}</h3>
                  </div>
                  <span className={`font-bold ${colors.text}`}>{totalScore}/{totalMax}</span>
                </div>
                <div className="space-y-3">
                  {secs.map(sec => {
                    const attempted = sec.data.correct + sec.data.incorrect;
                    const attemptPct = sec.data.total_questions > 0 ? (attempted / sec.data.total_questions) * 100 : 0;
                    return (
                      <div key={sec.key}>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-text-secondary-light dark:text-text-secondary-dark">
                            {isJEEFormat && secs.length > 1 ? (sec.label === 'Sec A' ? 'Section A (MCQ)' : 'Section B (Numerical)') : sec.label}
                          </span>
                          <span className="text-text-light dark:text-text-dark font-semibold">{attempted}/{sec.data.total_questions}</span>
                        </div>
                        <div className="h-1.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                          <div className={`h-full ${colors.bar} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, attemptPct)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex gap-4 text-xs">
                  <span className="text-success-light dark:text-success-dark font-medium">✓ {secs.reduce((s, sec) => s + sec.data.correct, 0)}</span>
                  <span className="text-error-light dark:text-error-dark font-medium">✗ {secs.reduce((s, sec) => s + sec.data.incorrect, 0)}</span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">− {secs.reduce((s, sec) => s + sec.data.unattempted, 0)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Blunder Analysis */}
        <section className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg text-text-light dark:text-text-dark">Blunder Analysis</h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Easy questions you got wrong — guaranteed marks left on the table</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Blunder</span>
            </div>
          </div>
          <div className="p-6">
            {!hasBlunders ? (
              <div className="text-center py-6">
                <span className="material-icons-outlined text-success-light dark:text-success-dark text-3xl mb-2">emoji_events</span>
                <p className="text-sm font-medium text-text-light dark:text-text-dark">No blunders!</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">You didn't drop any easy questions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(['Physics', 'Chemistry', 'Mathematics'] as const).map(subject => {
                  const blunders = blundersBySubject[subject];
                  if (!blunders || blunders.length === 0) return null;
                  const colors = SUBJECT_COLORS[subject];
                  return (
                    <div key={subject}>
                      <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${colors.label}`}>{subject}</h4>
                      <div className="flex flex-wrap gap-2">
                        {blunders.map(q => (
                          <button
                            key={q.question_uuid}
                            onClick={() => navigate(`/review/${submissionId}?q=${q.question_uuid}`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold bg-orange-400/20 text-orange-500 border border-orange-400/40 hover:scale-110 hover:bg-orange-400/30 transition-all cursor-pointer"
                            title={`${q.section} · ${q.chapter_tag}`}
                          >
                            {q.question_id.replace(/\D/g, '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>


      </div>

      {/* Payment Modal for free users */}
      <SubscriptionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubscribe={() => {
          setShowPaymentModal(false);
          if (user) {
            initiateSubscription({
              userId: user.id,
              userEmail: user.email,
              userName: user.user_metadata?.full_name || user.user_metadata?.name,
            });
          }
        }}
      />

      {/* Payment Success Overlay */}
      <PaymentSuccessOverlay
        isVisible={showSuccess}
        planType={successPlanType}
        onComplete={handleSuccessComplete}
      />
    </main>
  );
};

export default TestResult;
