import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import JEELoader from './JEELoader';

interface SectionScore {
  score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  total_questions: number;
}

interface ChapterScore {
  score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  total_questions: number;
}

interface PhysicsChapterMeta {
  code: string;
  name: string;
  level: number;
}

interface PhysicsRecommendation extends PhysicsChapterMeta {
  correct: number;
  incorrect: number;
  unattempted: number;
  total_questions: number;
  priorityScore: number;
}

interface DifficultyBucket {
  difficulty: Record<string, number>;
  [key: string]: unknown;
}

interface TestResultData {
  testId: string;
  totalMarks: number;
  totalQuestions: number;
  sections: { name: string; marksPerQuestion: number }[];
  section_scores: Record<string, SectionScore>;
  chapter_scores?: Record<string, ChapterScore>;
  metadata_stats?: {
    correct: DifficultyBucket;
    incorrect: DifficultyBucket;
    unattempted: DifficultyBucket;
  };
  total_stats: {
    total_score: number;
    total_attempted: number;
    total_correct: number;
    total_wrong: number;
    total_unattempted: number;
  };
}

const IMPORTANCE_WEIGHT: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };

function computeWeakChapters(
  chapterScores: Record<string, ChapterScore>,
  chapterMeta: PhysicsChapterMeta[]
): PhysicsRecommendation[] {
  const metaMap = new Map<string, PhysicsChapterMeta>(chapterMeta.map(ch => [ch.code, ch]));
  const candidates: PhysicsRecommendation[] = [];
  for (const [code, stats] of Object.entries(chapterScores)) {
    const meta = metaMap.get(code);
    if (!meta || stats.total_questions === 0) continue;
    const wrongRatio = stats.incorrect / stats.total_questions;
    const unattemptedRatio = stats.unattempted / stats.total_questions;
    const weaknessScore = wrongRatio * 1.5 + unattemptedRatio * 0.8;
    if (weaknessScore <= 0.25) continue;
    const priorityScore = weaknessScore * (IMPORTANCE_WEIGHT[meta.level] ?? 1);
    candidates.push({ ...meta, ...stats, priorityScore });
  }
  candidates.sort((a, b) => b.priorityScore - a.priorityScore);
  return candidates.slice(0, 4);
}


interface DonutProps {
  correct: number;
  incorrect: number;
  unattempted: number;
  total: number;
  label: string;
  color: string;
}

const DonutChart: React.FC<DonutProps> = ({ correct, incorrect, unattempted, total, label, color }) => {
  const correctPct = total > 0 ? (correct / total) * 100 : 0;
  const incorrectPct = total > 0 ? (incorrect / total) * 100 : 0;

  const gradient = `conic-gradient(
    ${color} 0% ${correctPct.toFixed(1)}%,
    #ef4444 ${correctPct.toFixed(1)}% ${(correctPct + incorrectPct).toFixed(1)}%,
    #374151 ${(correctPct + incorrectPct).toFixed(1)}% 100%
  )`;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative w-40 h-40 rounded-full flex items-center justify-center"
        style={{ background: gradient }}
      >
        {/* Inner hole */}
        <div className="w-24 h-24 bg-surface-light dark:bg-surface-dark rounded-full flex items-center justify-center border border-border-light dark:border-border-dark shadow-inner">
          <span className="text-sm font-bold text-text-light dark:text-text-dark uppercase tracking-tight">{label}</span>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-bold text-text-light dark:text-text-dark">{correctPct.toFixed(0)}% Correct</p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {correct} correct · {incorrect} wrong · {unattempted} skipped
        </p>
      </div>
      <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Correct</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Wrong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-border-dark" />
          <span className="text-text-secondary-light dark:text-text-secondary-dark">Skipped</span>
        </div>
      </div>
    </div>
  );
};

const AIInsightsPage: React.FC = () => {
  usePageTitle('AI Insights');
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setPolling] = useState(false);
  const pollCountRef = useRef(0);
  const [allChapters, setAllChapters] = useState<Record<string, PhysicsChapterMeta[]>>({});
  const [checkingChapter, setCheckingChapter] = useState<string | null>(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchData = async (isRetry = false) => {
      if (!submissionId) return;
      if (!isRetry) setLoading(true);
      try {
        const { data: submissionData, error } = await supabase
          .from('student_tests')
          .select('result_url')
          .eq('id', submissionId)
          .single();

        if (cancelled) return;
        if (error || !submissionData) throw new Error('Submission not found');

        if (submissionData.result_url) {
          const response = await fetch(submissionData.result_url);
          if (!response.ok) throw new Error('Failed to fetch result data');
          const data = await response.json();
          if (cancelled) return;
          setResult(data as TestResultData);
          setPolling(false);
        } else {
          pollCountRef.current += 1;
          if (pollCountRef.current < 24 && !cancelled) {
            setPolling(true);
            pollTimer = setTimeout(() => fetchData(true), 5000);
          }
        }
      } catch (err) {
        console.error('Error fetching insights data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [submissionId]);

  useEffect(() => {
    fetch('/chapters.json')
      .then(r => r.json())
      .then(data => setAllChapters(data as Record<string, PhysicsChapterMeta[]>))
      .catch(console.error);
  }, []);

  const weakChaptersBySubject = useMemo(() => {
    if (!result?.chapter_scores) return { Physics: [], Chemistry: [], Mathematics: [] };
    return {
      Physics: computeWeakChapters(result.chapter_scores, allChapters['Physics'] ?? []),
      Chemistry: computeWeakChapters(result.chapter_scores, allChapters['Chemistry'] ?? []),
      Mathematics: computeWeakChapters(result.chapter_scores, allChapters['Mathematics'] ?? []),
    };
  }, [result?.chapter_scores, allChapters]);

  if (loading) return <JEELoader message="Generating insights..." />;

  if (!result) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4">
        <span className="material-icons-outlined text-5xl text-text-secondary-light mb-4">psychology</span>
        <h2 className="text-2xl font-semibold mb-2">Results not available yet</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">Please check back after your results are processed.</p>
        <button
          onClick={() => navigate(`/results/${submissionId}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
        >
          <span className="material-icons-outlined">arrow_back</span>
          Back to Results
        </button>
      </div>
    );
  }

  const handlePracticeClick = async (chapterCode: string, subject: string) => {
    const key = `${chapterCode}-${subject}`;
    setCheckingChapter(key);
    try {
      const res = await fetch(
        `/api/questions?setId=ch-${encodeURIComponent(chapterCode)}&subject=${encodeURIComponent(subject)}&check=1`
      );
      if (res.ok) {
        navigate(`/question-set/ch-${chapterCode}/${subject}/practice`);
      } else {
        setShowUnavailableModal(true);
      }
    } catch {
      setShowUnavailableModal(true);
    } finally {
      setCheckingChapter(null);
    }
  };

  const SUBJECT_WEAKNESS_CONFIG = [
    { subject: 'Physics',     icon: 'bolt',      iconColor: 'text-blue-500 dark:text-blue-400',   chapters: weakChaptersBySubject.Physics },
    { subject: 'Chemistry',   icon: 'science',   iconColor: 'text-purple-500 dark:text-purple-400', chapters: weakChaptersBySubject.Chemistry },
    { subject: 'Mathematics', icon: 'calculate', iconColor: 'text-orange-500 dark:text-orange-400', chapters: weakChaptersBySubject.Mathematics },
  ];

  // Difficulty donuts from metadata_stats — keys E / M / H
  const md = result.metadata_stats;
  const DIFFICULTY_CONFIG = [
    { key: 'E', label: 'Easy',   color: '#22c55e' },
    { key: 'M', label: 'Medium', color: '#22c55e' },
    { key: 'H', label: 'Hard',   color: '#22c55e' },
  ].map(({ key, label, color }) => {
    const correct    = md?.correct.difficulty[key]    ?? 0;
    const incorrect  = md?.incorrect.difficulty[key]  ?? 0;
    const unattempted = md?.unattempted.difficulty[key] ?? 0;
    const total = correct + incorrect + unattempted;
    return { label, color, correct, incorrect, unattempted, total };
  });

  return (
    <main className="flex-grow container mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-8 pb-12">
      {showUnavailableModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowUnavailableModal(false)}
        >
          <div
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 max-w-sm w-full mx-4 border border-border-light dark:border-border-dark shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <span className="material-icons-outlined text-4xl text-primary mb-3">construction</span>
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-2">Coming Soon!</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
              Team prepAIred is working hard in preparing resources for you! Stay tuned.
            </p>
            <button
              onClick={() => setShowUnavailableModal(false)}
              className="px-6 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2">
              <button onClick={() => navigate(`/results/${submissionId}`)} className="hover:text-primary transition-colors">Results</button>
              <span className="material-icons-outlined text-[13px]">chevron_right</span>
              <span className="text-primary">AI Insights</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">
              AI <span className="text-primary">Insights</span>
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 text-sm">
              Prioritize your review sessions based on historical performance.
            </p>
          </div>
          <button
            onClick={() => navigate(`/results/${submissionId}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-border-light dark:hover:bg-border-dark/30 transition-colors self-start sm:self-auto"
          >
            <span className="material-icons-outlined text-base">arrow_back</span>
            Back to Results
          </button>
        </header>

        {/* Weak Chapters per Subject */}
        <section>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-1">Weak Areas per Subject</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Focus on these topics to maximise your score improvement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUBJECT_WEAKNESS_CONFIG.map(({ subject, icon, iconColor, chapters }) => (
              <div key={subject} className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <span className={`material-icons-outlined text-xl ${iconColor}`}>{icon}</span>
                  <h3 className="text-base font-semibold text-text-light dark:text-text-dark">{subject}</h3>
                </div>
                <div className="space-y-3">
                  {chapters.length > 0 ? (
                    chapters.map((ch) => (
                      <div
                        key={ch.code}
                        className="group bg-surface-light/80 dark:bg-surface-dark/80 rounded-xl p-4 flex items-center justify-between border border-border-light dark:border-border-dark hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{ch.name}</p>
                          <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                            {ch.correct}/{ch.total_questions} correct
                          </p>
                        </div>
                        <button
                          onClick={() => handlePracticeClick(ch.code, subject)}
                          disabled={checkingChapter === `${ch.code}-${subject}`}
                          className="text-[11px] font-semibold px-3 py-1 rounded-full ml-3 flex-shrink-0 bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-1"
                        >
                          {checkingChapter === `${ch.code}-${subject}` ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : 'Practice'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-surface-light/80 dark:bg-surface-dark/80 rounded-xl p-4 border border-border-light dark:border-border-dark text-center">
                      <span className="material-icons-outlined text-success-light dark:text-success-dark text-2xl mb-1">emoji_events</span>
                      <p className="text-sm font-medium text-text-light dark:text-text-dark">Strong performance!</p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">No major weak chapters detected.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty Analysis */}
        <section>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-1">Difficulty Analysis</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Deep dive into accuracy levels across different complexity tiers.</p>
          </div>
          {md ? (
            <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl border border-border-light dark:border-border-dark p-10 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {DIFFICULTY_CONFIG.map(({ label, color, correct, incorrect, unattempted, total }) => (
                  <DonutChart
                    key={label}
                    label={label}
                    correct={correct}
                    incorrect={incorrect}
                    unattempted={unattempted}
                    total={total}
                    color={color}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-light/80 dark:bg-surface-dark/80 rounded-2xl border border-border-light dark:border-border-dark p-8 text-center">
              <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-3xl mb-2">bar_chart</span>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Difficulty data not available for this test.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default AIInsightsPage;
