import React, { useState, useEffect, useRef } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import Super30Feedback from './Super30Feedback';
import { supabase } from '../utils/supabaseClient';
import JEELoader from './JEELoader';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';

interface QuestionOption {
    id: string;
    text: string;
    image: string | null;
}

interface QuestionData {
    id: string;
    uuid: string;
    text: string;
    image: string | null;
    options: QuestionOption[];
    correctAnswer: string;
    section: string;
    pyq?: {
        year: string | null;
        concept: string | null;
        topic: string | null;
    };
    [key: string]: any;
}

interface SolutionData {
    id: string;
    solution_text: string;
    solution_image_url: string;
}

interface MergedQuestion {
    id: string;
    section: string;
    pyq: QuestionData;
    ipq: QuestionData;
    solution?: SolutionData;
    pyqSolution?: SolutionData;
}

interface QuestionProgress {
    status: 'correct' | 'wrong' | 'unattempted' | 'not-visited';
    selectedOption: number | null;
    isChecked: boolean;
}

type Subject = 'Physics' | 'Chemistry' | 'Mathematics';

const Super30: React.FC = () => {
    usePageTitle('Super 30 Practice');

    // Session tracking state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [, setSessionAnswers] = useState<{ PYQs: Record<string, string>; IPQs: Record<string, string> }>({ PYQs: {}, IPQs: {} });

    // Refs to track latest values for async callbacks
    const sessionIdRef = useRef<string | null>(null);
    const sessionAnswersRef = useRef<{ PYQs: Record<string, string>; IPQs: Record<string, string> }>({ PYQs: {}, IPQs: {} });

    const [sessionStarted, setSessionStarted] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject>(() => {
        return (sessionStorage.getItem('super30_subject') as Subject) || 'Physics';
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        return parseInt(sessionStorage.getItem('super30_questionIndex') || '0', 10);
    });
    // Add state for Always Show IPQ
    const [alwaysShowIPQ, setAlwaysShowIPQ] = useState(() => {
        return sessionStorage.getItem('super30_alwaysShowIPQ') === 'true';
    });

    // Mobile Tab State
    const [mobileTab, setMobileTab] = useState<'pyq' | 'ipq'>('pyq');

    const [isIPQRevealed, setIsIPQRevealed] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showSolution, setShowSolution] = useState(false);


    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [progress, setProgress] = useState<Record<string, QuestionProgress>>({});
    const [isMobileGridOpen, setIsMobileGridOpen] = useState(false);

    // Restore state on navigation
    useEffect(() => {
        const key = `${currentSubject}-${currentQuestionIndex}`;
        const savedState = progress[key];

        if (savedState) {
            setSelectedAnswer(savedState.selectedOption);
            setIsAnswerChecked(savedState.isChecked);
            setShowSolution(savedState.isChecked && savedState.status === 'wrong');
            // If we have a saved state, it's revealed implicitly if checked, otherwise logically it might be just visited
            // But if 'status' is not 'not-visited', user has been here.
            // For now, let's keep reveal state simple or tied to check.
            // If checked, it must be revealed.
            if (savedState.isChecked) setIsIPQRevealed(true);
            else setIsIPQRevealed(false);
        } else {
            // Default Reset
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
            setShowSolution(false);
            setIsIPQRevealed(false);
        }

        // Reset PYQ locally (not persisting for now as per request focus)
        setSelectedPYQAnswer(null);
        setShowPYQSolution(false);
        setIsPYQAnswerChecked(false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, currentSubject]); // dependency on progress omitted to avoid loop, we only read on nav change

    // PYQ State
    const [selectedPYQAnswer, setSelectedPYQAnswer] = useState<number | null>(null);
    const [showPYQSolution, setShowPYQSolution] = useState(false);
    const [isPYQAnswerChecked, setIsPYQAnswerChecked] = useState(false);
    const [timer, setTimer] = useState(0);

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    // Persist time_elapsed on tab close / navigation away
    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (sessionId && timer > 0) {
                // Use sendBeacon for reliable delivery on page unload
                const payload = JSON.stringify({ time_elapsed: timer });
                navigator.sendBeacon?.(`https://eznxtdzsvnfclgcavvhp.supabase.co/rest/v1/student_sets?id=eq.${sessionId}`, payload);
                // Fallback attempt with supabase client (may not complete)
                await supabase.from('student_sets').update({ time_elapsed: timer }).eq('id', sessionId);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [sessionId, timer]);

    const [loading, setLoading] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mergedData, setMergedData] = useState<Record<Subject, MergedQuestion[]>>({
        Physics: [],
        Chemistry: [],
        Mathematics: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch the GitHub folder URL from Supabase
                const { data: setRow, error: dbError } = await supabase
                    .from('question_set')
                    .select('url')
                    .eq('set_id', 'super-30')
                    .single();

                if (dbError) throw new Error(`Supabase Error: ${dbError.message}`);
                if (!setRow?.url) throw new Error('No URL found for Super 30 set');

                // 2. Transform the GitHub URL to a Raw Content URL
                // Example Input: https://github.com/user/repo/tree/main/path/to/folder
                // Example Output: https://raw.githubusercontent.com/user/repo/main/path/to/folder

                let rawBaseUrl = setRow.url
                    .replace('github.com', 'raw.githubusercontent.com')
                    .replace('/tree/', '/');

                // Ensure no trailing slash for cleaner concatenation
                if (rawBaseUrl.endsWith('/')) {
                    rawBaseUrl = rawBaseUrl.slice(0, -1);
                }

                // 3. Fetch all 4 JSON files using the raw base URL
                const [pyqRes, ipqRes, solRes, pyqSolRes] = await Promise.all([
                    fetch(`${rawBaseUrl}/PYQ.json`),
                    fetch(`${rawBaseUrl}/IPQ.json`),
                    fetch(`${rawBaseUrl}/IPQ_sol.json`),
                    fetch(`${rawBaseUrl}/PYQ_sol.json`)
                ]);

                if (!pyqRes.ok || !ipqRes.ok || !solRes.ok || !pyqSolRes.ok) {
                    throw new Error('Failed to load content from GitHub');
                }

                const pyqJson = await pyqRes.json();
                const ipqJson = await ipqRes.json();
                const solJson = await solRes.json();
                const pyqSolJson = await pyqSolRes.json();

                const pyqQuestions = pyqJson.questions as QuestionData[];
                const ipqQuestions = ipqJson.questions as QuestionData[];
                const solutions = solJson.questions as SolutionData[];
                const pyqSolutions = pyqSolJson.questions as SolutionData[];

                const newMergedData: Record<Subject, MergedQuestion[]> = {
                    Physics: [],
                    Chemistry: [],
                    Mathematics: []
                };

                const normalizeSection = (sec: string): Subject => {
                    if (sec.toLowerCase() === 'maths') return 'Mathematics';
                    return sec as Subject;
                }

                pyqQuestions.forEach((pyqQ) => {
                    const ipqQ = ipqQuestions.find(q => q.id === pyqQ.id);
                    const solQ = solutions.find(q => q.id === pyqQ.id);
                    const pyqSolQ = pyqSolutions.find(q => q.id === pyqQ.id);

                    if (ipqQ) {
                        const subject = normalizeSection(pyqQ.section);
                        if (newMergedData[subject]) {
                            newMergedData[subject].push({
                                id: pyqQ.id,
                                section: subject,
                                pyq: pyqQ,
                                ipq: ipqQ,
                                solution: solQ,
                                pyqSolution: pyqSolQ
                            });
                        }
                    }
                });

                // Shuffle Helper
                const shuffleArray = <T,>(array: T[]): T[] => {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                };

                // Apply Randomization
                Object.keys(newMergedData).forEach((subject) => {
                    const subj = subject as Subject;

                    // 1. Shuffle the order of questions in this subject section
                    newMergedData[subj] = shuffleArray(newMergedData[subj]);

                    // 2. Shuffle the options within each question
                    newMergedData[subj].forEach((q) => {
                        // Helper to find index of correct answer
                        const getCorrectIndex = (options: any[], correctId: string) =>
                            options.findIndex(o => o.id.toLowerCase() === correctId.toLowerCase());

                        let pyqCorrectIndex = -1;

                        // Shuffle PYQ options
                        if (q.pyq && q.pyq.options) {
                            q.pyq.options = shuffleArray([...q.pyq.options]);
                            pyqCorrectIndex = getCorrectIndex(q.pyq.options, q.pyq.correctAnswer);
                        }

                        // Shuffle IPQ options with collision check
                        if (q.ipq && q.ipq.options) {
                            q.ipq.options = shuffleArray([...q.ipq.options]);

                            // If we have a valid PYQ index and enough options to swap, ensure difference
                            if (pyqCorrectIndex !== -1 && q.ipq.options.length > 1) {
                                let attempts = 0;
                                let ipqCorrectIndex = getCorrectIndex(q.ipq.options, q.ipq.correctAnswer);

                                // Try re-shuffling a few times
                                while (attempts < 10 && ipqCorrectIndex === pyqCorrectIndex) {
                                    q.ipq.options = shuffleArray([...q.ipq.options]);
                                    ipqCorrectIndex = getCorrectIndex(q.ipq.options, q.ipq.correctAnswer);
                                    attempts++;
                                }

                                // If still same, force swap
                                if (ipqCorrectIndex === pyqCorrectIndex) {
                                    // Swap with next available index
                                    let swapIndex = (ipqCorrectIndex + 1) % q.ipq.options.length;

                                    // Perform swap
                                    const temp = q.ipq.options[ipqCorrectIndex];
                                    q.ipq.options[ipqCorrectIndex] = q.ipq.options[swapIndex];
                                    q.ipq.options[swapIndex] = temp;
                                }
                            }
                        }
                    });
                });

                setMergedData(newMergedData);
                setLoading(false);
                setIsDataReady(true);

            } catch (err: any) {
                console.error("Error loading Super 30 data:", err);
                setError(err.message || "Failed to load content.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!sessionStarted) return;
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionStarted]);

    const [showFeedback, setShowFeedback] = useState(false);

    // Persist State
    useEffect(() => {
        sessionStorage.setItem('super30_subject', currentSubject);
    }, [currentSubject]);

    useEffect(() => {
        sessionStorage.setItem('super30_questionIndex', currentQuestionIndex.toString());
    }, [currentQuestionIndex]);

    useEffect(() => {
        sessionStorage.setItem('super30_alwaysShowIPQ', alwaysShowIPQ.toString());
    }, [alwaysShowIPQ]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestions = mergedData[currentSubject] || [];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const totalQuestions = currentQuestions.length;

    const handleStartSession = async () => {
        if (!isDataReady) {
            // If user clicks start before data is ready, we can show a specific loading or just return
            // Ideally button shows loading state
            return;
        }

        setSessionStarted(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }

        // Create session in student_sets
        if (userId) {
            const initialAnswers = { PYQs: {}, IPQs: {} };
            const { data, error } = await supabase
                .from('student_sets')
                .insert({
                    user_id: userId,
                    set_id: 'super-30',
                    answers: initialAnswers
                })
                .select('id')
                .single();

            if (!error && data) {
                setSessionId(data.id);
                sessionIdRef.current = data.id;
                setSessionAnswers(initialAnswers);
                sessionAnswersRef.current = initialAnswers;
            }
        }
    };

    const handleRevealIPQ = () => {
        setIsIPQRevealed(true);
    };



    const updateProgress = (status: QuestionProgress['status'], option: number | null = null, checked: boolean = false) => {
        const key = `${currentSubject}-${currentQuestionIndex}`;
        setProgress(prev => ({
            ...prev,
            [key]: { status, selectedOption: option, isChecked: checked }
        }));
    };

    // Update answer in DB
    const updateAnswerInDB = async (
        type: 'PYQs' | 'IPQs',
        questionId: string,
        optionId: string | null
    ) => {
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) return;

        const currentAnswers = sessionAnswersRef.current;
        const updatedAnswers = {
            PYQs: { ...currentAnswers.PYQs },
            IPQs: { ...currentAnswers.IPQs }
        };
        if (optionId) {
            updatedAnswers[type][questionId] = optionId;
        } else {
            delete updatedAnswers[type][questionId];
        }

        setSessionAnswers(updatedAnswers);
        sessionAnswersRef.current = updatedAnswers;

        await supabase
            .from('student_sets')
            .update({ answers: updatedAnswers })
            .eq('id', currentSessionId);
    };

    // Handlers for answer selection with DB sync
    const handlePYQAnswerSelect = (index: number) => {
        const newIndex = selectedPYQAnswer === index ? null : index;
        setSelectedPYQAnswer(newIndex);
        if (currentQuestion) {
            const optionId = newIndex !== null ? currentQuestion.pyq.options[newIndex].id : null;
            // Use uuid instead of id
            updateAnswerInDB('PYQs', currentQuestion.pyq.uuid, optionId);
        }
    };

    const handleIPQAnswerSelect = (index: number) => {
        const newIndex = selectedAnswer === index ? null : index;
        setSelectedAnswer(newIndex);
        if (currentQuestion) {
            const optionId = newIndex !== null ? currentQuestion.ipq.options[newIndex].id : null;
            // Use uuid instead of id
            updateAnswerInDB('IPQs', currentQuestion.ipq.uuid, optionId);
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            // Mark current as unattempted if not visited or unattempted
            const key = `${currentSubject}-${currentQuestionIndex}`;
            if (!progress[key]) {
                updateProgress('unattempted');
            }
            // Normal progression within the same subject
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of current subject
            const currentIndex = subjectTabs.findIndex(tab => tab.key === currentSubject);
            if (currentIndex < subjectTabs.length - 1) {
                // Move to next subject
                const nextSubject = subjectTabs[currentIndex + 1].key;

                // Mark current as unattempted before switch
                const key = `${currentSubject}-${currentQuestionIndex}`;
                if (!progress[key]) {
                    updateProgress('unattempted');
                }

                setCurrentSubject(nextSubject);
                setCurrentQuestionIndex(0);
            } else {
                // End of session (Last subject completed)
                // Update time_elapsed in DB
                if (sessionId) {
                    await supabase
                        .from('student_sets')
                        .update({ time_elapsed: timer })
                        .eq('id', sessionId);
                }
                setShowFeedback(true);
            }
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            // Check if we can go to previous subject
            const currentIndex = subjectTabs.findIndex(tab => tab.key === currentSubject);
            if (currentIndex > 0) {
                const prevSubject = subjectTabs[currentIndex - 1].key;
                setCurrentSubject(prevSubject);
                // We need to set index to last question of that subject
                // But mergedData might not be fully ready if we access it directly here safely?
                // It should be ready if we are in session.
                const prevSubjectQuestions = mergedData[prevSubject] || [];
                setCurrentQuestionIndex(Math.max(0, prevSubjectQuestions.length - 1));
            }
        }
    };

    const handleCheckAnswer = () => {
        if (currentQuestion && selectedAnswer !== null) {
            setIsAnswerChecked(true);
            const selectedOptionId = currentQuestion.ipq.options[selectedAnswer].id;
            const isCorrect = selectedOptionId.toLowerCase() === currentQuestion.ipq.correctAnswer.toLowerCase();

            updateProgress(isCorrect ? 'correct' : 'wrong', selectedAnswer, true);

            if (!isCorrect) {
                setShowSolution(true);
            }
        }
    };

    const handleCheckPYQAnswer = () => {
        if (currentQuestion && selectedPYQAnswer !== null) {
            setIsPYQAnswerChecked(true);
            const selectedOptionId = currentQuestion.pyq.options[selectedPYQAnswer].id;
            const isCorrect = selectedOptionId.toLowerCase() === currentQuestion.pyq.correctAnswer.toLowerCase();
            if (!isCorrect) {
                setShowPYQSolution(true);
            }
        }
    };

    const renderHtml = (htmlString: string) => {
        if (!htmlString) return null;
        const parts = htmlString.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
        return (
            <span className="whitespace-pre-wrap">
                {parts.map((part, i) => {
                    if (part.startsWith('$$') && part.endsWith('$$')) {
                        return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true }) }} />;
                    } else if (part.startsWith('$') && part.endsWith('$')) {
                        return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }) }} />;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </span>
        );
    };

    const subjectTabs = [
        { key: 'Physics' as Subject, label: 'Physics' },
        { key: 'Chemistry' as Subject, label: 'Chemistry' },
        { key: 'Mathematics' as Subject, label: 'Maths' },
    ];

    const getDifficultyBadge = (difficulty: string | null) => {
        if (!difficulty) return null;
        const map: Record<string, { label: string, color: string }> = {
            'E': { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
            'M': { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
            'H': { label: 'Hard', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' }
        };
        const config = map[difficulty] || { label: 'Unknown', color: 'bg-slate-100 text-slate-700' };

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (loading && sessionStarted) return <JEELoader message="Loading Super 30 Content..." />;
    if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

    if (!sessionStarted) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto">
                <style>{`
                    .math-grid { background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px); background-size: 24px 24px; }
                    .dark .math-grid { background-image: radial-gradient(#334155 0.5px, transparent 0.5px); }
                `}</style>
                <main className="flex-1 flex flex-col items-center justify-center math-grid relative px-6 py-12">

                    <div className="max-w-4xl w-full text-center space-y-8 flex flex-col items-center">

                        {/* Free Badge - Centered */}
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <span className="material-symbols-outlined text-base">verified</span>
                                100% FREE
                                <span className="material-symbols-outlined text-base">volunteer_activism</span>
                            </span>
                        </div>

                        {/* Hero Section */}
                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">
                                <span className="text-blue-600 dark:text-blue-500 drop-shadow-lg filter">Super</span>
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-500 bg-clip-text text-transparent"> 30</span>
                                <br />
                                <span className="text-slate-800 dark:text-white text-3xl md:text-5xl font-extrabold tracking-tight mt-4 block">
                                    The Ultimate Revision Set
                                </span>
                            </h2>

                            <h3 className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300">
                                30 <span className="text-blue-600 dark:text-blue-500">Handcrafted</span> PYQ-Inspired Problems
                            </h3>

                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                Each question meticulously designed by <span className="text-slate-800 dark:text-white font-bold">IITians</span> with <span className="text-blue-600 dark:text-blue-400 font-bold">200+ hours</span> of combined effort to ensure maximum concept clarity
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4 flex flex-col items-center gap-4 w-full">
                            <button
                                onClick={handleStartSession}
                                disabled={error !== null}
                                className="group relative bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white px-20 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:shadow-[0_0_60px_rgba(37,99,235,0.4)] flex items-center gap-3 hover:-translate-y-1"
                            >
                                {isDataReady ? (
                                    <>
                                        <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                        Boost My Percentile
                                        <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </>
                                ) : (
                                    <>
                                        {error ? (
                                            <span>Error Loading Content</span>
                                        ) : (
                                            <>
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Loading Content...</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <span className="material-symbols-outlined text-base">schedule</span>
                                ~120 minutes • Full-screen experience
                            </div>
                        </div>

                        {/* Feature Cards Preview (Bottom) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-12 opacity-90">
                            {/* Card 1: Dual-Screen Mastery */}
                            <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B1120] border border-blue-200 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20">
                                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 font-bold text-xl">
                                    26
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">2026 PYQs</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    IPQs created on the latest PYQs, <span className="text-blue-600 dark:text-blue-400 font-bold">maximum relevance for Second Session.</span>
                                </p>
                            </div>

                            {/* Card 2: AI-Powered Solutions */}
                            <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B1120] border border-cyan-200 dark:border-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-4">
                                    <span className="material-symbols-outlined text-2xl">psychology</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Detailed Solutions</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    All the solutions are <span className="text-cyan-600 dark:text-cyan-400 font-bold">detailed, with step-by-step solving.</span> Explanations crafted by AI and reviewed by IITians.
                                </p>
                            </div>

                            {/* Card 3: Smart Analytics */}
                            <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4">
                                    <span className="material-symbols-outlined text-2xl">align_vertical_bottom</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">FREE of Cost</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    The Super-30 set is completely <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE of cost</span>, stay tuned for more.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }





    return (
        <div className="h-[100dvh] flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            <style>{`
                body:has(.super30-session-active) [class*="sidebar"],
                body:has(.super30-session-active) aside,
                body:has(.super30-session-active) .app-mobile-header,
                body:has(.super30-session-active) nav:not(header nav) { display: none !important; }
                body:has(.super30-session-active) main { margin-left: 0 !important; width: 100% !important; }
            `}</style>
            <div className="super30-session-active"></div>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="px-6 py-2.5 flex items-center justify-between relative">
                    <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {subjectTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setCurrentSubject(tab.key); setCurrentQuestionIndex(0); }}
                                className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${currentSubject === tab.key ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                            >
                                <span className="md:hidden">{tab.label.slice(0, 3)}</span>
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Question Tracker */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 hidden md:flex">
                        {Array.from({ length: totalQuestions }).map((_, idx) => (
                            <div key={idx} className="flex items-center">
                                <button
                                    onClick={() => { setCurrentQuestionIndex(idx); }}
                                    className={`relative w-7 h-7 rounded-full font-bold text-xs transition-all duration-300 flex items-center justify-center z-10 
                                    ${idx === currentQuestionIndex
                                            ? 'scale-110 shadow-lg ring-2 ring-primary bg-white dark:bg-slate-800 text-primary z-20'
                                            : ''
                                        }
                                    ${(() => {
                                            const status = progress[`${currentSubject}-${idx}`]?.status;
                                            if (status === 'correct') return 'bg-emerald-500 text-white';
                                            if (status === 'wrong') return 'bg-red-500 text-white';
                                            if (status === 'unattempted') return 'bg-amber-400 text-white';
                                            return idx === currentQuestionIndex ? '' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600';
                                        })()}
                                        `}
                                    title={`Question ${idx + 1}`}
                                >
                                    {idx + 1}
                                </button>
                                {idx < totalQuestions - 1 && (
                                    <div className={`h-0.5 w-3 rounded-full transition-colors ${idx < currentQuestionIndex ? 'bg-emerald-500/50' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Always Show IPQ Toggle - Hide on mobile if needed, or keep small */}
                        <div className="hidden md:flex items-center gap-2 mr-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={alwaysShowIPQ}
                                    onChange={(e) => setAlwaysShowIPQ(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-300">Always Show IPQ</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-sm text-primary">timer</span>
                            <span className="text-xs font-bold tabular-nums text-text-light dark:text-text-dark">{formatTime(timer)}</span>
                        </div>

                        {/* Mobile Grid Toggle */}
                        <button
                            onClick={() => setIsMobileGridOpen(true)}
                            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Grid Sidebar / Drawer - Polished Design */}
            {isMobileGridOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsMobileGridOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/20 dark:border-slate-700/50">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Question Map</h3>
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Track your progress</p>
                            </div>
                            <button
                                onClick={() => setIsMobileGridOpen(false)}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/10 flex flex-col items-center justify-center gap-1">
                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                        {Object.values(progress).filter(p => p.status === 'correct').length}
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Correct</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 flex flex-col items-center justify-center gap-1">
                                    <div className="text-2xl font-black text-red-600 dark:text-red-400">
                                        {Object.values(progress).filter(p => p.status === 'wrong').length}
                                    </div>
                                    <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest">Wrong</span>
                                </div>
                            </div>

                            {/* Section Label */}
                            <div className="mb-4 flex items-center gap-3">
                                <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Grid</span>
                                <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></span>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-5 gap-3">
                                {Array.from({ length: totalQuestions }).map((_, idx) => {
                                    const status = progress[`${currentSubject}-${idx}`]?.status;
                                    let baseClass = "relative w-full aspect-square rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-300";
                                    let statusClass = "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600";

                                    if (idx === currentQuestionIndex) {
                                        statusClass = "bg-primary text-white shadow-lg shadow-blue-500/30 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110 z-10 border-transparent";
                                    } else if (status === 'correct') {
                                        statusClass = "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-600";
                                    } else if (status === 'wrong') {
                                        statusClass = "bg-red-500 text-white shadow-md shadow-red-500/20 border-red-600";
                                    } else if (status === 'unattempted') {
                                        statusClass = "bg-amber-400 text-white shadow-md shadow-amber-500/20 border-amber-500";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setCurrentQuestionIndex(idx);
                                                setIsMobileGridOpen(false);
                                            }}
                                            className={`${baseClass} ${statusClass}`}
                                        >
                                            {idx + 1}
                                            {idx === currentQuestionIndex && (
                                                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-white dark:border-slate-900"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer / Legend (Optional or just styling) */}
                        <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Correct</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>Wrong</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Skipped</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col w-full px-3 py-4 gap-4 overflow-hidden relative">
                {/* Mobile Toggle */}
                <div className="md:hidden flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-2 shrink-0">
                    <button
                        onClick={() => setMobileTab('pyq')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mobileTab === 'pyq' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Reference PYQ
                    </button>
                    <button
                        onClick={() => setMobileTab('ipq')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mobileTab === 'ipq' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        IPQ
                    </button>
                </div>

                {totalQuestions === 0 ? <div className="m-auto">No content loaded</div> : (
                    <div className="flex flex-1 gap-6 w-full overflow-hidden">
                        {/* Left Panel: PYQ */}
                        <div className={`${mobileTab === 'pyq' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden`}>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reference PYQ</span>
                                {currentQuestion.pyq.year ? (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                        {currentQuestion.pyq.year}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                        2026 PYQ
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-premium">
                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="text-base md:text-lg font-medium">{renderHtml(currentQuestion.pyq.text)}</div>
                                    {currentQuestion.pyq.image && (
                                        <div className="mt-4 max-w-full bg-white p-2 rounded-lg">
                                            <ImageWithProgress
                                                src={currentQuestion.pyq.image}
                                                alt="Question"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.pyq.options.map((opt, i) => {
                                        let borderColor = "border-slate-200 dark:border-slate-700";
                                        let bgColor = "hover:bg-slate-50 dark:hover:bg-slate-800/50";

                                        if (isPYQAnswerChecked) {
                                            if (opt.id.toLowerCase() === currentQuestion.pyq.correctAnswer.toLowerCase()) {
                                                borderColor = "border-green-500";
                                                bgColor = "bg-green-50 dark:bg-green-900/20";
                                            } else if (selectedPYQAnswer === i) {
                                                borderColor = "border-red-500";
                                                bgColor = "bg-red-50 dark:bg-red-900/20";
                                            }
                                        } else if (selectedPYQAnswer === i) {
                                            borderColor = "border-indigo-500";
                                            bgColor = "bg-indigo-50 dark:bg-indigo-900/20";
                                        }

                                        return (
                                            <button
                                                key={i}
                                                disabled={isPYQAnswerChecked}
                                                onClick={() => handlePYQAnswerSelect(i)}
                                                className={`p-3 md:p-4 border-2 rounded-xl text-left flex items-start gap-4 transition-all ${borderColor} ${bgColor}`}
                                            >
                                                <span className={`font-bold text-xs w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-colors mt-0.5 ${selectedPYQAnswer === i || (isPYQAnswerChecked && opt.id.toLowerCase() === currentQuestion.pyq.correctAnswer.toLowerCase()) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <div className="flex flex-col gap-2 w-full">
                                                    {opt.text && <span className="text-sm md:text-base">{renderHtml(opt.text)}</span>}
                                                    {opt.image && (
                                                        <div className="max-w-[200px] max-h-[150px] bg-white p-2 rounded-md border border-slate-200 dark:border-slate-700">
                                                            <ImageWithProgress
                                                                src={opt.image}
                                                                alt={`Option ${String.fromCharCode(65 + i)}`}
                                                                className="w-auto h-auto object-contain max-w-full max-h-full"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {showPYQSolution && currentQuestion.pyqSolution && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 mt-6 overflow-hidden">
                                        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 text-sm">Explanation</h4>
                                            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed break-words overflow-x-auto">
                                                {renderHtml(currentQuestion.pyqSolution.solution_text)}
                                                {currentQuestion.pyqSolution.solution_image_url && (
                                                    <div className="mt-3 rounded-lg border border-indigo-200/50 max-w-full bg-white p-2">
                                                        <ImageWithProgress
                                                            src={currentQuestion.pyqSolution.solution_image_url}
                                                            alt="Solution"
                                                            className="max-w-full h-auto rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: IPQ */}
                        <div className={`${mobileTab === 'ipq' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative`}>
                            {!isIPQRevealed && !alwaysShowIPQ && (
                                <div className="hidden md:flex absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex-col items-center justify-center">
                                    <button onClick={handleRevealIPQ} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg">Reveal Question</button>
                                </div>
                            )}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-primary/5 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">Practice Question</span>
                                {getDifficultyBadge(currentQuestion.ipq.difficulty)}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-premium">
                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="text-base md:text-lg font-medium">{renderHtml(currentQuestion.ipq.text)}</div>
                                    {currentQuestion.ipq.image && (
                                        <div className="mt-4 max-w-full bg-white p-2 rounded-lg">
                                            <ImageWithProgress
                                                src={currentQuestion.ipq.image}
                                                alt="Question"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.ipq.options.map((opt, i) => {
                                        let borderColor = "border-slate-200 dark:border-slate-700";
                                        let bgColor = "";
                                        if (isAnswerChecked) {
                                            if (opt.id.toLowerCase() === currentQuestion.ipq.correctAnswer.toLowerCase()) {
                                                borderColor = "border-green-500";
                                                bgColor = "bg-green-50 dark:bg-green-900/20";
                                            } else if (selectedAnswer === i) {
                                                borderColor = "border-red-500";
                                                bgColor = "bg-red-50 dark:bg-red-900/20";
                                            }
                                        } else if (selectedAnswer === i) {
                                            borderColor = "border-primary";
                                            bgColor = "bg-primary/5";
                                        }

                                        return (
                                            <button
                                                key={i}
                                                disabled={isAnswerChecked}
                                                onClick={() => handleIPQAnswerSelect(i)}
                                                className={`p-3 md:p-4 border-2 rounded-xl text-left flex items-start gap-4 transition-all ${borderColor} ${bgColor}`}
                                            >
                                                <span className="font-bold text-xs w-6 h-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-0.5">{String.fromCharCode(65 + i)}</span>
                                                <div className="flex flex-col gap-2 w-full">
                                                    {opt.text && <span className="text-sm md:text-base">{renderHtml(opt.text)}</span>}
                                                    {opt.image && (
                                                        <div className="max-w-[200px] max-h-[150px] bg-white p-2 rounded-md border border-slate-200 dark:border-slate-700">
                                                            <ImageWithProgress
                                                                src={opt.image}
                                                                alt={`Option ${String.fromCharCode(65 + i)}`}
                                                                className="w-auto h-auto object-contain max-w-full max-h-full"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {showSolution && currentQuestion.solution && (
                                    <div className="mt-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Detailed Solution</h4>
                                        <div className="prose dark:prose-invert max-w-none text-sm break-words overflow-x-auto">
                                            {renderHtml(currentQuestion.solution.solution_text)}
                                            {currentQuestion.solution.solution_image_url && (
                                                <div className="mt-4 rounded-lg max-w-full bg-white p-2">
                                                    <ImageWithProgress
                                                        src={currentQuestion.solution.solution_image_url}
                                                        alt="Solution"
                                                        className="max-w-full h-auto rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="relative bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-3 md:py-4 z-40">
                {/* ============================== */}
                {/*        DESKTOP FOOTER          */}
                {/* ============================== */}
                <div className="hidden md:block">
                    {/* Centered Navigation Buttons (Absolute) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex gap-4 pointer-events-auto">
                            <button
                                onClick={handlePrevQuestion}
                                disabled={currentQuestionIndex === 0 && subjectTabs.findIndex(tab => tab.key === currentSubject) === 0}
                                className="px-5 py-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 text-sm font-medium transition-colors shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700"
                            >
                                Previous
                            </button>
                            <button onClick={handleNextQuestion} className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm min-w-[100px]">
                                {
                                    currentQuestionIndex < totalQuestions - 1 ? 'Next' :
                                        (subjectTabs.findIndex(tab => tab.key === currentSubject) < subjectTabs.length - 1) ? 'Next Subject' : 'End Session'
                                }
                            </button>
                        </div>
                    </div>

                    {/* Card Action Buttons (Grid Aligned with Content) */}
                    <div className="flex w-full px-6 gap-6">
                        {/* PYQ Action - Centered in Left Column */}
                        <div className="flex-1 flex justify-center items-center">
                            {!isPYQAnswerChecked ? (
                                <button onClick={handleCheckPYQAnswer} disabled={selectedPYQAnswer === null} className="px-8 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">Check PYQ</button>
                            ) : (
                                <button onClick={() => setShowPYQSolution(!showPYQSolution)} className="px-5 py-2 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors bg-white dark:bg-transparent">
                                    {showPYQSolution ? "Hide PYQ Explanation" : "View PYQ Explanation"}
                                </button>
                            )}
                        </div>

                        {/* IPQ Action - Centered in Right Column */}
                        <div className="flex-1 flex justify-center items-center">
                            {!isAnswerChecked ? (
                                <button onClick={handleCheckAnswer} disabled={(!isIPQRevealed && !alwaysShowIPQ) || selectedAnswer === null} className="px-8 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">Check IPQ</button>
                            ) : (
                                <button onClick={() => setShowSolution(!showSolution)} className="px-5 py-2 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors bg-white dark:bg-transparent">
                                    {showSolution ? "Hide IPQ Solution" : "View IPQ Solution"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================== */}
                {/*         MOBILE FOOTER          */}
                {/* ============================== */}
                <div className="md:hidden px-4 flex items-center gap-3">
                    {/* Previous Button - Icon Only or Small Text */}
                    <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0 && subjectTabs.findIndex(tab => tab.key === currentSubject) === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>

                    {/* Action Button - Takes remaining space */}
                    <div className="flex-1">
                        {mobileTab === 'pyq' ? (
                            !isPYQAnswerChecked ? (
                                <button onClick={handleCheckPYQAnswer} disabled={selectedPYQAnswer === null} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-[0.98]">
                                    Check PYQ
                                </button>
                            ) : (
                                <button onClick={() => setShowPYQSolution(!showPYQSolution)} className="w-full py-2.5 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors bg-white dark:bg-transparent active:scale-[0.98]">
                                    {showPYQSolution ? "Hide Explanation" : "View Explanation"}
                                </button>
                            )
                        ) : (
                            !isAnswerChecked ? (
                                <button onClick={handleCheckAnswer} disabled={selectedAnswer === null} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-[0.98]">
                                    Check Answer
                                </button>
                            ) : (
                                <button onClick={() => setShowSolution(!showSolution)} className="w-full py-2.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors bg-white dark:bg-transparent active:scale-[0.98]">
                                    {showSolution ? "Hide Solution" : "View Solution"}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next Button - Icon Only or Small Text */}
                    <button
                        onClick={handleNextQuestion}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-white shadow-sm transition-colors ${currentQuestionIndex < totalQuestions - 1
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : (subjectTabs.findIndex(tab => tab.key === currentSubject) < subjectTabs.length - 1)
                                ? 'bg-blue-600 hover:bg-blue-500' // Next Subject
                                : 'bg-red-600 hover:bg-red-500'   // End Session
                            }`}
                        title={
                            currentQuestionIndex < totalQuestions - 1 ? 'Next Question' :
                                (subjectTabs.findIndex(tab => tab.key === currentSubject) < subjectTabs.length - 1) ? 'Next Subject' : 'End Session'
                        }
                    >
                        {
                            currentQuestionIndex < totalQuestions - 1 ? <span className="material-symbols-outlined text-xl">arrow_forward</span> :
                                (subjectTabs.findIndex(tab => tab.key === currentSubject) < subjectTabs.length - 1) ? <span className="material-symbols-outlined text-xl">skip_next</span> : <span className="material-symbols-outlined text-xl">flag</span>
                        }
                    </button>
                </div>
            </footer>
            {showFeedback && <Super30Feedback sessionId={sessionIdRef.current} onClose={() => setShowFeedback(false)} />}
        </div>
    );
};

export default Super30;
