import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Test, Question } from '../data';
import { usePageTitle } from '../hooks/usePageTitle';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';
import JEELoader from './JEELoader';
import { SolutionDisplay } from './question';
import ReportFlag from './ReportFlag';

// Interfaces
interface AttemptComparison {
    question_uuid: string;
    question_id: string;
    section: string;
    user_response: string | null;
    correct_response: string;
    status: 'Correct' | 'Incorrect' | 'Unattempted';
}

interface Solution {
    id: string;
    solution_text: string;
    solution_image_url: string;
    tags: Record<string, string>;
}

const TestReview: React.FC = () => {
    usePageTitle('Test Review');
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialQuestionUuid = searchParams.get('q');

    const [testData, setTestData] = useState<Test | null>(null);
    const [userAnswers, setUserAnswers] = useState<AttemptComparison[]>([]);
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isSolutionVisible, setIsSolutionVisible] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sourceUrl, setSourceUrl] = useState<string>('');

    // Open sidebar by default on desktop
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) {
                setError('Submission ID is missing.');
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch submission data to get result_url and test_id
                const { data: submissionData, error: subError } = await supabase
                    .from('student_tests')
                    .select('result_url, test_id')
                    .eq('id', submissionId)
                    .single();

                if (subError || !submissionData) throw new Error('Submission not found.');

                const { result_url, test_id } = submissionData;

                if (!result_url) throw new Error('Results are still being calculated. Please go back and try again in a moment.');

                // 2. Fetch test metadata to get the test url and solution_url
                const { data: testMeta, error: testError } = await supabase
                    .from('tests')
                    .select('url, solution_url')
                    .eq('testID', test_id)
                    .single();

                if (testError || !testMeta) throw new Error('Test metadata not found.');

                const { url: testUrl, solution_url } = testMeta;
                setSourceUrl(testUrl || '');

                // 3. Fetch data concurrently — solution_url is optional
                const fetches: Promise<Response>[] = [
                    fetch(result_url),
                    fetch(testUrl),
                ];
                if (solution_url) {
                    fetches.push(fetch(solution_url));
                }

                const responses = await Promise.all(fetches);
                const [resultResponse, testResponse] = responses;
                const solutionResponse = solution_url ? responses[2] : null;

                if (!resultResponse.ok) throw new Error('Failed to fetch result data.');
                if (!testResponse.ok) throw new Error('Failed to fetch test content.');

                const resultJson = await resultResponse.json();
                const testJson = await testResponse.json();

                let solutionQuestions: Solution[] = [];
                if (solutionResponse?.ok) {
                    const solutionJson = await solutionResponse.json();
                    solutionQuestions = solutionJson.questions || [];
                }

                setUserAnswers(resultJson.attempt_comparison || []);
                setSolutions(solutionQuestions);
                setTestData(testJson as Test);
                setAllQuestions(testJson.questions || []);


            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId]);

    const sections = useMemo(() => testData?.sections?.map(s => s.name) || [], [testData]);
    const questionsBySection = useMemo(() => {
        return sections.map(sectionName =>
            allQuestions.filter(q => q.section === sectionName)
        );
    }, [sections, allQuestions]);

    useEffect(() => {
        const currentQuestion = allQuestions[currentQuestionIndex];
        if (currentQuestion) {
            const sectionIndex = sections.findIndex(s => s === currentQuestion.section);
            if (sectionIndex !== -1) {
                setCurrentSectionIndex(prevIndex => {
                    if (prevIndex !== sectionIndex) {
                        return sectionIndex;
                    }
                    return prevIndex;
                });
            }
        }
    }, [currentQuestionIndex, allQuestions, sections]);

    // Jump to a specific question when arriving from blunder analysis
    useEffect(() => {
        if (!initialQuestionUuid || allQuestions.length === 0) return;
        const idx = allQuestions.findIndex(q => q.uuid === initialQuestionUuid || q.id === initialQuestionUuid);
        if (idx !== -1) setCurrentQuestionIndex(idx);
    }, [initialQuestionUuid, allQuestions]);

    const handleQuestionSelect = (questionIndex: number) => {
        const question = questionsBySection[currentSectionIndex][questionIndex];
        const globalIndex = allQuestions.findIndex(q => q.id === question.id);
        setCurrentQuestionIndex(globalIndex);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleSectionSelect = (sectionIndex: number) => {
        setCurrentSectionIndex(sectionIndex);
        const firstQuestionInSection = allQuestions.find(q => q.section === sections[sectionIndex]);
        if (firstQuestionInSection) {
            const globalIndex = allQuestions.findIndex(q => q.id === firstQuestionInSection.id);
            setCurrentQuestionIndex(globalIndex);
        }
    };

    const currentQuestion = allQuestions[currentQuestionIndex];
    const currentAnswer = userAnswers.find(a => {
        if (a.question_uuid && currentQuestion?.uuid) {
            return a.question_uuid === currentQuestion.uuid;
        }
        return a.question_id === currentQuestion?.id;
    });
    const currentSolution = solutions.find(s => s.id === currentQuestion?.id);

    const renderHtml = (htmlString: string) => {
        const parts = htmlString.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true }) }} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }) }} />;
            }
            return <span key={i}>{part}</span>;
        });
    };

    if (loading) return <JEELoader message="Loading review..." />;
    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen text-center px-4">
            <span className="material-icons-outlined text-5xl text-red-500 mb-4">error_outline</span>
            <h2 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">{error}</h2>
            <button
                onClick={() => navigate(`/results/${submissionId}`)}
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
            >
                <span className="material-icons-outlined">arrow_back</span>
                Back to Result
            </button>
        </div>
    );
    if (!testData || !currentQuestion || !currentAnswer) return (
        <div className="flex flex-col justify-center items-center h-screen text-center px-4">
            <span className="material-icons-outlined text-5xl text-text-secondary-light mb-4">info</span>
            <h2 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">Data not available</h2>
            <button
                onClick={() => navigate(`/results/${submissionId}`)}
                className="mt-4 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
            >
                <span className="material-icons-outlined">arrow_back</span>
                Back to Result
            </button>
        </div>
    );

    const getOptionStyle = (optionId: string) => {
        const isCorrect = optionId.toLowerCase() === currentAnswer.correct_response.toLowerCase();
        const isUserChoice = currentAnswer.user_response ? optionId.toLowerCase() === currentAnswer.user_response.toLowerCase() : false;

        if (isUserChoice && isCorrect) {
            return "border-2 border-success-light bg-success-light/10 dark:bg-success-dark/10"; // User was correct
        }
        if (isUserChoice && !isCorrect) {
            return "border-2 border-error-light bg-error-light/10 dark:bg-error-dark/10"; // User was incorrect
        }
        if (!isUserChoice && isCorrect) {
            return "border-2 border-success-light bg-success-light/10 dark:bg-success-dark/10"; // This is the correct answer, which the user did not choose
        }
        return "border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-gray-800"; // Any other option
    };

    const getPaletteStyle = (question: Question) => {
        const answer = userAnswers.find(a => {
            if (a.question_uuid && question.uuid) {
                return a.question_uuid === question.uuid;
            }
            return a.question_id === question.id;
        });

        if (!answer) return "bg-gray-200 dark:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark";
        switch (answer.status) {
            case 'Correct': return "bg-success-light text-white";
            case 'Incorrect': return "bg-error-light text-white";
            case 'Unattempted': return "bg-gray-200 dark:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark";
            default: return "bg-gray-200 dark:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark";
        }
    };

    const stats = userAnswers.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    return (
        <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-4 rounded-none md:rounded-3xl overflow-hidden relative border-0 md:border border-border-light dark:border-border-dark shadow-none md:shadow-xl bg-surface-light dark:bg-surface-dark font-display text-text-light dark:text-text-dark antialiased">
            <style>{`
                .review-scroll::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .review-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .review-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 20px;
                }
                .dark .review-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(75, 85, 99, 0.5);
                }
                @media (max-width: 767px) {
                    .review-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .review-scroll {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10 bg-fixed pointer-events-none opacity-60"></div>

            {/* Header */}
            <header className="h-14 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 md:px-8 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/results/${submissionId}`)}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-icons-outlined text-text-secondary-light">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-text-light dark:text-text-dark text-sm md:text-base line-clamp-1">
                            Test Review
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-text-secondary-light font-medium uppercase tracking-wider">
                            <span className="text-primary">{currentQuestion.section}</span>
                            <span>•</span>
                            <span>Q{allQuestions.findIndex(q => q.id === currentQuestion.id) + 1} of {allQuestions.length}</span>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center justify-center p-2 rounded-lg text-text-secondary-light hover:bg-background-light dark:hover:bg-white/5 transition-all"
                        title="Toggle Sidebar"
                    >
                        <span className="material-icons-outlined">{isSidebarOpen ? 'last_page' : 'grid_view'}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 md:pb-4 scroll-smooth review-scroll">
                    <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-center pb-8">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 md:p-6 mb-3">

                            {/* Question Header */}
                            <div className="mb-4">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {currentAnswer.status === 'Correct' && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-success-light/10 text-success-light text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                            <span className="material-icons-outlined text-sm">check_circle</span> Correct
                                        </span>
                                    )}
                                    {currentAnswer.status === 'Incorrect' && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-error-light/10 text-error-light text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                            <span className="material-icons-outlined text-sm">cancel</span> Incorrect
                                        </span>
                                    )}
                                    {currentAnswer.status === 'Unattempted' && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wide">
                                            Unattempted
                                        </span>
                                    )}
                                </div>
                                <ReportFlag questionId={currentQuestion.uuid || currentQuestion.id} sourceUrl={sourceUrl} />
                                </div>

                                {/* Question Text */}
                                <div className="text-sm md:text-xl font-medium leading-relaxed text-text-light dark:text-text-dark mb-2 whitespace-pre-wrap break-words">
                                    {renderHtml(currentQuestion.text)}
                                </div>
                                {currentQuestion.image && (
                                    <div className="mt-2 w-full flex justify-center">
                                        <ImageWithProgress src={currentQuestion.image} alt="Question" className="max-w-full md:max-w-xl max-h-[35vh] w-auto h-auto rounded-lg" />
                                    </div>
                                )}
                            </div>

                            {/* Answer Section */}
                            <div className="space-y-3">
                                {(!currentQuestion.options || currentQuestion.options.length === 0) ? (
                                    <div className="p-4 md:p-6 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm">
                                        {currentAnswer.status === 'Correct' ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-success-light font-bold text-sm md:text-lg">
                                                    <span className="material-icons-outlined">check_circle</span>
                                                    Correct Answer: {currentAnswer.correct_response}
                                                </div>
                                                <div className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark ml-8">
                                                    Your answer matched the correct answer.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 flex flex-col gap-1">
                                                    <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Your Answer</span>
                                                    <div className="flex items-center gap-2 text-error-light font-bold text-sm md:text-lg">
                                                        <span className="material-icons-outlined">cancel</span>
                                                        {currentAnswer.user_response || "Not Attempted"}
                                                    </div>
                                                </div>
                                                <div className="hidden sm:block w-px bg-border-light dark:bg-border-dark"></div>
                                                <div className="sm:hidden w-full h-px bg-border-light dark:bg-border-dark"></div>
                                                <div className="flex-1 flex flex-col gap-1">
                                                    <span className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Correct Answer</span>
                                                    <div className="flex items-center gap-2 text-success-light font-bold text-sm md:text-lg">
                                                        <span className="material-icons-outlined">check_circle</span>
                                                        {currentAnswer.correct_response}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    currentQuestion.options.map(option => {
                                        const isCorrect = option.id.toLowerCase() === currentAnswer.correct_response.toLowerCase();
                                        const isUserChoice = currentAnswer.user_response ? option.id.toLowerCase() === currentAnswer.user_response.toLowerCase() : false;
                                        return (
                                            <div key={option.id} className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all relative overflow-hidden ${getOptionStyle(option.id)}`}>
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-border-light dark:border-border-dark flex items-center justify-center text-xs md:text-sm font-bold shrink-0 mt-0.5">{option.id.toUpperCase()}</div>
                                                <div className="flex-grow text-xs md:text-lg min-w-0">
                                                    {renderHtml(option.text)}
                                                    {option.image && (
                                                        <div className="mt-2 text-center flex justify-center">
                                                            <ImageWithProgress src={option.image} alt={`Option ${option.id}`} className="max-w-full max-h-40 w-auto h-auto inline-block rounded-lg" />
                                                        </div>
                                                    )}
                                                </div>
                                                {isUserChoice && (
                                                    <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider shrink-0 ${currentAnswer.status === 'Correct' ? 'text-success-dark dark:text-success-light' : 'text-error-dark dark:text-error-light'}`}>
                                                        Your Answer
                                                    </div>
                                                )}
                                                {!isUserChoice && isCorrect && (
                                                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-success-dark dark:text-success-light shrink-0">
                                                        Correct
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Solution Display */}
                            {currentSolution && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setIsSolutionVisible(!isSolutionVisible)}
                                        className="flex items-center gap-2 text-primary font-semibold mb-2 hover:opacity-80 transition-opacity text-sm"
                                    >
                                        <span className="material-icons-outlined text-lg">{isSolutionVisible ? 'expand_less' : 'expand_more'}</span>
                                        {isSolutionVisible ? 'Hide' : 'Show'} Solution
                                    </button>
                                    <SolutionDisplay
                                        text={currentSolution.solution_text}
                                        image={currentSolution.solution_image_url || null}
                                        visible={isSolutionVisible}
                                        title="Explanation"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar: Section Switcher + Question Palette */}
                <aside className={`
                    absolute lg:relative right-0 top-0 bottom-0 z-20
                    transition-all duration-300 ease-in-out overflow-hidden
                    bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark
                    ${isSidebarOpen ? 'w-72 shadow-2xl lg:shadow-none translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0'}
                `}>
                    <div className="h-full overflow-y-auto p-4 md:p-6 w-full custom-scrollbar">
                        {/* Close Button (mobile) */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-light dark:text-text-dark">Navigation</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Section Switcher */}
                        <div className="mb-5">
                            <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-2 block">Sections</span>
                            <div className="flex flex-col gap-1">
                                {sections.map((section, index) => {
                                    const isActive = currentSectionIndex === index;
                                    const sectionQuestions = questionsBySection[index] || [];
                                    const sectionStats = sectionQuestions.reduce((acc, q) => {
                                        const answer = userAnswers.find(a => {
                                            if (a.question_uuid && q.uuid) return a.question_uuid === q.uuid;
                                            return a.question_id === q.id;
                                        });
                                        if (answer?.status === 'Correct') acc.correct++;
                                        if (answer?.status === 'Incorrect') acc.incorrect++;
                                        return acc;
                                    }, { correct: 0, incorrect: 0 });

                                    return (
                                        <button
                                            key={section}
                                            onClick={() => handleSectionSelect(index)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                                                ${isActive
                                                    ? 'text-primary bg-primary/10 shadow-sm'
                                                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            <span className="truncate">{section}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] shrink-0 ml-2">
                                                <span className="text-success-light font-bold">{sectionStats.correct}</span>
                                                <span className="text-text-secondary-light">/</span>
                                                <span className="text-error-light font-bold">{sectionStats.incorrect}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border-light dark:bg-border-dark mb-4"></div>

                        {/* Question Palette */}
                        <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-3 block">Questions</span>
                        <div className="grid grid-cols-5 gap-2 mb-6">
                            {questionsBySection[currentSectionIndex]?.map((q, index) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleQuestionSelect(index)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${getPaletteStyle(q)} ${q.id === currentQuestion.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md' : ''}`}
                                >
                                    {allQuestions.findIndex(aq => aq.id === q.id) + 1}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="space-y-2.5 pt-4 border-t border-border-light dark:border-border-dark pb-20 md:pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-success-light shrink-0"></div>
                                <span className="text-sm text-text-secondary-light">Correct</span>
                                <span className="ml-auto font-bold text-sm">{stats['Correct'] || 0}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-error-light shrink-0"></div>
                                <span className="text-sm text-text-secondary-light">Incorrect</span>
                                <span className="ml-auto font-bold text-sm">{stats['Incorrect'] || 0}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                                <span className="text-sm text-text-secondary-light">Not Attempted</span>
                                <span className="ml-auto font-bold text-sm">{stats['Unattempted'] || 0}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 md:static h-16 md:h-auto md:min-h-[4.5rem] bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex items-center px-4 md:px-8 z-40 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 relative">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={isFirstQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-surface-light dark:bg-surface-dark md:bg-transparent text-text-secondary-light font-bold hover:bg-background-light dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-border-light dark:border-border-dark md:border-transparent md:hover:border-border-light md:dark:hover:border-border-dark shadow-sm md:shadow-none"
                        title="Previous Question"
                    >
                        <span className="material-icons-outlined text-2xl md:text-xl">chevron_left</span>
                        <span className="hidden md:inline ml-1">Previous</span>
                    </button>

                    {/* Solution Toggle (Center) */}
                    <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto">
                        <button
                            onClick={() => setIsSolutionVisible(!isSolutionVisible)}
                            className={`flex items-center justify-center w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl font-bold transition-all shadow-md md:shadow-sm ${isSolutionVisible
                                ? 'bg-background-light dark:bg-white/5 text-text-secondary-light border border-border-light dark:border-border-dark'
                                : 'bg-primary text-white hover:bg-blue-600 shadow-primary/30'
                            }`}
                            title={isSolutionVisible ? "Hide Solution" : "Show Solution"}
                        >
                            <span className="material-icons-outlined text-2xl md:text-xl">{isSolutionVisible ? 'visibility_off' : 'visibility'}</span>
                            <span className="hidden md:inline ml-2 text-sm">{isSolutionVisible ? 'Hide Solution' : 'Show Solution'}</span>
                        </button>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(allQuestions.length - 1, currentQuestionIndex + 1))}
                        disabled={isLastQuestion}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Question"
                    >
                        <span className="hidden md:inline mr-1">Next</span>
                        <span className="material-icons-outlined text-2xl md:text-xl">chevron_right</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default TestReview;
