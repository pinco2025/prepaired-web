import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { withTimeout } from '../utils/promiseUtils';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';
import {
    RenderMath,
    MCQOptions,
    NumericKeypad,
    SolutionDisplay,
    isIntegerTypeQuestion,
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
    examDate?: string;
    examShift?: string;
    subject?: string;
    tags?: {
        tag1?: string | null;
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



const QuestionPractice: React.FC = () => {
    const { subject, chapterCode } = useParams<{ subject: string; chapterCode: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [numericAnswers, setNumericAnswers] = useState<{ [key: number]: string }>({});
    const [isPaletteOpen, setIsPaletteOpen] = useState(() => window.innerWidth >= 1024);

    // Chapter Navigation State
    const [nextChapter, setNextChapter] = useState<string | null>(null);
    const [prevChapter, setPrevChapter] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!subject || !chapterCode) return;

            try {
                setLoading(true);

                // 0. Fetch Chapters
                const chaptersRes = await withTimeout(fetch('/chapters.json'), 15000, 'Chapters fetch timed out');
                let chaptersData: any = {};
                if (chaptersRes.ok) {
                    chaptersData = await chaptersRes.json();
                    if (chaptersData[subject]) {
                        const list = chaptersData[subject];

                        // Find current index
                        const currentIndex = list.findIndex((c: any) => c.code === chapterCode);
                        if (currentIndex !== -1) {
                            if (currentIndex < list.length - 1) setNextChapter(list[currentIndex + 1].code);
                            else setNextChapter(null);

                            if (currentIndex > 0) setPrevChapter(list[currentIndex - 1].code);
                            else setPrevChapter(null);
                        }
                    }
                }

                // Fetch from Local JSON Data
                console.log('Fetching questions from local data...');
                const questionsRes = await withTimeout(fetch('/data/jee_2026_pyqs.json'), 15000, `Questions fetch timed out`);
                if (!questionsRes.ok) throw new Error(`Failed to load questions from local data`);
                const allData: Question[] = await questionsRes.json();

                // Filter by chapter code (tag2) — chapter codes are unique across subjects
                const chapterQuestions = allData.filter(
                    q => q.tags?.tag2 === chapterCode
                );

                setQuestions(chapterQuestions);

                // Reset state for new chapter
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setShowSolution(false);
                setUserAnswers({});
                setNumericAnswers({});

            } catch (err: any) {
                console.error(err);

                // Smart Navigation Logic: If fetching fails (likely 404 or empty), try to skip to next/prev
                const direction = location.state?.direction;

                if (direction && (err.message === 'Failed to load questions' || err.message.includes('404'))) {
                    console.log(`Failed to load ${chapterCode}, skipping (${direction})...`);

                    // We need chapters list to find next
                    // Since we fetched it in step 0, we can try to use state or re-fetch (but re-fetch inside catch is messy)
                    // Better approach: ensure we have chaptersData available here.
                    // Actually, let's just refetch strictly for navigation calculation if needed, 
                    // OR leverage the setNextChapter/setPrevChapter logic if we can.

                    // But nextChapter/prevChapter state setters might not have run or finished if we failed early?
                    // Actually, step 0 runs before step 1/2. So we *likely* have cached locally in `chaptersData` var if we scope it out.

                    // Re-fetching chapters strictly for the skip logic (safest to avoid scope issues)
                    try {
                        const chRes = await fetch('/chapters.json');
                        if (chRes.ok) {
                            const chData = await chRes.json();
                            const list = chData[subject!] || [];
                            const currentIndex = list.findIndex((c: any) => c.code === chapterCode);

                            if (currentIndex !== -1) {
                                let newTarget = null;
                                if (direction === 'next' && currentIndex < list.length - 1) {
                                    newTarget = list[currentIndex + 1].code;
                                } else if (direction === 'prev' && currentIndex > 0) {
                                    newTarget = list[currentIndex - 1].code;
                                }

                                if (newTarget) {
                                    // Replace current history entry so user doesn't get stuck in back-button loop of empty pages
                                    navigate(`/pyq-2026/${subject}/practice/${newTarget}`, {
                                        replace: true,
                                        state: { direction }
                                    });
                                    return; // Stop processing, we are navigating away
                                }
                            }
                        }
                    } catch (navErr) {
                        console.error("Navigation skip failed", navErr);
                    }
                }

                setError(`Failed to load practice data: ${err.message}`);
                setLoading(false); // Only unset loading if we actually error out and don't navigate
            } finally {
                // strict mode double set protection?
                // If we navigated away, the component unmounts/remounts, so this finally block runs on unmounted component?
                // It's mostly fine, React handles it.
                // But if we navigated, we want loading to stay true potentially?
                // use 'return' in catch block avoids finally? No.
                // We should only setLoading(false) if we didn't navigate.
                // But we can't easily know if navigate happened synchronous enough.
                // Actually, if we navigate, this component dies.
                // So setLoading(false) might trigger warning "update on unmounted component".
                // We can use a ref to track mounted state.

                // For now, simple check:
                // If we errored and didn't redirect, we set loading false.
                // If we redirected, we effectively don't care.
                if (!location.state?.skipping) {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [subject, chapterCode, navigate, location.state]);

    const handleOptionSelect = (optionId: string) => {
        if (showSolution) return; // Prevent changing answer after proper check

        const newSelection = selectedOption === optionId ? null : optionId;
        setSelectedOption(newSelection);

        setUserAnswers(prev => {
            const next = { ...prev };
            if (newSelection) {
                next[currentQuestionIndex] = newSelection;
            } else {
                delete next[currentQuestionIndex];
            }
            return next;
        });
    };

    const handleNumericChange = (value: string) => {
        setNumericAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            const nextIdx = currentQuestionIndex + 1;
            setSelectedOption(userAnswers[nextIdx] || null);
            setShowSolution(false);
        } else if (nextChapter) {
            // Navigate to Next Chapter
            navigate(`/pyq-2026/${subject}/practice/${nextChapter}`, { state: { direction: 'next' } });
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            const prevIdx = currentQuestionIndex - 1;
            setSelectedOption(userAnswers[prevIdx] || null);
            setShowSolution(false);
        } else if (prevChapter) {
            // Navigate to Previous Chapter
            navigate(`/pyq-2026/${subject}/practice/${prevChapter}`, { state: { direction: 'prev' } });
        }
    };



    // Fullscreen on Mount
    useEffect(() => {
        const enterFullScreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if ((document.documentElement as any).webkitRequestFullscreen) {
                    await (document.documentElement as any).webkitRequestFullscreen(); // Safari
                } else if ((document.documentElement as any).msRequestFullscreen) {
                    await (document.documentElement as any).msRequestFullscreen(); // IE11
                }
            } catch (err) {
                console.warn("Fullscreen request denied:", err);
            }
        };

        enterFullScreen();

        // Optional: Exit on unmount? 
        // return () => { if (document.exitFullscreen) document.exitFullscreen(); };
    }, []);

    // Close palette automatically on mobile selection
    const handlePaletteSelect = (idx: number) => {
        setCurrentQuestionIndex(idx);
        setSelectedOption(userAnswers[idx] || null);
        setShowSolution(false);
        if (window.innerWidth < 1024) setIsPaletteOpen(false);
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCurrentInteger = currentQuestion ? isIntegerTypeQuestion(currentQuestion) : false;
    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!currentQuestion) return <div className="p-8 text-center text-text-secondary-light">No questions found for this chapter.</div>;

    const currentSolution = currentQuestion.solution;

    // Navigation Button States
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const showPrevChapterParams = isFirstQuestion && prevChapter;
    const showNextChapterParams = isLastQuestion && nextChapter;

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
                        onClick={() => navigate(`/pyq-2026/${subject}`)}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary-light">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-text-light dark:text-text-dark text-sm md:text-base line-clamp-1">
                            {chapterCode} Practice
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-text-secondary-light font-medium uppercase tracking-wider">
                            <span className="text-primary">{subject}</span>
                            <span>•</span>
                            <span>Q{currentQuestionIndex + 1} of {questions.length}</span>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
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
                                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-4 ${isCurrentInteger
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-background-light dark:bg-white/5 text-text-secondary-light'
                                    }`}>
                                    {isCurrentInteger ? 'Integer Type' : 'Single Correct Type'}
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
                                                {(() => {
                                                    const match = currentQuestion.tags.tag1?.match(/^(\d+)-S(\d+)$/);
                                                    if (match) {
                                                        return `${match[1]} January Shift ${match[2]}`;
                                                    }
                                                    return currentQuestion.tags.tag1;
                                                })()}
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


                            {/* Options / Keypad */}
                            {isCurrentInteger ? (
                                <div className="py-4">
                                    <NumericKeypad
                                        value={numericAnswers[currentQuestionIndex] || ''}
                                        onChange={handleNumericChange}
                                        disabled={showSolution}
                                        showResult={showSolution}
                                        isCorrect={showSolution && (numericAnswers[currentQuestionIndex] || '').trim() === currentQuestion.correctAnswer?.trim()}
                                        correctAnswer={currentQuestion.correctAnswer}
                                    />
                                </div>
                            ) : (
                                <MCQOptions
                                    options={currentQuestion.options}
                                    selectedId={selectedOption}
                                    onSelect={handleOptionSelect}
                                    disabled={showSolution}
                                    showResult={showSolution}
                                    correctAnswerId={currentQuestion.correctAnswer}
                                    layout="grid"
                                />
                            )}

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

                {/* Question Palette Sidebar (Responsive Overlay) */}
                <aside className={`
                    absolute lg:relative right-0 top-0 bottom-0 z-20
                    transition-all duration-300 ease-in-out overflow-hidden
                    bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark
                    ${isPaletteOpen ? 'w-72 shadow-2xl lg:shadow-none translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0'}
                `}>
                    <div className="h-full overflow-y-auto p-4 md:p-6 w-full themed-scrollbar">
                        <h3 className="font-bold text-text-light dark:text-text-dark mb-4 flex items-center justify-between">
                            <span>Question Palette</span>
                            <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </h3>

                        {/* Split questions into MCQ and Integer */}
                        {(() => {
                            const mcqIndices: number[] = [];
                            const intIndices: number[] = [];
                            questions.forEach((q, idx) => {
                                if (isIntegerTypeQuestion(q)) {
                                    intIndices.push(idx);
                                } else {
                                    mcqIndices.push(idx);
                                }
                            });

                            const renderGrid = (indices: number[]) => (
                                <div className="grid grid-cols-5 gap-2">
                                    {indices.map((idx) => {
                                        const isCurrent = currentQuestionIndex === idx;
                                        const isAnswered = isIntegerTypeQuestion(questions[idx])
                                            ? !!(numericAnswers[idx]?.trim())
                                            : !!userAnswers[idx];
                                        let btnClass = "w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ";

                                        if (isCurrent) btnClass += "bg-primary text-white shadow-md shadow-primary/30";
                                        else if (isAnswered) btnClass += "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
                                        else btnClass += "border border-border-light dark:border-border-dark text-text-secondary-light hover:border-primary/50";

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handlePaletteSelect(idx)}
                                                className={btnClass}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            );

                            return (
                                <>
                                    {/* MCQ Section */}
                                    {mcqIndices.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary-light/50 px-1">MCQ</span>
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent" />
                                            </div>
                                            {renderGrid(mcqIndices)}
                                        </>
                                    )}

                                    {/* Integer Section */}
                                    {intIndices.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2 mt-4">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/70 dark:text-amber-400/60 px-1">Integer</span>
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                                            </div>
                                            {renderGrid(intIndices)}
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 md:static h-16 md:h-auto md:min-h-[5rem] bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex items-center px-6 md:px-8 z-40 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 md:gap-2 relative">

                    {/* Previous Button */}
                    <button
                        onClick={handlePrevious}
                        disabled={!showPrevChapterParams && currentQuestionIndex === 0}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-surface-light dark:bg-surface-dark md:bg-transparent text-text-secondary-light font-bold hover:bg-background-light dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-border-light dark:border-border-dark md:border-transparent md:hover:border-border-light md:dark:hover:border-border-dark shadow-sm md:shadow-none"
                        title={showPrevChapterParams ? "Previous Chapter" : "Previous Question"}
                    >
                        <span className="material-symbols-outlined text-2xl md:text-xl">
                            {showPrevChapterParams ? 'fast_rewind' : 'chevron_left'}
                        </span>
                        <span className="hidden md:inline ml-2">{showPrevChapterParams ? 'Previous Chapter' : 'Previous'}</span>
                    </button>

                    {/* Check Answer (Center on Mobile & Desktop) */}
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

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        disabled={!showNextChapterParams && currentQuestionIndex === questions.length - 1}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-primary md:bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={showNextChapterParams ? "Next Chapter" : "Next Question"}
                    >
                        <span className="hidden md:inline mr-1">{showNextChapterParams ? 'Next Chapter' : 'Next'}</span>
                        <span className="material-symbols-outlined text-2xl md:text-xl">
                            {showNextChapterParams ? 'fast_forward' : 'chevron_right'}
                        </span>
                    </button>
                </div>
            </footer>
        </div >
    );
};

export default QuestionPractice;
