import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

// Subject Images
import phyImg from '../assets/cards/phy.png';
import chemImg from '../assets/cards/chem.png';
import mathImg from '../assets/cards/math.png';

// Dashboard Card Images
import condensedImg from '../assets/cards/condensed-pyq.png';
import super30Img from '../assets/cards/super30.png';
import accuracyImg from '../assets/cards/fast-track-set.png';
import assertionImg from '../assets/cards/assertion.png';
import lvl2PyqImg from '../assets/cards/360-degree-set.png';

// NEET Physics Images
import neetPhyMechImg from '../assets/cards/neet_phy_mechanics.png';
import neetPhyThermoImg from '../assets/cards/neet_phy_thermo.png';
import neetPhyWavesImg from '../assets/cards/neet_phy_waves.png';
import neetPhyElectroImg from '../assets/cards/neet_phy_electro.png';
import neetPhyOpticsImg from '../assets/cards/neet_phy_optics.png';
import neetPhyModernImg from '../assets/cards/neet_phy_modern.png';
import neetPhyNuclearImg from '../assets/cards/neet_phy_nuclear.png';

// Maps dashboard item id → question_set.set_id in Supabase
const ITEM_SET_ID: Record<string, string> = {
    'condensed_main': 'condensed',
    'super30': 'super-30',
    'accuracy': 'sufficient',
    'statement': 'anr',
    'level2': 'last-resort',
    'neet_phy': 'neet-phy',
};

const QuestionSet: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, examType } = useAuth();
    const [viewState, setViewState] = useState<'dashboard' | 'subject_selection'>(
        (location.state as any)?.viewState || 'dashboard'
    );
    const [selectedSet, setSelectedSet] = useState<string | null>((location.state as any)?.selectedSet || null);

    // Supabase question set data: url + tier + exam per set_id
    const [setDataMap, setSetDataMap] = useState<Record<string, { url: string | null; tier: string | null; exam: string | null }>>({});
    const [setsLoading, setSetsLoading] = useState(true);

    // Track which fetch is the "current" one so stale fetches can't update state
    const fetchIdRef = React.useRef(0);

    useEffect(() => {
        const id = ++fetchIdRef.current;
        setSetsLoading(true);

        const fetchSetData = async (attempt = 0): Promise<void> => {
            try {
                const { data, error } = await supabase
                    .from('question_set')
                    .select('set_id, url, tier, exam')
                    .in('set_id', ['condensed', 'super-30', 'sufficient', 'anr', 'last-resort', 'neet-phy']);

                if (fetchIdRef.current !== id) return;
                if (error) throw error;

                const map: Record<string, { url: string | null; tier: string | null; exam: string | null }> = {
                    condensed: { url: null, tier: null, exam: null },
                    'super-30': { url: null, tier: null, exam: null },
                    sufficient: { url: null, tier: null, exam: null },
                    anr: { url: null, tier: null, exam: null },
                    'last-resort': { url: null, tier: null, exam: null },
                    'neet-phy': { url: null, tier: null, exam: null },
                };
                (data || []).forEach((row: any) => {
                    map[row.set_id] = { url: row.url ?? null, tier: row.tier ?? null, exam: row.exam ?? null };
                });

                // If query returned no rows and user is authenticated, the session
                // token may be stale — retry after a brief delay
                const hasData = (data || []).length > 0;
                if (!hasData && isAuthenticated && attempt < 2) {
                    await new Promise(r => setTimeout(r, 800));
                    if (fetchIdRef.current === id) return fetchSetData(attempt + 1);
                    return;
                }

                if (fetchIdRef.current === id) setSetDataMap(map);
            } catch (err) {
                console.error('[QuestionSet] fetch error:', err);
                if (isAuthenticated && attempt < 2 && fetchIdRef.current === id) {
                    await new Promise(r => setTimeout(r, 800));
                    if (fetchIdRef.current === id) return fetchSetData(attempt + 1);
                }
            } finally {
                if (fetchIdRef.current === id) setSetsLoading(false);
            }
        };

        fetchSetData();
    }, [isAuthenticated]);

    // null url → coming soon (content not ready)
    const isItemComingSoon = (itemId: string): boolean => {
        const setId = ITEM_SET_ID[itemId];
        if (!setId) return false;
        // While loading, preserve previous data instead of flashing "Coming Soon"
        if (setsLoading && Object.keys(setDataMap).length === 0) return true;
        if (setsLoading) return false;
        return setDataMap[setId]?.url == null;
    };

    // Returns false if the set's exam doesn't match the user's exam type.
    // If no exam restriction on the set (null), or user has no exam type set, it's visible.
    const isItemExamMatch = (itemId: string): boolean => {
        if (!examType) return true;
        const setId = ITEM_SET_ID[itemId];
        if (!setId) return true;
        if (setsLoading) return true;
        const setExam = setDataMap[setId]?.exam;
        if (!setExam) return true;
        return setExam.toUpperCase() === examType.toUpperCase();
    };

    // Condensed PYQ Subjects Data
    const condensedSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - Mechanics & Thermodynamics',
            description: 'Hand-picked, verified questions distilled from the last 10 years of JEE Main & JEE Advanced. Based on JEE Main 2026 Jan session patterns. Focus on what really repeats.',
            stats: { questions: '160 Qs', time: '12 Hrs', difficulty: 'Hard' },
            tags: ['Condensed PYQs', 'High Yield'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-blue-500',
                tagMain: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - Physical & Inorganic',
            description: 'Handcrafted, most analysed high-yield formulas and exception-based questions from the last decade of JEE Main exams.',
            stats: { questions: '175 Qs', time: '10 Hrs', difficulty: 'Medium' },
            tags: ['Condensed PYQs', 'Formula Based'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-teal-500',
                tagMain: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
                titleHover: 'group-hover:text-teal-600 dark:group-hover:text-teal-400'
            }
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            title: 'Mathematics - Calculus & Algebra',
            description: 'Best hand-picked problem types verified for JEE Main 2026 & JEE Advanced 2026 to improve your speed in calculations.',
            stats: { questions: '140 Qs', time: '14 Hrs', difficulty: 'Hard' },
            tags: ['Condensed PYQs', 'Calculation Heavy'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-indigo-500',
                tagMain: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
                titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }
        }
    ];

    // Main Dashboard Items
    const dashboardItems = [
        {
            id: 'level2',
            title: '360° Set',
            description: 'Most analysed, best full-coverage set — your handcrafted last resort for JEE Main 2026 & JEE Advanced 2026',
            stats: { questions: 'Rank Booster', time: 'Variable', type: 'Advanced', difficulty: 'Extreme' },
            tags: ['Rank Booster', 'High Difficulty'],
            action: () => { setSelectedSet('level2'); setViewState('subject_selection'); },
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            },
            image: lvl2PyqImg
        },
        {
            id: 'accuracy',
            title: 'Fast Track Set',
            description: 'Hand-picked set designed to provide maximum marks in minimum time for JEE Main 2026',
            stats: { questions: 'Drills', time: 'Variable', type: 'Speed', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            action: () => { setSelectedSet('accuracy'); setViewState('subject_selection'); },
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            },
            image: accuracyImg
        },
        {
            id: 'statement',
            title: 'A&R Set',
            description: 'Best verified assertion-reason and statement-based questions based on JEE Main 2026 Jan patterns that are increasingly common in exams.',
            stats: { questions: '60 Qs/Subject', time: 'Complete Coverage', type: '2026 Relevant', difficulty: 'Easy' },
            tags: ['A&R', 'Statement Based'],
            action: () => { setSelectedSet('statement'); setViewState('subject_selection'); },
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            },
            image: assertionImg
        },
        {
            id: 'condensed_main',
            title: 'Condensed PYQs',
            description: 'Hand-picked, verified high-yield questions from the last 10 years of JEE Main, based on JEE Main 2026 Jan session. Filtered for maximum relevance.',
            stats: { questions: '~150 Qs/Subject', time: '36 Hrs', type: '2026 Relevant', difficulty: 'Medium' },
            tags: ['Most Popular'],
            action: () => { setSelectedSet('condensed_main'); setViewState('subject_selection'); },
            classes: {
                badgeBg: 'bg-blue-500',
                tagMain: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
            },
            image: condensedImg
        },
        {
            id: 'super30',
            title: 'Super 30',
            description: 'A handcrafted set of 30 best, most analysed problems designed to challenge your understanding of multiple concepts at once.',
            stats: { questions: '30 Qs/Subject', time: '2 Hrs', type: 'IPQs from PYQs', difficulty: 'Easy' },
            tags: ['Basics Mastery'],
            action: () => navigate('/super30'),
            classes: {
                badgeBg: 'bg-purple-500',
                tagMain: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
            },
            image: super30Img
        },
        {
            id: 'neet_phy',
            title: 'Physics Set (Lite Plan)',
            description: 'Exclusive NEET Physics question set with targeted practice across 7 modules to maximize your score.',
            stats: { questions: '7 Modules', time: 'Comprehensive', type: 'NEET Relevant', difficulty: 'Medium' },
            tags: ['Lite Plan', 'NEET Physics'],
            action: () => { setSelectedSet('neet_phy'); setViewState('subject_selection'); },
            classes: {
                badgeBg: 'bg-indigo-500',
                tagMain: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
                titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            },
            image: phyImg
        }
    ];

    const fastTrackSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - Fast Track',
            description: 'Hand-picked set designed to provide maximum marks in minimum time for JEE Main 2026. Best verified drills for mechanics and modern physics.',
            stats: { questions: 'Variable Qs', time: 'Depends', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - Fast Track',
            description: 'Handcrafted, most analysed high-frequency chemistry drills to maximize your JEE Main 2026 scoring rate.',
            stats: { questions: 'Variable Qs', time: 'Depends', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }
        }
    ];

    const level2Subjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - 360° Set',
            description: 'Hand-picked, verified full coverage rank booster questions for complete JEE Main 2026 & JEE Advanced 2026 preparation.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - 360° Set',
            description: 'Most analysed, best final revision covering tricky edge-cases and exceptions for JEE Main 2026.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            title: 'Mathematics - 360° Set',
            description: 'Handcrafted, verified multi-concept problems to solidify your edge in Mathematics for JEE Advanced 2026.',
            stats: { questions: 'Rank Booster', time: 'Variable', difficulty: 'Hard' },
            tags: ['Rank Booster', 'High Difficulty'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        }
    ];

    const statementSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - A&R Set',
            description: 'Best verified assertion-reason and statement-based questions in Physics for JEE Main 2026.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Medium' },
            tags: ['Assertion-Reason'],
            image: phyImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            title: 'Chemistry - A&R Set',
            description: 'Hand-picked, most analysed statement-based formats covering Physical, Inorganic, and Organic Chemistry for JEE Main 2026.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Medium' },
            tags: ['Statement Based'],
            image: chemImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            title: 'Mathematics - A&R Set',
            description: 'Handcrafted, verified statement and assertion questions for Algebra and Calculus — based on JEE Main 2026 Jan patterns.',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Hard' },
            tags: ['Statement Based'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        }
    ];

    const neetPhySubjects = [
        {
            id: '1',
            name: 'Full Syllabus 1',
            title: 'Set 1 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Medium' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyMechImg,
            classes: {
                badgeBg: 'bg-indigo-500',
                tagMain: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
                titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }
        },
        {
            id: '2',
            name: 'Full Syllabus 2',
            title: 'Set 2 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Medium' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyThermoImg,
            classes: {
                badgeBg: 'bg-orange-500',
                tagMain: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                titleHover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
            }
        },
        {
            id: '3',
            name: 'Full Syllabus 3',
            title: 'Set 3 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Medium' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyWavesImg,
            classes: {
                badgeBg: 'bg-cyan-500',
                tagMain: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
                titleHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
            }
        },
        {
            id: '4',
            name: 'Full Syllabus 4',
            title: 'Set 4 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Hard' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyElectroImg,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }
        },
        {
            id: '5',
            name: 'Full Syllabus 5',
            title: 'Set 5 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Medium' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyOpticsImg,
            classes: {
                badgeBg: 'bg-violet-500',
                tagMain: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
                titleHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400'
            }
        },
        {
            id: '6',
            name: 'Full Syllabus 6',
            title: 'Set 6 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Easy' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyModernImg,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }
        },
        {
            id: '7',
            name: 'Full Syllabus 7',
            title: 'Set 7 - Full Syllabus Mock',
            description: 'Comprehensive full syllabus practice set for NEET Physics, covering all major topics to boost your exam readiness.',
            stats: { questions: 'Full Mock', time: 'Depends', difficulty: 'Easy' },
            tags: ['NEET Physics', 'Full Syllabus'],
            image: neetPhyNuclearImg,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            }
        }
    ];

    const getActiveSubjects = () => {
        if (selectedSet === 'accuracy') return fastTrackSubjects;
        if (selectedSet === 'level2') return level2Subjects;
        if (selectedSet === 'statement') return statementSubjects;
        if (selectedSet === 'neet_phy') return neetPhySubjects;
        return condensedSubjects;
    };

    const handleStartPractice = (subjectId: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!selectedSet) return;
        const dbSetId = ITEM_SET_ID[selectedSet] || 'condensed';
        navigate(`/question-set/${dbSetId}/${subjectId}/practice`);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none grid-bg-light dark:grid-bg-dark opacity-40"></div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
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
                    background-color: rgba(107, 114, 128, 0.8);
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.8);
                }
            `}</style>

            <div className="flex-1 overflow-y-auto p-3 md:p-10 relative z-10 custom-scrollbar">
                <div className="mx-auto max-w-6xl flex flex-col gap-8 pb-20">

                    {/* Header Section */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary text-sm font-bold mb-1 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[20px]">dataset</span>
                            <span>Question Bank</span>
                        </div>
                        <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            {viewState === 'dashboard' ? 'Explore Question Sets' : 'Select Subject'}
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal max-w-2xl mt-2">
                            {viewState === 'dashboard'
                                ? 'Browse our hand-picked, verified collection of high-yield question sets — handcrafted for JEE Main 2026 & JEE Advanced 2026 to maximize your prep efficiency.'
                                : 'Choose a subject to start practicing.'}
                        </p>
                    </div>

                    {/* Back Button */}
                    {viewState !== 'dashboard' && (
                        <div>
                            <button
                                onClick={() => {
                                    setViewState('dashboard');
                                    setSelectedSet(null);
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to All Sets
                            </button>
                        </div>
                    )}

                    {/* Dashboard View */}
                    {viewState === 'dashboard' && (
                        <div className="grid grid-cols-1 gap-5">
                            {setsLoading && Object.keys(setDataMap).length === 0 ? (
                                /* Skeleton Loading Cards */
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={`skeleton-${i}`}
                                        className="relative flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden animate-pulse"
                                    >
                                        {/* Image skeleton */}
                                        <div className="md:w-56 h-36 md:h-auto bg-gray-200 dark:bg-gray-800 shrink-0" />
                                        {/* Content skeleton */}
                                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                                </div>
                                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-1" />
                                                <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
                                            </div>
                                            <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-t border-border-light dark:border-border-dark pt-3 md:pt-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                                    <div className="hidden md:block h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                                </div>
                                                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : !setsLoading && examType && dashboardItems.every(item => !isItemExamMatch(item.id)) ? (
                                <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                        <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
                                    </div>
                                    <h2 className="text-text-light dark:text-text-dark text-xl font-bold">
                                        Sets for {examType.toUpperCase()} are on their way!
                                    </h2>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm leading-relaxed">
                                        We're handcrafting the best question sets for {examType.toUpperCase()} aspirants. Till then, keep your practice sharp — head over to the Practice section and stay ahead of the curve.
                                    </p>
                                </div>
                            ) : (
                            dashboardItems.filter(item => isItemExamMatch(item.id)).map((item) => {
                                const comingSoon = isItemComingSoon(item.id);

                                const handleClick = () => {
                                    if (comingSoon) return;
                                    item.action();
                                };

                                return (
                                    <div
                                        key={item.id}
                                        onClick={handleClick}
                                        className={`group relative flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300
                                            ${comingSoon
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30'}
                                        `}
                                    >
                                        {/* Image/Icon Section */}
                                        <div className="md:w-56 h-36 md:h-auto bg-black relative overflow-hidden shrink-0 flex items-center justify-center p-4">
                                            {item.image && (
                                                <div
                                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                                    style={{ backgroundImage: `url("${item.image}")` }}
                                                />
                                            )}

                                            {/* Mobile badge */}
                                            {!comingSoon && item.tags && (
                                                <div className="absolute bottom-2 left-2 md:hidden">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white ${item.classes.badgeBg}`}>
                                                        {item.tags[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        {item.tags && item.tags.map((tag: string, idx: number) => (
                                                            <span key={idx} className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                                ${idx === 0
                                                                    ? item.classes.tagMain
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                                }`}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                        ${item.stats.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            item.stats.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                item.stats.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                                                        <span>{item.stats.difficulty}</span>
                                                    </div>
                                                </div>

                                                <h3 className={`text-text-light dark:text-text-dark text-lg md:text-xl font-bold mb-1 transition-colors ${item.classes.titleHover}`}>
                                                    {item.title}
                                                </h3>
                                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs md:text-sm leading-relaxed line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-t border-border-light dark:border-border-dark pt-3 md:pt-4">
                                                <div className="flex items-center gap-4 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                    <div className="flex items-center gap-1.5" title="Items">
                                                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">format_list_numbered</span>
                                                        <span className="font-medium">{item.stats.questions}</span>
                                                    </div>
                                                    {item.stats.time && (
                                                        <div className="hidden md:flex items-center gap-1.5" title="Estimated Time">
                                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                            <span className="font-medium">{item.stats.time}</span>
                                                        </div>
                                                    )}
                                                    <div className="hidden md:flex items-center gap-1.5" title="Type">
                                                        <span className="material-symbols-outlined text-[18px]">category</span>
                                                        <span className="font-medium">{item.stats.type}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    disabled={comingSoon}
                                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98]
                                                        ${comingSoon
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                            : 'bg-primary text-white shadow-md shadow-blue-500/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-blue-500/30'
                                                        }`}
                                                >
                                                    {comingSoon ? (
                                                        'Coming Soon'
                                                    ) : (
                                                        <>
                                                            Start Practice
                                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                            )}
                        </div>
                    )}

                    {/* Subject Selection View */}
                    {viewState === 'subject_selection' && (
                        <div className="grid grid-cols-1 gap-5">
                            {getActiveSubjects().map((subject) => (
                                <div
                                    key={subject.id}
                                    className="group relative flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30 transition-all duration-300"
                                >
                                    {/* Image Section */}
                                    <div className="md:w-56 h-36 md:h-auto bg-black relative overflow-hidden shrink-0 flex items-center justify-center p-4">
                                        {subject.image && (
                                            <div
                                                className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                                style={{ backgroundImage: `url("${subject.image}")` }}
                                            />
                                        )}
                                        {subject.tags && (
                                            <div className="md:hidden absolute bottom-2 left-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white ${subject.classes.badgeBg}`}>
                                                    {subject.tags[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    {subject.tags && subject.tags.map((tag, idx) => (
                                                        <span key={idx} className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                            ${idx === 0
                                                                ? subject.classes.tagMain
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                    ${subject.stats.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        subject.stats.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            subject.stats.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                                                    <span>{subject.stats.difficulty}</span>
                                                </div>
                                            </div>

                                            <h3 className={`text-text-light dark:text-text-dark text-lg md:text-xl font-bold mb-1 transition-colors ${subject.classes.titleHover}`}>
                                                {subject.title}
                                            </h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs md:text-sm leading-relaxed line-clamp-2">
                                                {subject.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border-light dark:border-border-dark pt-3 md:pt-4">
                                            <div className="flex items-center gap-4 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <div className="flex items-center gap-1.5" title="Items">
                                                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">format_list_numbered</span>
                                                    <span className="font-medium">{subject.stats.questions}</span>
                                                </div>
                                                <div className="hidden md:flex items-center gap-1.5" title="Estimated Time">
                                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                    <span className="font-medium">{subject.stats.time}</span>
                                                </div>
                                                <div className="hidden md:flex items-center gap-1.5" title="Difficulty">
                                                    <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                                                    <span className="font-medium">{subject.stats.difficulty}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleStartPractice(subject.id)}
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] bg-primary text-white shadow-md shadow-blue-500/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-blue-500/30"
                                            >
                                                Start Practice
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default QuestionSet;
