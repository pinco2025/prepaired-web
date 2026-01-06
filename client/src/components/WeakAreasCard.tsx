import React, { useState, useEffect, useRef } from 'react';

interface ChapterStats {
  attempted: number;
  unattempted: number;
  correct: number;
  incorrect: number;
  total_questions: number;
}

interface ChapterInfo {
  code: string;
  name: string;
}

interface ChaptersBySubject {
  Physics: ChapterInfo[];
  Chemistry: ChapterInfo[];
  Mathematics: ChapterInfo[];
}

interface WeakChapter {
  code: string;
  name: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  attempted: number;
  total: number;
}

interface WeakAreasCardProps {
  chapterData?: Record<string, ChapterStats> | null;
}

const subjectConfig = {
  Physics: {
    icon: 'bolt',
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    border: 'border-blue-200/50 dark:border-blue-700/30',
    badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    progressBg: 'bg-blue-100 dark:bg-blue-900/40',
    progressFill: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    glow: 'shadow-blue-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  Chemistry: {
    icon: 'science',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    border: 'border-emerald-200/50 dark:border-emerald-700/30',
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    progressBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    progressFill: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  Mathematics: {
    icon: 'calculate',
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    border: 'border-amber-200/50 dark:border-amber-700/30',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    progressBg: 'bg-amber-100 dark:bg-amber-900/40',
    progressFill: 'bg-gradient-to-r from-amber-400 to-orange-500',
    glow: 'shadow-amber-500/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
};

const WeakAreasCard: React.FC<WeakAreasCardProps> = ({ chapterData }) => {
  const [chapterMapping, setChapterMapping] = useState<ChaptersBySubject | null>(null);
  const [weakChapters, setWeakChapters] = useState<WeakChapter[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -70, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 70, behavior: 'smooth' });
    }
  };

  // Load chapters.json to get chapter code to name mapping
  useEffect(() => {
    const loadChapterMapping = async () => {
      try {
        const response = await fetch('/chapters.json');
        const data = await response.json();

        const mapping: ChaptersBySubject = {
          Physics: [],
          Chemistry: [],
          Mathematics: [],
        };

        // Process each subject
        for (const subject of ['Physics', 'Chemistry', 'Mathematics'] as const) {
          const chapters = data[subject] || [];
          mapping[subject] = chapters.map((ch: { code: string; name: string }) => ({
            code: ch.code,
            name: ch.name,
          }));
        }

        setChapterMapping(mapping);
      } catch (err) {
        console.error('Error loading chapter mapping:', err);
      }
    };

    loadChapterMapping();
  }, []);

  // Process chapter data with diversity algorithm
  useEffect(() => {
    if (!chapterData || !chapterMapping) return;

    // Create a map of code to subject
    const codeToSubject: Record<string, 'Physics' | 'Chemistry' | 'Mathematics'> = {};
    const codeToName: Record<string, string> = {};

    for (const subject of ['Physics', 'Chemistry', 'Mathematics'] as const) {
      for (const ch of chapterMapping[subject]) {
        codeToSubject[ch.code] = subject;
        codeToName[ch.code] = ch.name;
      }
    }

    // Convert chapter data to array with subject info and sort by attempted (ascending)
    const chaptersWithStats: WeakChapter[] = Object.entries(chapterData)
      .filter(([code]) => codeToSubject[code]) // Only include chapters we know about
      .map(([code, stats]) => ({
        code,
        name: codeToName[code] || code,
        subject: codeToSubject[code],
        attempted: stats.attempted,
        total: stats.total_questions,
      }))
      .sort((a, b) => a.attempted - b.attempted);

    // Diversity algorithm: ensure at least 1 chapter from each subject
    const selected: WeakChapter[] = [];
    const selectedCodes = new Set<string>();

    // First pass: get one chapter from each subject
    for (const subject of ['Physics', 'Chemistry', 'Mathematics'] as const) {
      const subjectChapter = chaptersWithStats.find(
        (ch) => ch.subject === subject && !selectedCodes.has(ch.code)
      );
      if (subjectChapter) {
        selected.push(subjectChapter);
        selectedCodes.add(subjectChapter.code);
      }
    }

    // Second pass: fill remaining slots (up to 5 total) with weakest chapters
    for (const ch of chaptersWithStats) {
      if (selected.length >= 5) break;
      if (!selectedCodes.has(ch.code)) {
        selected.push(ch);
        selectedCodes.add(ch.code);
      }
    }

    // Sort final selection by attempted count
    selected.sort((a, b) => a.attempted - b.attempted);

    setWeakChapters(selected);
  }, [chapterData, chapterMapping]);

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-3 sm:p-4 lg:p-5 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="flex justify-between items-center mb-3 sm:mb-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <span className="material-symbols-outlined text-white text-base sm:text-lg">priority_high</span>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-light dark:text-text-dark">
              Weak Chapters
            </h2>
            <p className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Focus areas to improve
            </p>
          </div>
        </div>
        {weakChapters.length > 0 && (
          <div className="flex items-center gap-1 bg-border-light/50 dark:bg-border-dark/50 rounded-lg p-0.5">
            <button
              onClick={scrollUp}
              className="p-1.5 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-light dark:hover:text-text-dark transition-all duration-200 active:scale-90"
              aria-label="Scroll up"
            >
              <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
            </button>
            <button
              onClick={scrollDown}
              className="p-1.5 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-light dark:hover:text-text-dark transition-all duration-200 active:scale-90"
              aria-label="Scroll down"
            >
              <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
          </div>
        )}
      </div>

      {/* Chapter list */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto no-scrollbar">
        {weakChapters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-border-light dark:bg-border-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-text-secondary-light dark:text-text-secondary-dark">menu_book</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark text-center px-4">
              No chapter data available yet
            </p>
          </div>
        ) : (
          weakChapters.map((chapter, index) => {
            const config = subjectConfig[chapter.subject];
            const progressPercent = chapter.total > 0 ? (chapter.attempted / chapter.total) * 100 : 0;

            return (
              <div
                key={chapter.code}
                className={`
                  relative rounded-xl p-2.5 sm:p-3 border backdrop-blur-sm
                  bg-gradient-to-r ${config.bgGradient} ${config.border}
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:${config.glow} hover:scale-[1.02] hover:-translate-y-0.5
                  active:scale-[0.98]
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{
                  animationDelay: `${index * 80}ms`,
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                </div>

                <div className="relative flex items-start gap-2.5 sm:gap-3">
                  {/* Subject icon */}
                  <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
                    <span className="material-symbols-outlined text-white text-xs sm:text-sm">{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-text-light dark:text-text-dark leading-tight line-clamp-2">
                        {chapter.name}
                      </span>
                      <span className={`shrink-0 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${config.badge} shadow-sm`}>
                        {chapter.subject.slice(0, 3).toUpperCase()}
                      </span>
                    </div>

                    {/* Progress section */}
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 rounded-full h-1.5 sm:h-2 ${config.progressBg} overflow-hidden`}>
                        <div
                          className={`h-full rounded-full ${config.progressFill} transition-all duration-700 ease-out relative`}
                          style={{ width: `${progressPercent}%` }}
                        >
                          {/* Animated shine on progress bar */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] sm:text-[11px] font-bold text-text-light dark:text-text-dark tabular-nums">
                          {chapter.attempted}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                          /{chapter.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WeakAreasCard;
