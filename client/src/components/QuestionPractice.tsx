import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ImageWithProgress from './ImageWithProgress';

// Enhanced text renderer that mimics TestInterface
const RenderText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    // Split by both $$ (display) and $ (inline) delimiters
    // Logic adapted from TestInterface.tsx
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    // Display math
                    return <BlockMath key={index} math={part.slice(2, -2)} />;
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    // Inline math
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                // Plain text - render as is (no dangerouslySetInnerHTML), preserving formatting via CSS
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

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
}

interface Solution {
    id: string;
    uuid: string;
    text: string;
    image: string | null;
}

interface QuestionsJsonResponse {
    subject: string;
    chapter_code: string;
    questions: Question[];
}

interface SolutionsJsonResponse {
    solutions: Solution[];
}

const QuestionPractice: React.FC = () => {
    const { subject, chapterCode } = useParams<{ subject: string; chapterCode: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [solutions, setSolutions] = useState<{ [key: string]: Solution }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isPaletteOpen, setIsPaletteOpen] = useState(() => window.innerWidth >= 1024);

    // Chapter Navigation State
    const [nextChapter, setNextChapter] = useState<string | null>(null);
    const [prevChapter, setPrevChapter] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!subject || !chapterCode) return;

            try {
                setLoading(true);

                // 0. Fetch Chapters (Parallelized with Supabase check if possible, but keep simple for now)
                const chaptersRes = await fetch('/chapters.json');
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

                // 1. Fetch the GitHub folder URL from Supabase (using super-30 set as reference for the repo)
                const { data: setRow, error: dbError } = await supabase
                    .from('question_set')
                    .select('url')
                    .eq('set_id', '26-pyq')
                    .single();

                if (dbError) throw new Error(`Supabase Error: ${dbError.message}`);
                if (!setRow?.url) throw new Error('No URL found for Super 30 set');

                // 2. Transform the GitHub URL to a Raw Content URL
                let rawBaseUrl = setRow.url
                    .replace('github.com', 'raw.githubusercontent.com')
                    .replace('/tree/', '/');

                if (rawBaseUrl.endsWith('/')) {
                    rawBaseUrl = rawBaseUrl.slice(0, -1);
                }

                const questionUrl = `${rawBaseUrl}/${subject}/${chapterCode}_questions.json`;
                const solutionUrl = `${rawBaseUrl}/${subject}/${chapterCode}_solutions.json`;

                // Fetch Questions
                const questionsRes = await fetch(questionUrl);
                if (!questionsRes.ok) throw new Error('Failed to load questions');
                const questionsData: QuestionsJsonResponse = await questionsRes.json();

                // Fetch Solutions
                const solutionsRes = await fetch(solutionUrl);
                if (!solutionsRes.ok) throw new Error('Failed to load solutions');
                const solutionsData: SolutionsJsonResponse = await solutionsRes.json();

                setQuestions(questionsData.questions || []);

                // Map solutions by UUID
                const solMap: { [key: string]: Solution } = {};
                if (solutionsData.solutions) {
                    solutionsData.solutions.forEach(sol => {
                        solMap[sol.uuid] = sol;
                    });
                }
                setSolutions(solMap);

                // Reset state for new chapter
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setShowSolution(false);
                setUserAnswers({});

            } catch (err) {
                console.error(err);
                setError('Failed to load practice data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject, chapterCode]);

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

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            const nextIdx = currentQuestionIndex + 1;
            setSelectedOption(userAnswers[nextIdx] || null);
            setShowSolution(false);
        } else if (nextChapter) {
            // Navigate to Next Chapter
            navigate(`/pyq-2026/${subject}/practice/${nextChapter}`);
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
            navigate(`/pyq-2026/${subject}/practice/${prevChapter}`);
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
    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!currentQuestion) return <div className="p-8 text-center text-text-secondary-light">No questions found for this chapter.</div>;

    const currentSolution = solutions[currentQuestion.uuid];

    // Navigation Button States
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const showPrevChapterParams = isFirstQuestion && prevChapter;
    const showNextChapterParams = isLastQuestion && nextChapter;

    return (
        <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-4 rounded-none md:rounded-3xl overflow-hidden relative border-0 md:border border-border-light dark:border-border-dark shadow-none md:shadow-xl bg-surface-light dark:bg-surface-dark">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(75, 85, 99, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.8);
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(75, 85, 99, 0.8);
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
                <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 md:pb-4 scroll-smooth custom-scrollbar">
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
                                    <RenderText text={currentQuestion.text} />
                                </div>
                                {currentQuestion.image && (
                                    <div className="p-4 bg-white rounded-xl border border-gray-200 mt-2 w-fit mx-auto flex justify-center max-w-full">
                                        <ImageWithProgress
                                            src={currentQuestion.image}
                                            alt="Question"
                                            className="max-w-full md:max-w-xl max-h-[35vh] w-auto h-auto rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options && currentQuestion.options.map((option, index) => {
                                    const optionId = option.id; // 'a', 'b', etc.
                                    const isSelected = selectedOption === optionId;
                                    const isCorrect = currentQuestion.correctAnswer && currentQuestion.correctAnswer.toLowerCase() === optionId.toLowerCase();

                                    let borderClass = 'border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-background-light dark:hover:bg-white/5';
                                    if (showSolution) {
                                        if (isCorrect) borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/10';
                                        else if (isSelected) borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/10';
                                    } else if (isSelected) {
                                        borderClass = 'border-primary bg-primary/5';
                                    }

                                    return (
                                        <label
                                            key={index}
                                            className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] group ${borderClass}`}
                                            onClick={() => handleOptionSelect(optionId)}
                                        >
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold text-sm uppercase mt-0.5 transition-colors ${isSelected ? 'border-primary bg-primary text-white' : 'border-text-secondary-light/30 text-text-secondary-light'}`}>
                                                {isSelected ? <span className="material-symbols-outlined text-base">check</span> : optionId}
                                            </div>
                                            <div className="flex-1 whitespace-pre-wrap break-words">
                                                {option.text && <RenderText text={option.text} />}
                                                {option.image && (
                                                    <div className="mt-2 text-center flex justify-center">
                                                        <ImageWithProgress
                                                            src={option.image}
                                                            alt={`Option ${optionId}`}
                                                            className="max-w-full max-h-40 w-auto h-auto inline-block rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );

                                })}
                            </div>

                            {/* Solution Display */}
                            {showSolution && currentSolution && (
                                <div className="mt-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Detailed Solution</h3>
                                    <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark break-words overflow-x-auto">
                                        {currentSolution.text && (
                                            <div>
                                                <RenderText text={currentSolution.text} />
                                            </div>
                                        )}

                                        {currentSolution.image && (
                                            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-full bg-white p-2 w-fit mx-auto flex justify-center">
                                                <ImageWithProgress
                                                    src={currentSolution.image}
                                                    alt="Solution"
                                                    className="max-w-full md:max-w-lg max-h-[30vh] w-auto h-auto rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                    <div className="h-full overflow-y-auto p-4 md:p-6 w-full">
                        <h3 className="font-bold text-text-light dark:text-text-dark mb-4 flex items-center justify-between">
                            <span>Question Palette</span>
                            <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, idx) => {
                                const isCurrent = currentQuestionIndex === idx;
                                const isAnswered = !!userAnswers[idx];
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
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 md:static h-16 md:h-auto md:min-h-[5rem] bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex items-center px-6 md:px-8 z-40 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 md:gap-2">

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

                    {/* Check Answer (Center on Mobile) */}
                    <div className="flex-1 flex justify-center md:items-center md:justify-end md:order-last">
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
