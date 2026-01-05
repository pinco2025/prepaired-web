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

const subjectColors = {
  Physics: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/30',
    badge: 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300',
    progressBg: 'bg-blue-100 dark:bg-blue-900/30',
    progressFill: 'bg-blue-500',
  },
  Chemistry: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/30',
    badge: 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-300',
    progressBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    progressFill: 'bg-emerald-500',
  },
  Mathematics: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/30',
    badge: 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-300',
    progressBg: 'bg-amber-100 dark:bg-amber-900/30',
    progressFill: 'bg-amber-500',
  },
};

const WeakAreasCard: React.FC<WeakAreasCardProps> = ({ chapterData }) => {
  const [chapterMapping, setChapterMapping] = useState<ChaptersBySubject | null>(null);
  const [weakChapters, setWeakChapters] = useState<WeakChapter[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -60, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 60, behavior: 'smooth' });
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
    <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-4 lg:p-5 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">priority_high</span> Weak Chapters
        </h2>
        {weakChapters.length > 0 && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={scrollUp}
              className="p-1 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-border-light dark:hover:bg-border-dark opacity-50 hover:opacity-100 transition-all duration-200"
              aria-label="Scroll up"
            >
              <span className="material-symbols-outlined text-base">keyboard_arrow_up</span>
            </button>
            <button
              onClick={scrollDown}
              className="p-1 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-border-light dark:hover:bg-border-dark opacity-50 hover:opacity-100 transition-all duration-200"
              aria-label="Scroll down"
            >
              <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
            </button>
          </div>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {weakChapters.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              No chapter data available
            </p>
          </div>
        ) : (
          weakChapters.map((chapter, index) => {
            const colors = subjectColors[chapter.subject];
            const progressPercent = chapter.total > 0 ? (chapter.attempted / chapter.total) * 100 : 0;

            return (
              <div
                key={chapter.code}
                className={`rounded-xl p-2.5 border ${colors.bg} ${colors.border} transition-all duration-200 hover:scale-[1.01]`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-text-light dark:text-text-dark truncate flex-1">
                    {chapter.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge} shrink-0`}>
                    {chapter.subject.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 rounded-full h-1.5 ${colors.progressBg}`}>
                    <div
                      className={`h-1.5 rounded-full ${colors.progressFill} transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark shrink-0 font-medium">
                    {chapter.attempted}/{chapter.total}
                  </span>
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
