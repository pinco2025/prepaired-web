import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ImageWithProgress from './ImageWithProgress';
import { fetchEncryptedJson } from '../utils/cryptoUtils';

// Enhanced text renderer that mimics TestInterface
const RenderText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    // Split by both $$ (display) and $ (inline) delimiters
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    // Display math
                    return (
                        <div key={index} className="overflow-x-auto custom-scrollbar">
                            <BlockMath math={part.slice(2, -2)} />
                        </div>
                    );
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    // Inline math
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                // Plain text - render as is, preserving formatting via CSS
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

// Compact Numeric Keypad Component for Integer Type Questions
const NumericKeypad: React.FC<{
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
    correctAnswer?: string;
}> = ({ value, onChange, disabled, showResult, isCorrect, correctAnswer }) => {
    const handleKeyPress = (key: string) => {
        if (disabled) return;

        if (key === 'backspace') {
            onChange(value.slice(0, -1));
        } else if (key === '.' && !value.includes('.')) {
            onChange(value + key);
        } else if (key === '-' && value === '') {
            onChange('-');
        } else if (key !== '.' && key !== '-') {
            // Limit to reasonable length
            if (value.replace('-', '').replace('.', '').length < 10) {
                onChange(value + key);
            }
        }
    };

    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['-', '0', '.'],
    ];

    return (
        <div className="w-full max-w-xs mx-auto">
            {/* Display */}
            <div className={`mb-3 px-4 py-3 rounded-xl border-2 text-center font-mono text-xl md:text-2xl transition-all ${showResult
                ? isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'border-border-light dark:border-border-dark bg-background-light dark:bg-white/5 text-text-light dark:text-text-dark'
                }`}>
                {value || <span className="text-text-secondary-light/50">Enter answer</span>}
            </div>

            {/* Show correct answer when result is displayed and wrong */}
            {showResult && !isCorrect && correctAnswer && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Correct: <span className="font-bold font-mono">{correctAnswer}</span>
                    </span>
                </div>
            )}

            {/* Keypad Grid - Compact */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {keys.map((row, rowIdx) => (
                    row.map((key, keyIdx) => (
                        <button
                            key={`${rowIdx}-${keyIdx}`}
                            onClick={() => handleKeyPress(key)}
                            disabled={disabled}
                            className={`h-11 md:h-12 rounded-lg text-lg md:text-xl font-bold transition-all active:scale-95 ${disabled
                                ? 'opacity-50 cursor-not-allowed bg-background-light dark:bg-white/5 text-text-secondary-light'
                                : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary hover:bg-primary/5 text-text-light dark:text-text-dark shadow-sm'
                                }`}
                        >
                            {key === '-' ? '−' : key}
                        </button>
                    ))
                ))}
            </div>

            {/* Backspace Button - Compact */}
            <button
                onClick={() => handleKeyPress('backspace')}
                disabled={disabled || !value}
                className={`w-full mt-1.5 md:mt-2 h-10 md:h-11 rounded-lg flex items-center justify-center gap-1 text-sm transition-all active:scale-[0.98] ${disabled || !value
                    ? 'opacity-50 cursor-not-allowed bg-background-light dark:bg-white/5 text-text-secondary-light'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}
            >
                <span className="material-symbols-outlined text-lg">backspace</span>
                <span className="font-medium">Clear</span>
            </button>
        </div>
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
    chapterCode?: string;
    topicCode?: string;
    year?: string;
    type?: string;
}

interface Solution {
    id: string;
    number: number;
    solution_text: string;
    solution_image_url: string;
}

interface QuestionsJsonResponse {
    setId: string;
    subject: string;
    totalQuestions: number;
    exportedAt: string;
    questions: Question[];
}

interface SolutionsJsonResponse {
    setId: string;
    subject: string;
    questions: Solution[];
}

interface ChapterInfo {
    code: string;
    name: string;
    level: number;
}

interface ChaptersJson {
    Physics: ChapterInfo[];
    Chemistry: ChapterInfo[];
    Mathematics: ChapterInfo[];
}

// Helper to detect if a question is integer type
const isIntegerTypeQuestion = (question: Question): boolean => {
    // Check if options are empty or all have empty text
    const hasValidOptions = question.options &&
        question.options.length > 0 &&
        question.options.some(opt => opt.text?.trim() || opt.image);

    if (!hasValidOptions) {
        return true;
    }

    // Numeric correct answer (not a single letter like a, b, c, d) = integer type
    const answer = question.correctAnswer?.trim();
    if (answer && !['a', 'b', 'c', 'd'].includes(answer.toLowerCase()) && !isNaN(parseFloat(answer))) {
        return true;
    }

    return false;
};

const CondensedPractice: React.FC = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [solutions, setSolutions] = useState<{ [key: string]: { text: string; image: string | null } }>({});
    const [chapterMap, setChapterMap] = useState<{ [code: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [numericAnswer, setNumericAnswer] = useState<string>('');
    const [showSolution, setShowSolution] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    // Mobile: closed by default, Desktop (>=1024px): open by default
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // Handle window resize for palette default state
    useEffect(() => {
        const handleResize = () => {
            // Only auto-open on desktop if currently closed and resizing to desktop
            if (window.innerWidth >= 1024 && !isPaletteOpen) {
                setIsPaletteOpen(true);
            }
        };

        // Set initial state based on window width
        if (window.innerWidth >= 1024) {
            setIsPaletteOpen(true);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isPaletteOpen]);

    // Fetch chapters.json for chapter name expansion
    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const res = await fetch('/chapters.json');
                if (res.ok) {
                    const data: ChaptersJson = await res.json();
                    const map: { [code: string]: string } = {};

                    // Build map from all subjects
                    [...(data.Physics || []), ...(data.Chemistry || []), ...(data.Mathematics || [])].forEach(ch => {
                        map[ch.code] = ch.name;
                    });

                    setChapterMap(map);
                }
            } catch (err) {
                console.warn('Could not load chapters.json:', err);
            };
        };
        fetchChapters();
    }, []);

    // Fisher-Yates shuffle helper
    const shuffleArray = <T,>(array: T[]): T[] => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!subject) return;

            // Capitalize subject name for file lookup (e.g., 'physics' -> 'Physics')
            const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();

            try {
                setLoading(true);

                const questionUrl = `https://raw.githubusercontent.com/pinco2025/tests/refs/heads/main/condensed/${capitalizedSubject}_questions.enc`;
                const solutionUrl = `https://raw.githubusercontent.com/pinco2025/tests/refs/heads/main/condensed/${capitalizedSubject}_solutions.enc`;

                // Fetch and decrypt Questions
                console.log('Fetching encrypted questions from:', questionUrl);
                const questionsData = await fetchEncryptedJson<QuestionsJsonResponse>(questionUrl);

                // Fetch Solutions (Non-blocking)
                try {
                    console.log('Fetching encrypted solutions from:', solutionUrl);
                    const solutionsData = await fetchEncryptedJson<SolutionsJsonResponse>(solutionUrl);
                    // Map solutions by question ID (q1, q2, etc.)
                    const solMap: { [key: string]: { text: string; image: string | null } } = {};
                    if (solutionsData.questions) {
                        solutionsData.questions.forEach(sol => {
                            solMap[sol.id] = {
                                text: sol.solution_text || '',
                                image: sol.solution_image_url || null
                            };
                        });
                    }
                    setSolutions(solMap);
                } catch (solErr) {
                    console.warn('Error loading solutions:', solErr);
                }

                // Apply randomization
                let randomizedQuestions = shuffleArray(questionsData.questions || []);

                // Shuffle options for each MCQ question (not integer type)
                randomizedQuestions = randomizedQuestions.map(q => {
                    const hasValidOptions = q.options &&
                        q.options.length > 0 &&
                        q.options.some(opt => opt.text?.trim() || opt.image);

                    if (hasValidOptions) {
                        return {
                            ...q,
                            options: shuffleArray(q.options)
                        };
                    }
                    return q;
                });

                setQuestions(randomizedQuestions);

                // Reset state for new subject
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setNumericAnswer('');
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
    }, [subject]);

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

    const handleNumericAnswerChange = (value: string) => {
        setNumericAnswer(value);
        setUserAnswers(prev => {
            const next = { ...prev };
            if (value) {
                next[currentQuestionIndex] = value;
            } else {
                delete next[currentQuestionIndex];
            }
            return next;
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIdx = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIdx);

            const nextQuestion = questions[nextIdx];
            if (isIntegerTypeQuestion(nextQuestion)) {
                setNumericAnswer(userAnswers[nextIdx] || '');
                setSelectedOption(null);
            } else {
                setSelectedOption(userAnswers[nextIdx] || null);
                setNumericAnswer('');
            }
            setShowSolution(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            const prevIdx = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIdx);

            const prevQuestion = questions[prevIdx];
            if (isIntegerTypeQuestion(prevQuestion)) {
                setNumericAnswer(userAnswers[prevIdx] || '');
                setSelectedOption(null);
            } else {
                setSelectedOption(userAnswers[prevIdx] || null);
                setNumericAnswer('');
            }
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
                    await (document.documentElement as any).webkitRequestFullscreen(); // Safari
                } else if ((document.documentElement as any).msRequestFullscreen) {
                    await (document.documentElement as any).msRequestFullscreen(); // IE11
                }
            } catch (err) {
                console.warn("Fullscreen request denied:", err);
            }
        };

        enterFullScreen();
    }, []);

    // Close palette automatically on mobile selection
    const handlePaletteSelect = (idx: number) => {
        setCurrentQuestionIndex(idx);

        const selectedQuestion = questions[idx];
        if (isIntegerTypeQuestion(selectedQuestion)) {
            setNumericAnswer(userAnswers[idx] || '');
            setSelectedOption(null);
        } else {
            setSelectedOption(userAnswers[idx] || null);
            setNumericAnswer('');
        }
        setShowSolution(false);
        if (window.innerWidth < 1024) setIsPaletteOpen(false);
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!currentQuestion) return <div className="p-8 text-center text-text-secondary-light">No questions found for this subject.</div>;

    const currentSolution = solutions[currentQuestion.id];
    const isIntegerType = isIntegerTypeQuestion(currentQuestion);

    // Check if numeric answer is correct
    const isNumericAnswerCorrect = isIntegerType && showSolution &&
        numericAnswer.trim() === currentQuestion.correctAnswer?.trim();

    // Navigation Button States
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // Capitalize subject for display
    const displaySubject = subject ? subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase() : '';

    // Get chapter full name from code
    const chapterName = currentQuestion.chapterCode ?
        (chapterMap[currentQuestion.chapterCode] || currentQuestion.chapterCode) : null;

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
                        onClick={() => navigate('/question-set')}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary-light">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-text-light dark:text-text-dark text-sm md:text-base line-clamp-1">
                            Condensed PYQ Practice
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-text-secondary-light font-medium uppercase tracking-wider">
                            <span className="text-primary">{displaySubject}</span>
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
                                    {isIntegerType ? 'Integer Type' : 'Single Correct Type'}
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-xs text-text-secondary-light">
                                    {chapterName && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                                            {chapterName}
                                        </span>
                                    )}
                                    {currentQuestion.year && (
                                        <span className="font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                                            {currentQuestion.year}
                                        </span>
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

                            {/* Answer Section */}
                            {isIntegerType ? (
                                /* Numeric Keypad for Integer Type */
                                <div className="py-4">
                                    <NumericKeypad
                                        value={numericAnswer}
                                        onChange={handleNumericAnswerChange}
                                        disabled={showSolution}
                                        showResult={showSolution}
                                        isCorrect={isNumericAnswerCorrect}
                                        correctAnswer={currentQuestion.correctAnswer}
                                    />
                                </div>
                            ) : (
                                /* Options for MCQ */
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
                            )}

                            {/* Solution Display */}
                            {showSolution && currentSolution && (
                                <div className="mt-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 overflow-x-auto">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Detailed Solution</h3>
                                    <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark break-words whitespace-pre-wrap">
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
                    <div className="h-full overflow-y-auto p-4 md:p-6 w-full custom-scrollbar">
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
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 md:gap-2 relative">

                    {/* Previous Button */}
                    <button
                        onClick={handlePrevious}
                        disabled={isFirstQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-surface-light dark:bg-surface-dark md:bg-transparent text-text-secondary-light font-bold hover:bg-background-light dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-border-light dark:border-border-dark md:border-transparent md:hover:border-border-light md:dark:hover:border-border-dark shadow-sm md:shadow-none"
                        title="Previous Question"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-xl">
                            chevron_left
                        </span>
                        <span className="hidden md:inline ml-2">Previous</span>
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
                        disabled={isLastQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-primary md:bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Question"
                    >
                        <span className="hidden md:inline mr-1">Next</span>
                        <span className="material-symbols-outlined text-2xl md:text-xl">
                            chevron_right
                        </span>
                    </button>
                </div>
            </footer>
        </div >
    );
};

export default CondensedPractice;
