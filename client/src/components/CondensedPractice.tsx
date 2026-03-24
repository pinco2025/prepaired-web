import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';
import ReportFlag from './ReportFlag';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
    RenderMath,
    NumericKeypad,
    MCQOptions,
    SolutionDisplay,
    isIntegerTypeQuestion,
} from './question';

const FREE_QUESTION_LIMIT = 10;

// ── Subscription Modal ────────────────────────────────────────────────────────
const SubscriptionModal: React.FC<{ onClose: () => void; onUpgrade: () => void }> = ({ onClose, onUpgrade }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="relative bg-surface-light dark:bg-surface-dark rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 shadow-2xl border border-border-light dark:border-border-dark"
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span
                        className="material-symbols-outlined text-primary text-lg sm:text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        lock
                    </span>
                </div>

                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-text-light dark:text-text-dark mb-1">
                        prepAIred Lite Required
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        You've reached the free preview. Upgrade to Lite to continue practising all questions in this set.
                    </p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 text-left">
                    {[
                        'Complete Condensed PYQ Set — every question, unlocked',
                        '4 AI-Powered Tests with performance breakdown',
                        'Statement Based Set — the pattern that catches toppers off-guard',
                        'Fast-Track Set + 360° Preparation Set',
                        'JEE Advanced Phase 2 coverage included',
                    ].map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-primary/10 p-0.5 shrink-0">
                                <span className="material-symbols-outlined text-primary text-[15px] sm:text-[18px] font-bold">check</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-text-light dark:text-text-dark">{perk}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full">
                    <div className="flex items-baseline justify-center gap-1.5 mb-3">
                        <span className="text-base sm:text-xl line-through text-text-secondary-light dark:text-text-secondary-dark font-medium">₹399</span>
                        <span className="text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark">₹119</span>
                        <span className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">/month</span>
                    </div>
                    <button
                        onClick={onUpgrade}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-dark hover:scale-[1.02] transition-all"
                    >
                        Get prepAIred Lite for ₹119 →
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full mt-1.5 py-2 text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// Local interfaces for JSON response structures
interface LocalQuestion {
    id: string;
    uuid: string;
    text: string;
    image: string | null;
    options: { id: string; text: string; image: string | null }[];
    correctAnswer: string;
    chapterCode?: string;
    topicCode?: string;
    year?: string;
    type?: string;
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

const CondensedPractice: React.FC = () => {
    const { setId, subject } = useParams<{ setId?: string; subject: string }>();
    const targetSetId = setId || 'condensed';
    const navigate = useNavigate();
    const { user, isPaidUser, loading: authLoading } = useAuth();

    const [questions, setQuestions] = useState<LocalQuestion[]>([]);
    const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
    const [solutions, setSolutions] = useState<{ [key: string]: { text: string; image: string | null } }>({});
    const [chapterMap, setChapterMap] = useState<{ [code: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [numericAnswer, setNumericAnswer] = useState<string>('');
    const [showSolution, setShowSolution] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [showPaywallModal, setShowPaywallModal] = useState(false);
    // Track which questions have been checked (answer locked)
    const [checkedQuestions, setCheckedQuestions] = useState<{ [key: number]: boolean }>({});
    // Mobile: closed by default, Desktop (>=1024px): open by default
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // Resume-previous-attempt modal
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [pendingSession, setPendingSession] = useState<{
        id: string;
        answers: Record<number, string>;
        checked: Record<number, boolean>;
        dbAnswers: Record<string, string>;
    } | null>(null);

    // Session tracking for student_sets (like super-30)
    const sessionIdRef = React.useRef<string | null>(null);
    const sessionAnswersRef = React.useRef<{ [questionUuid: string]: string }>({});
    const [sessionClosed, setSessionClosed] = useState(false);
    const inactivityTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close the current session in student_sets
    const closeSession = React.useCallback(async () => {
        const sid = sessionIdRef.current;
        if (!sid || sessionClosed) return;
        setSessionClosed(true);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        await supabase
            .from('student_sets')
            .update({ time_elapsed: -1 })
            .eq('id', sid);
        sessionIdRef.current = null;
    }, [sessionClosed]);

    // Reset inactivity timer on any user interaction
    const resetInactivityTimer = React.useCallback(() => {
        if (sessionClosed) return;
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        const timeout = 20 * 60 * 1000; // 20min inactivity timeout
        inactivityTimerRef.current = setTimeout(() => {
            closeSession();
        }, timeout);
    }, [sessionClosed, closeSession]);

    // Start/restart inactivity timer whenever user interacts
    useEffect(() => {
        if (!sessionIdRef.current || sessionClosed) return;

        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const handler = () => resetInactivityTimer();

        events.forEach(e => window.addEventListener(e, handler));
        resetInactivityTimer(); // kick off initial timer

        return () => {
            events.forEach(e => window.removeEventListener(e, handler));
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [resetInactivityTimer, sessionClosed]);

    // Close session on page unload / tab close
    useEffect(() => {
        const handleUnload = () => {
            const sid = sessionIdRef.current;
            if (sid) {
                const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://eznxtdzsvnfclgcavvhp.supabase.co';
                const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnh0ZHpzdm5mY2xnY2F2dmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDA5MDcsImV4cCI6MjA3ODE3NjkwN30.uxkZPGvN9-KXqulS-KguoFAvR33RluyNR-O3SNH8iwI';
                const url = `${supabaseUrl}/rest/v1/student_sets?id=eq.${sid}`;
                // Use fetch with keepalive for reliable fire-and-forget on unload
                fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({ time_elapsed: -1 }),
                    keepalive: true,
                }).catch(() => {});
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    // Set initial palette state based on window width (run once on mount)
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsPaletteOpen(true);
        }
    }, []);

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
        // Don't fetch until auth has resolved — avoids stale isPaidUser in the closure
        if (authLoading) return;

        const fetchData = async () => {
            if (!subject) return;

            try {
                setLoading(true);

                // Get auth token so the server can verify subscription tier
                const { data: { session } } = await supabase.auth.getSession();
                const headers: Record<string, string> = {};
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`;
                }

                // Fetch questions via server-side proxy (hides GitHub URL + enforces limit)
                const res = await fetch(
                    `/api/questions?setId=${encodeURIComponent(targetSetId)}&subject=${encodeURIComponent(subject)}`,
                    { headers }
                );

                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody.error || 'Failed to load practice data');
                }

                const { questions: fetchedQuestions, solutions: solMap, totalCount } = await res.json();

                setSolutions(solMap || {});

                // Shuffle options for each MCQ question (questions already shuffled server-side)
                const processedQuestions = fetchedQuestions.map((q: LocalQuestion) => {
                    const hasValidOptions = q.options &&
                        q.options.length > 0 &&
                        q.options.some((opt: { text: string; image: string | null }) => opt.text?.trim() || opt.image);

                    if (hasValidOptions) {
                        return {
                            ...q,
                            options: shuffleArray(q.options)
                        };
                    }
                    return q;
                });

                setTotalQuestionsCount(totalCount);
                setQuestions(processedQuestions);

                // Reset state for new subject
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setNumericAnswer('');
                setShowSolution(false);
                setUserAnswers({});
                setCheckedQuestions({});

                // Check for an existing session to resume
                if (user?.id) {
                    try {
                        const { data: existingSessions } = await supabase
                            .from('student_sets')
                            .select('id, answers')
                            .eq('user_id', user.id)
                            .eq('set_id', targetSetId)
                            .order('created_at', { ascending: false })
                            .limit(1);

                        const latestSession = existingSessions?.[0];
                        const storedAnswers = (latestSession?.answers ?? {}) as Record<string, string>;
                        const answerKeys = Object.keys(storedAnswers);

                        // Build UUID → index map from fetched questions
                        const uuidToIdx: Record<string, number> = {};
                        processedQuestions.forEach((q: LocalQuestion, idx: number) => {
                            uuidToIdx[q.uuid || q.id] = idx;
                        });

                        // Check if any stored answer belongs to the current question set
                        let hasMatch = false;
                        const matchingAnswers: Record<number, string> = {};
                        const matchingChecked: Record<number, boolean> = {};

                        for (const uuid of answerKeys) {
                            if (uuid in uuidToIdx) {
                                hasMatch = true;
                                matchingAnswers[uuidToIdx[uuid]] = storedAnswers[uuid];
                                matchingChecked[uuidToIdx[uuid]] = true;
                            }
                        }

                        if (hasMatch && latestSession) {
                            // Existing attempt found — ask user what to do
                            setPendingSession({
                                id: latestSession.id,
                                answers: matchingAnswers,
                                checked: matchingChecked,
                                dbAnswers: storedAnswers,
                            });
                            setShowResumeModal(true);
                        } else {
                            // No resumable session — create a fresh one
                            const { data: newSession, error: sessErr } = await supabase
                                .from('student_sets')
                                .insert({
                                    user_id: user.id,
                                    set_id: targetSetId,
                                    answers: {},
                                })
                                .select('id')
                                .single();

                            if (sessErr) throw sessErr;
                            if (newSession) {
                                sessionIdRef.current = newSession.id;
                                sessionAnswersRef.current = {};
                                setSessionClosed(false);
                            }
                        }
                    } catch (e) {
                        console.error('Error checking/creating set session:', e);
                    }
                }

            } catch (err: any) {
                console.error(err);
                setError(`Failed to load practice data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject, targetSetId, authLoading, isPaidUser, user?.id]);

    // Persist answer to student_sets in DB
    const updateAnswerInDB = async (questionUuid: string, answer: string | null) => {
        const sid = sessionIdRef.current;
        if (!sid) return;

        const updated = { ...sessionAnswersRef.current };
        if (answer) {
            updated[questionUuid] = answer;
        } else {
            delete updated[questionUuid];
        }
        sessionAnswersRef.current = updated;

        await supabase
            .from('student_sets')
            .update({ answers: updated })
            .eq('id', sid);
    };

    const handleOptionSelect = (optionId: string) => {
        // Prevent changing answer after check
        if (checkedQuestions[currentQuestionIndex]) return;

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

        // Sync to DB
        if (currentQuestion) {
            updateAnswerInDB(currentQuestion.uuid || currentQuestion.id, newSelection);
        }
    };

    const handleNumericAnswerChange = (value: string) => {
        // Prevent changing answer after check
        if (checkedQuestions[currentQuestionIndex]) return;

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

        // Sync to DB
        if (currentQuestion) {
            updateAnswerInDB(currentQuestion.uuid || currentQuestion.id, value || null);
        }
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
            // Hide solution when navigating, but checked state persists
            setShowSolution(false);
        } else if (!isPaidUser && totalQuestionsCount > FREE_QUESTION_LIMIT) {
            // Last free question — more exist behind the paywall
            setShowPaywallModal(true);
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

    // Resume previous attempt
    const handleResume = () => {
        if (!pendingSession) return;
        sessionIdRef.current = pendingSession.id;
        sessionAnswersRef.current = pendingSession.dbAnswers;
        setUserAnswers(pendingSession.answers);
        setCheckedQuestions(pendingSession.checked);
        setSessionClosed(false);
        setShowResumeModal(false);

        // Navigate to the first unanswered question
        const answeredIndices = Object.keys(pendingSession.answers).map(Number);
        const firstUnanswered = questions.findIndex((_, idx) => !answeredIndices.includes(idx));
        const resumeIdx = firstUnanswered >= 0 ? firstUnanswered : 0;
        setCurrentQuestionIndex(resumeIdx);

        const q = questions[resumeIdx];
        if (q && isIntegerTypeQuestion(q)) {
            setNumericAnswer(pendingSession.answers[resumeIdx] || '');
            setSelectedOption(null);
        } else {
            setSelectedOption(pendingSession.answers[resumeIdx] || null);
            setNumericAnswer('');
        }

        setPendingSession(null);
    };

    // Start fresh attempt
    const handleFreshStart = async () => {
        setShowResumeModal(false);
        setPendingSession(null);

        if (user?.id) {
            try {
                const { data: newSession, error: sessErr } = await supabase
                    .from('student_sets')
                    .insert({
                        user_id: user.id,
                        set_id: targetSetId,
                        answers: {},
                    })
                    .select('id')
                    .single();

                if (sessErr) throw sessErr;
                if (newSession) {
                    sessionIdRef.current = newSession.id;
                    sessionAnswersRef.current = {};
                    setSessionClosed(false);
                }
            } catch (e) {
                console.error('Error creating set session:', e);
            }
        }
    };

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
                        onClick={() => targetSetId.startsWith('ch-') ? navigate(-1) : navigate('/question-set', { state: { viewState: 'subject_selection', selectedSet: targetSetId === 'condensed' ? 'condensed_main' : targetSetId === 'sufficient' ? 'accuracy' : targetSetId === 'last-resort' ? 'level2' : targetSetId === 'neet-phy' ? 'neet_phy' : 'statement' } })}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary-light">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-text-light dark:text-text-dark text-sm md:text-base line-clamp-1">
                            {targetSetId === 'sufficient' ? 'Fast Track Practice' : targetSetId === 'last-resort' ? '360° Preparation' : targetSetId === 'anr' ? 'Statement Based Practice' : targetSetId === 'neet-phy' ? 'NEET Physics Set' : 'Condensed PYQ Practice'}
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
                                <div className="flex items-center justify-between mb-4">
                                    <div className="inline-block px-3 py-1 bg-background-light dark:bg-white/5 rounded-lg text-xs font-bold text-text-secondary-light uppercase tracking-widest">
                                        {isIntegerType ? 'Integer Type' : 'Single Correct Type'}
                                    </div>
                                    <ReportFlag questionId={currentQuestion.uuid || currentQuestion.id} />
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

                            {/* Answer Section */}
                            {isIntegerType ? (
                                /* Numeric Keypad for Integer Type */
                                <div className="py-4">
                                    <NumericKeypad
                                        value={numericAnswer}
                                        onChange={handleNumericAnswerChange}
                                        disabled={!!checkedQuestions[currentQuestionIndex]}
                                        showResult={showSolution}
                                        isCorrect={isNumericAnswerCorrect}
                                        correctAnswer={currentQuestion.correctAnswer}
                                    />
                                </div>
                            ) : (
                                /* Options for MCQ */
                                <MCQOptions
                                    options={currentQuestion.options}
                                    selectedId={selectedOption}
                                    onSelect={handleOptionSelect}
                                    disabled={!!checkedQuestions[currentQuestionIndex]}
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
                    <div className="h-full overflow-y-auto p-4 md:p-6 w-full custom-scrollbar">
                        <h3 className="font-bold text-text-light dark:text-text-dark mb-4 flex items-center justify-between">
                            <span>Question Palette</span>
                            <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden p-1 rounded hover:bg-background-light dark:hover:bg-white/5">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </h3>
                        <div className="relative">
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const isCurrent = currentQuestionIndex === idx;
                                    const isChecked = !!checkedQuestions[idx];
                                    const answer = userAnswers[idx];
                                    let isCorrect = false;
                                    let isWrong = false;

                                    if (isChecked && answer) {
                                        if (isIntegerTypeQuestion(q)) {
                                            isCorrect = answer.trim() === q.correctAnswer?.trim();
                                        } else {
                                            isCorrect = answer === q.correctAnswer;
                                        }
                                        isWrong = !isCorrect;
                                    }

                                    let btnClass = "w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ";

                                    if (isCurrent) btnClass += "bg-primary text-white shadow-md shadow-primary/30";
                                    else if (isCorrect) btnClass += "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
                                    else if (isWrong) btnClass += "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
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

                            {/* Locked questions fade section for free users */}
                            {!isPaidUser && totalQuestionsCount > FREE_QUESTION_LIMIT && (
                                <div className="mt-1">
                                    {/* Phantom locked question numbers with fade */}
                                    <div className="relative">
                                        <div className="grid grid-cols-5 gap-2 opacity-40 pointer-events-none select-none">
                                            {Array.from({ length: Math.min(totalQuestionsCount - FREE_QUESTION_LIMIT, 10) }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-10 h-10 rounded-xl text-sm flex items-center justify-center border border-border-light dark:border-border-dark text-text-secondary-light"
                                                >
                                                    {FREE_QUESTION_LIMIT + i + 1}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Gradient fade overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-light/70 to-surface-light dark:via-surface-dark/70 dark:to-surface-dark pointer-events-none" />
                                    </div>

                                    {/* Upgrade nudge */}
                                    <button
                                        onClick={() => setShowPaywallModal(true)}
                                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
                                    >
                                        <span
                                            className="material-symbols-outlined text-primary text-[15px]"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            lock
                                        </span>
                                        <span className="text-xs font-semibold text-primary">
                                            {totalQuestionsCount - FREE_QUESTION_LIMIT} more · Get Lite
                                        </span>
                                    </button>
                                </div>
                            )}
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
                            onClick={() => {
                                if (!showSolution) {
                                    // Lock the answer permanently when checking
                                    setCheckedQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
                                }
                                setShowSolution(!showSolution);
                            }}
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

                    {/* Next / Submit / Unlock Button */}
                    {isLastQuestion && !isPaidUser && totalQuestionsCount > FREE_QUESTION_LIMIT ? (
                        // Soft paywall nudge on the last free question
                        <button
                            onClick={() => setShowPaywallModal(true)}
                            className="flex items-center justify-center gap-1.5 w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-full md:rounded-xl bg-surface-light dark:bg-surface-dark border border-primary/40 text-primary font-bold shadow-sm transition-all hover:bg-primary/5"
                            title="Unlock more questions"
                        >
                            <span
                                className="material-symbols-outlined text-xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                lock
                            </span>
                            <span className="hidden md:inline text-sm">Unlock</span>
                        </button>
                    ) : isLastQuestion ? (
                        // Submit button on last question
                        <button
                            onClick={closeSession}
                            disabled={sessionClosed}
                            className={`flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl font-bold shadow-md transition-all ${
                                sessionClosed
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'
                            }`}
                            title={sessionClosed ? "Session Submitted" : "Submit Set"}
                        >
                            <span className="material-symbols-outlined text-2xl md:text-xl">
                                {sessionClosed ? 'check_circle' : 'send'}
                            </span>
                            <span className="hidden md:inline ml-1">{sessionClosed ? 'Submitted' : 'Submit'}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2.5 rounded-full md:rounded-xl bg-primary md:bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-all"
                            title="Next Question"
                        >
                            <span className="hidden md:inline mr-1">Next</span>
                            <span className="material-symbols-outlined text-2xl md:text-xl">
                                chevron_right
                            </span>
                        </button>
                    )}
                </div>
            </footer>

            {/* Resume Attempt Modal */}
            {showResumeModal && pendingSession && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <div
                        className="relative bg-surface-light dark:bg-surface-dark rounded-2xl p-5 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border border-border-light dark:border-border-dark"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">history</span>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-text-light dark:text-text-dark mb-1">
                                    Previous Attempt Found
                                </h2>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    You answered {Object.keys(pendingSession.answers).length} of {questions.length} questions last time. Would you like to continue?
                                </p>
                            </div>

                            <div className="w-full flex flex-col gap-2">
                                <button
                                    onClick={handleResume}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-dark hover:scale-[1.02] transition-all"
                                >
                                    Continue Last Attempt
                                </button>
                                <button
                                    onClick={handleFreshStart}
                                    className="w-full py-2.5 rounded-xl border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm hover:bg-background-light dark:hover:bg-white/5 transition-colors"
                                >
                                    Start Fresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paywall Modal */}
            {showPaywallModal && (
                <SubscriptionModal
                    onClose={() => setShowPaywallModal(false)}
                    onUpgrade={() => navigate('/pricing')}
                />
            )}
        </div >
    );
};

export default CondensedPractice;
