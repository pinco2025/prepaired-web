import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionModal from './SubscriptionModal';

// Subject Images
import phyImg from '../assets/cards/phy.png';
import chemImg from '../assets/cards/chem.png';
import mathImg from '../assets/cards/math.png';

// Dashboard Card Images
import condensedImg from '../assets/cards/condensed-pyq.png';
import super30Img from '../assets/cards/super30.png';
import accuracyImg from '../assets/cards/accuracy-speed.png';
import assertionImg from '../assets/cards/assertion.png';
import lvl2PyqImg from '../assets/cards/lvl-2-pyq.png';

const QuestionSet: React.FC = () => {
    const navigate = useNavigate();
    const { isPaidUser, isAuthenticated, subscriptionType } = useAuth();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [, setSelectedSubject] = useState<string | null>(null);
    const [viewState, setViewState] = useState<'dashboard' | 'condensed_selection' | 'statement_parts' | 'statement_subjects'>('dashboard');
    const [statementPart, setStatementPart] = useState<'part1' | 'part2' | null>(null);

    // Condensed PYQ Subjects Data
    const condensedSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics - Mechanics & Thermodynamics',
            description: 'Master the toughest core concepts with questions distilled from the last 10 years of exams. Focus on what really repeats.',
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
            description: 'Focus on high-yield formulas and exception-based questions from the last decade.',
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
            description: 'Practice the most probable problem types and improve your speed in calculations.',
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
            id: 'condensed_main',
            title: 'Condensed PYQs',
            description: 'High-yield questions from the last 10 years needed to crack the exam. Filtered for maximum relevance.',
            stats: { questions: '~150 Qs/Subject', time: '36 Hrs', type: '2026 Relevant', difficulty: 'Medium' },
            tags: ['Most Popular'],
            action: () => setViewState('condensed_selection'),
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
            description: 'A highly curated set of 30 complex problems designed to challenge your understanding of multiple concepts at once.',
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
            id: 'accuracy',
            title: 'Accuracy Boosters',
            description: 'Speed-focused drills to minimize silly mistakes and improve exam temperament.',
            stats: { questions: 'Drills', time: 'Variable', type: 'Speed', difficulty: 'Medium' },
            tags: ['Speed', 'Precision'],
            action: () => { }, // Placeholder
            disabled: true,
            classes: {
                badgeBg: 'bg-amber-500',
                tagMain: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
            },
            image: accuracyImg
        },
        {
            id: 'statement',
            title: 'Statement Based Set',
            description: 'Master assertion-reason and statement-based questions that are becoming increasingly common in exams.',
            stats: { questions: '60 Qs/Subject', time: 'Complete Coverage', type: '2026 Relevant', difficulty: 'Easy' },
            tags: ['A&R', 'Statement Based'],
            action: () => { }, // Placeholder
            disabled: true,
            classes: {
                badgeBg: 'bg-rose-500',
                tagMain: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
                titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            },
            image: assertionImg
        },
        {
            id: 'level2',
            title: 'Level-2 PYQs',
            description: 'The toughest previous year questions filtered to boost your rank and challenge your limits.',
            stats: { questions: 'Rank Booster', time: 'Variable', type: 'Advanced', difficulty: 'Extreme' },
            tags: ['Rank Booster', 'High Difficulty'],
            action: () => { }, // Placeholder
            disabled: true,
            classes: {
                badgeBg: 'bg-emerald-500',
                tagMain: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            },
            image: lvl2PyqImg
        }
    ];

    const handleStatementPartSelect = (part: 'part1' | 'part2') => {
        setStatementPart(part);
        setViewState('statement_subjects');
    }

    const statementSubjects = [
        {
            id: 'physics',
            name: 'Physics',
            title: 'Physics',
            description: statementPart === 'part1' ? 'Mechanics, Properties of Matter' : 'Electrodynamics, Optics, Modern Physics',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Easy' },
            tags: ['Assertion-Reason'],
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
            title: 'Chemistry',
            description: statementPart === 'part1' ? 'Physical Chemistry & Inorganic' : 'Organic Chemistry',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Easy' },
            tags: ['Statement Based'],
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
            title: 'Mathematics',
            description: statementPart === 'part1' ? 'Algebra & Trigonometry' : 'Calculus & Vectors',
            stats: { questions: '60 Qs', time: '5 Hrs', difficulty: 'Easy' },
            tags: ['Statement Based'],
            image: mathImg,
            classes: {
                badgeBg: 'bg-indigo-500',
                tagMain: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
                titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }
        }
    ];

    const handleStartStatementSet = (subjectId: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const routeId = `statement-${statementPart}-${subjectId}`;
        // Example: statement-part1-physics

        if (subscriptionType?.toLowerCase() === 'lite') {
            // For now redirecting to same condensed practice component, but with new ID
            // The component will fail to load if files don't exist, but routing is correct.
            navigate(`/question-set/${routeId}/practice`);
        } else if (isPaidUser) {
            navigate(`/question-set/${routeId}`);
        } else {
            setSelectedSubject(routeId);
            setShowSubscriptionModal(true);
        }
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
                            {viewState === 'dashboard' ? 'Explore Question Sets' :
                                viewState === 'statement_parts' ? 'Select Part' :
                                    'Select Subject'}
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal max-w-2xl mt-2">
                            {viewState === 'dashboard'
                                ? 'Browse our curated collection of high-yield question sets designed to maximize your prep efficiency.'
                                : viewState === 'statement_parts'
                                    ? 'Choose between Part 1 and Part 2 of the Statement Based Questions.'
                                    : 'Choose a subject to start practicing.'}
                        </p>
                    </div>

                    {/* Back Button */}
                    {viewState !== 'dashboard' && (
                        <div>
                            <button
                                onClick={() => {
                                    if (viewState === 'statement_subjects') {
                                        setViewState('statement_parts');
                                        setStatementPart(null);
                                    } else {
                                        setViewState('dashboard');
                                    }
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                {viewState === 'statement_subjects' ? 'Back to Parts' : 'Back to All Sets'}
                            </button>
                        </div>
                    )}

                    {/* Dashboard View */}
                    {viewState === 'dashboard' && (
                        <div className="grid grid-cols-1 gap-5">
                            {dashboardItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={!item.disabled ? item.action : undefined}
                                    className={`group relative flex flex-col md:flex-row bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300
                                        ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30'}
                                    `}
                                >
                                    {/* Image/Icon Section */}
                                    <div className="md:w-56 h-36 md:h-auto bg-black relative overflow-hidden shrink-0 flex items-center justify-center p-4">
                                        {item.image && (
                                            <div
                                                className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                                style={{ backgroundImage: `url("${item.image}")` }}
                                            ></div>
                                        )}

                                        {item.tags && (
                                            <div className="md:hidden absolute bottom-2 left-2">
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
                                                    {item.tags && item.tags.map((tag, idx) => (
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
                                                disabled={item.disabled}
                                                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98]
                                                    ${item.disabled
                                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                        : 'bg-primary text-white shadow-md shadow-blue-500/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-blue-500/30'
                                                    }`}
                                            >
                                                {item.disabled ? 'Coming Soon' : (item.id === 'condensed_main' ? 'Start Practice' : 'Start Practice')}
                                                {!item.disabled && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Statement Parts Selection View */}
                    {viewState === 'statement_parts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['part1', 'part2'].map((part) => (
                                <div
                                    key={part}
                                    onClick={() => handleStatementPartSelect(part as 'part1' | 'part2')}
                                    className="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30 transition-all duration-300"
                                >
                                    <div className="h-40 bg-gradient-to-br from-rose-500/20 to-purple-500/20 dark:from-rose-900/40 dark:to-purple-900/40 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        <h1 className="text-4xl font-black text-rose-500 dark:text-rose-400 z-10">
                                            {part === 'part1' ? 'PART 1' : 'PART 2'}
                                        </h1>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
                                            {part === 'part1' ? 'Core Concepts & Mechanics' : 'Advanced Application & Theory'}
                                        </h3>
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                                            {part === 'part1'
                                                ? 'Focus on fundamental assertion-reason questions covering mechanics, physical chemistry, and algebra basics.'
                                                : 'Challenge yourself with advanced topics including electrodynamics, organic chemistry mechanisms, and calculus.'}
                                        </p>
                                        <div className="flex items-center text-sm font-semibold text-primary">
                                            Select Part <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Statement Subjects Selection View */}
                    {viewState === 'statement_subjects' && (
                        <div className="grid grid-cols-1 gap-5">
                            {statementSubjects.map((subject) => (
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
                                            ></div>
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
                                                onClick={() => handleStartStatementSet(subject.id)}
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

                    {viewState === 'condensed_selection' && (
                        <div className="grid grid-cols-1 gap-5">
                            {condensedSubjects.map((subject) => (
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
                                            ></div>
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
                                                onClick={() => {
                                                    // Reusing handleStartSet logic inline or separate?
                                                    // Let's just define a quick handler here for Condensed since the original one was replaced/modified
                                                    if (!isAuthenticated) {
                                                        navigate('/login');
                                                    } else if (subscriptionType?.toLowerCase() === 'lite') {
                                                        navigate(`/question-set/${subject.id}/practice`);
                                                    } else if (isPaidUser) {
                                                        navigate(`/question-set/${subject.id}`);
                                                    } else {
                                                        setSelectedSubject(subject.id);
                                                        setShowSubscriptionModal(true);
                                                    }
                                                }}
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

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => {
                    setShowSubscriptionModal(false);
                    setSelectedSubject(null);
                }}
                onSubscribe={() => {
                    setShowSubscriptionModal(false);
                    navigate('/pricing');
                }}
            />
        </div>
    );
};

export default QuestionSet;

