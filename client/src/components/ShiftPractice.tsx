import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { withTimeout } from '../utils/promiseUtils';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';
import {
    RenderMath,
    MCQOptions,
    SolutionDisplay,
} from './question';

interface Option {
    id: string;
    text: string;
    image: string | null;
}

interface Question {
    id: string;
    uuid: string;
    text: string;
    image: string | null;
    options: Option[];
    correctAnswer: string;
    tags?: {
        tag1?: string | null;
        tag2?: string | null;
        [key: string]: any;
    };
    metadata?: {
        importance_level?: string | null;
        [key: string]: any;
    };
    solution?: {
        text: string;
        image: string | null;
    };
}

interface ChapterEntry {
    code: string;
    name: string;
    level: number;
}

interface ChaptersData {
    [subject: string]: ChapterEntry[];
}

interface SubjectGroup {
    subject: string;
    icon: string;
    color: string;
    questions: Question[];
    startIndex: number; // global index offset for this group
}

const ShiftPractice: React.FC = () => {
    const { shiftId } = useParams<{ shiftId: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isPaletteOpen, setIsPaletteOpen] = useState(() => window.innerWidth >= 1024);
    const [chaptersData, setChaptersData] = useState<ChaptersData>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!shiftId) return;

            try {
                setLoading(true);

                // Fetch questions and chapters in parallel
                const [questionsRes, chaptersRes] = await Promise.all([
                    withTimeout(fetch('/data/jee_2026_pyqs.json'), 15000, 'Questions fetch timed out'),
                    withTimeout(fetch('/chapters.json'), 10000, 'Chapters fetch timed out')
                ]);

                if (!questionsRes.ok) throw new Error('Failed to load questions from local data');
                const allData: Question[] = await questionsRes.json();

                if (chaptersRes.ok) {
                    const chData: ChaptersData = await chaptersRes.json();
                    setChaptersData(chData);
                }

                // Filter by shift ID (tag1)
                const shiftQuestions = allData.filter(q => q.tags?.tag1 === shiftId);
                setQuestions(shiftQuestions);

                // Reset state
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setShowSolution(false);
                setUserAnswers({});
            } catch (err: any) {
                console.error(err);
                setError(`Failed to load practice data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [shiftId]);

    // Build a lookup: tag2 code -> subject
    const tag2ToSubject = useMemo(() => {
        const map: { [code: string]: string } = {};
        Object.entries(chaptersData).forEach(([subject, chapters]) => {
            chapters.forEach(ch => {
                map[ch.code] = subject;
            });
        });
        return map;
    }, [chaptersData]);

    // Group questions by subject, maintaining order
    const subjectGroups: SubjectGroup[] = useMemo(() => {
        const subjectConfig: { key: string; icon: string; color: string }[] = [
            { key: 'Physics', icon: 'bolt', color: 'blue' },
            { key: 'Chemistry', icon: 'science', color: 'green' },
            { key: 'Mathematics', icon: 'calculate', color: 'orange' },
        ];

        const grouped: { [key: string]: Question[] } = {};
        questions.forEach(q => {
            const sub = tag2ToSubject[q.tags?.tag2 || ''] || 'Other';
            if (!grouped[sub]) grouped[sub] = [];
            grouped[sub].push(q);
        });

        let runningIndex = 0;
        const groups: SubjectGroup[] = [];
        subjectConfig.forEach(cfg => {
            const qs = grouped[cfg.key] || [];
            if (qs.length > 0) {
                groups.push({
                    subject: cfg.key,
                    icon: cfg.icon,
                    color: cfg.color,
                    questions: qs,
                    startIndex: runningIndex,
                });
                runningIndex += qs.length;
            }
        });

        // Handle any "Other" questions
        const other = grouped['Other'] || [];
        if (other.length > 0) {
            groups.push({
                subject: 'Other',
                icon: 'help',
                color: 'gray',
                questions: other,
                startIndex: runningIndex,
            });
        }

        return groups;
    }, [questions, tag2ToSubject]);

    // Flatten for consistent indexing (ordered by subject groups)
    const orderedQuestions = useMemo(() => {
        return subjectGroups.flatMap(g => g.questions);
    }, [subjectGroups]);

    const handleOptionSelect = (optionId: string) => {
        if (showSolution) return;
        const newSelection = selectedOption === optionId ? null : optionId;
        setSelectedOption(newSelection);
        setUserAnswers(prev => {
            const next = { ...prev };
            if (newSelection) next[currentQuestionIndex] = newSelection;
            else delete next[currentQuestionIndex];
            return next;
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < orderedQuestions.length - 1) {
            const nextIdx = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIdx);
            setSelectedOption(userAnswers[nextIdx] || null);
            setShowSolution(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            const prevIdx = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIdx);
            setSelectedOption(userAnswers[prevIdx] || null);
            setShowSolution(false);
        }
    };

    // Fullscreen on Mount
    useEffect(() => {
        const enterFullScreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if ((document.documentElement as any).webkitRequestFullscreen) {
                    await (document.documentElement as any).webkitRequestFullscreen();
                } else if ((document.documentElement as any).msRequestFullscreen) {
                    await (document.documentElement as any).msRequestFullscreen();
                }
            } catch (err) {
                console.warn("Fullscreen request denied:", err);
            }
        };
        enterFullScreen();
    }, []);

    const handlePaletteSelect = (idx: number) => {
        setCurrentQuestionIndex(idx);
        setSelectedOption(userAnswers[idx] || null);
        setShowSolution(false);
        if (window.innerWidth < 1024) setIsPaletteOpen(false);
    };

    const currentQuestion = orderedQuestions[currentQuestionIndex];
    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!currentQuestion) return <div className="p-8 text-center text-text-secondary-light">No questions found for this shift.</div>;

    const currentSolution = currentQuestion.solution;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === orderedQuestions.length - 1;
    const displayShiftName = shiftId ? decodeURIComponent(shiftId) : 'Shift Practice';

    // Find which subject group the current question belongs to
    const currentSubjectGroup = subjectGroups.find(g =>
        currentQuestionIndex >= g.startIndex && currentQuestionIndex < g.startIndex + g.questions.length
    );

    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
        green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
        gray: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/20' },
    };

    return (
        <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-4 rounded-none md:rounded-3xl overflow-hidden relative border-0 md:border border-border-light dark:border-border-dark shadow-none md:shadow-xl bg-surface-light dark:bg-surface-dark">
            <style>{`
                .themed-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .themed-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .themed-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4));
                    border-radius: 20px;
                }
                .themed-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(99,102,241,0.7), rgba(139,92,246,0.7));
                }
                .dark .themed-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
                }
                .dark .themed-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5));
                }
            `}</style>
            <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10 bg-fixed pointer-events-none opacity-60"></div>

            {/* Header */}
            <header className="h-14 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 md:px-8 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/pyq-2026`)}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary-light">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-text-light dark:text-text-dark text-sm md:text-base line-clamp-1">
                            {displayShiftName}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-text-secondary-light font-medium uppercase tracking-wider">
                            {currentSubjectGroup && (
                                <span className={colorMap[currentSubjectGroup.color]?.text || 'text-primary'}>
                                    {currentSubjectGroup.subject}
                                </span>
                            )}
                            <span>•</span>
                            <span>Q{currentQuestionIndex + 1} of {orderedQuestions.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                        className="flex items-center justify-center p-2 rounded-lg text-text-secondary-light hover:bg-background-light dark:hover:bg-white/5 transition-all"
                        title="Toggle Question Palette"
                    >
                        <span className="material-symbols-outlined">{isPaletteOpen ? 'last_page' : 'grid_view'}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 md:pb-4 scroll-smooth themed-scrollbar">
                    <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-center pb-8">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 md:p-6 mb-3">

                            {/* Question Content */}
                            <div className="mb-4">
                                <div className="inline-block px-3 py-1 bg-background-light dark:bg-white/5 rounded-lg text-xs font-bold text-text-secondary-light uppercase tracking-widest mb-4">
                                    Single Correct Type
                                </div>

                                {/* analytical metadata */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[10px] font-mono text-text-secondary-light/60 uppercase tracking-widest">
                                    {currentQuestion.metadata?.importance_level && (
                                        <span className="text-primary/80 font-bold">
                                            {currentQuestion.metadata.importance_level}
                                        </span>
                                    )}

                                    {currentQuestion.tags?.tag1 && (
                                        <>
                                            {currentQuestion.metadata?.importance_level && <span className="opacity-30">|</span>}
                                            <span className="text-sm font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-sm tracking-wider">
                                                {currentQuestion.tags.tag1}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="text-lg md:text-xl font-medium leading-relaxed text-text-light dark:text-text-dark mb-2 whitespace-pre-wrap break-words">
                                    <RenderMath text={currentQuestion.text} />
                                </div>
                                {currentQuestion.image && (
                                    <div className="mt-2 w-full flex justify-center">
                                        <ImageWithProgress
                                            src={currentQuestion.image}
                                            alt="Question"
                                            className="max-w-full md:max-w-xl max-h-[35vh] w-auto h-auto rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <MCQOptions
                                options={currentQuestion.options}
                                selectedId={selectedOption}
                                onSelect={handleOptionSelect}
                                disabled={showSolution}
                                showResult={showSolution}
                                correctAnswerId={currentQuestion.correctAnswer}
                                layout="grid"
                            />

                            {/* Solution Display */}
                            <SolutionDisplay
                                text={currentSolution?.text}
                                image={currentSolution?.image}
                                visible={showSolution && !!currentSolution}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                {isPaletteOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsPaletteOpen(false)}
                    />
                )}

                {/* Question Palette Sidebar */}
                <aside className={`
                    absolute lg:relative right-0 top-0 bottom-0 z-20
                    transition-all duration-300 ease-in-out overflow-hidden
                    bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark
                    ${isPaletteOpen ? 'w-72 shadow-2xl lg:shadow-none translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0'}
                `}>
                    <div className="h-full overflow-y-auto p-4 md:p-5 w-full themed-scrollbar">
                        <h3 className="font-bold text-text-light dark:text-text-dark mb-4 flex items-center justify-between text-sm">
                            <span>Question Palette</span>
                            <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </h3>

                        {/* Subject-grouped sections */}
                        <div className="flex flex-col gap-4">
                            {subjectGroups.map((group) => {
                                const colors = colorMap[group.color] || colorMap.gray;
                                return (
                                    <div key={group.subject}>
                                        {/* Subject Header */}
                                        <div className={`flex items-center gap-2 mb-2.5 px-1`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
                                                <span className="material-symbols-outlined text-base">{group.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                                                {group.subject}
                                            </span>
                                            <span className="text-[10px] text-text-secondary-light ml-auto font-medium">
                                                {group.questions.length}
                                            </span>
                                        </div>

                                        {/* Question Grid */}
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {group.questions.map((_, localIdx) => {
                                                const globalIdx = group.startIndex + localIdx;
                                                const isCurrent = currentQuestionIndex === globalIdx;
                                                const isAnswered = !!userAnswers[globalIdx];
                                                let btnClass = "w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ";

                                                if (isCurrent) {
                                                    btnClass += "bg-primary text-white shadow-md shadow-primary/30 scale-105";
                                                } else if (isAnswered) {
                                                    btnClass += "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
                                                } else {
                                                    btnClass += `border ${colors.border} text-text-secondary-light hover:border-primary/50 hover:bg-background-light dark:hover:bg-white/5`;
                                                }

                                                return (
                                                    <button
                                                        key={globalIdx}
                                                        onClick={() => handlePaletteSelect(globalIdx)}
                                                        className={btnClass}
                                                    >
                                                        {localIdx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 md:static h-16 md:h-auto md:min-h-[5rem] bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex items-center px-6 md:px-8 z-40 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 md:gap-2 relative">

                    <button
                        onClick={handlePrevious}
                        disabled={isFirstQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-surface-light dark:bg-surface-dark md:bg-transparent text-text-secondary-light font-bold hover:bg-background-light dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-border-light dark:border-border-dark md:border-transparent md:hover:border-border-light md:dark:hover:border-border-dark shadow-sm md:shadow-none"
                        title="Previous Question"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-xl">chevron_left</span>
                        <span className="hidden md:inline ml-2">Previous</span>
                    </button>

                    <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto">
                        <button
                            onClick={() => setShowSolution(!showSolution)}
                            className={`flex items-center justify-center w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl font-bold transition-all shadow-md md:shadow-sm ${showSolution
                                ? 'bg-background-light dark:bg-white/5 text-text-secondary-light border border-border-light dark:border-border-dark'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/30'
                                }`}
                            title={showSolution ? "Hide Solution" : "Check Answer"}
                        >
                            <span className="material-symbols-outlined text-3xl md:text-xl">{showSolution ? 'visibility_off' : 'check'}</span>
                            <span className="hidden md:inline md:ml-2 text-sm md:text-base">{showSolution ? 'Solution' : 'Check'}</span>
                        </button>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={isLastQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-primary md:bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Question"
                    >
                        <span className="hidden md:inline mr-1">Next</span>
                        <span className="material-symbols-outlined text-2xl md:text-xl">chevron_right</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ShiftPractice;
