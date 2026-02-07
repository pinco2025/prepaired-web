import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionModal from './SubscriptionModal';

// Subject Images
import phyImg from '../assets/cards/phy.png';
import chemImg from '../assets/cards/chem.png';
import mathImg from '../assets/cards/math.png';

const QuestionSet: React.FC = () => {
    const navigate = useNavigate();
    const { isPaidUser, isAuthenticated, subscriptionType } = useAuth();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [, setSelectedSubject] = useState<string | null>(null);

    const subjects = [
        {
            id: 'physics',
            name: 'Physics',
            icon: 'science',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',
            stats: { questions: 160 },
            badgeColor: 'bg-blue-500/80',
            comingSoon: false,
            image: phyImg,
        },
        {
            id: 'chemistry',
            name: 'Chemistry',
            icon: 'biotech',
            bgColor: 'bg-teal-50 dark:bg-teal-900/20',
            textColor: 'text-teal-600 dark:text-teal-400',
            hoverBorder: 'hover:border-teal-500 dark:hover:border-teal-400',
            stats: { questions: 175 },
            badgeColor: 'bg-teal-500/80',
            comingSoon: false,
            image: chemImg,
        },
        {
            id: 'mathematics',
            name: 'Mathematics',
            icon: 'calculate',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            textColor: 'text-indigo-600 dark:text-indigo-400',
            hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-400',
            stats: { questions: 140 },
            badge: null,
            badgeColor: '',
            comingSoon: false,
            image: mathImg,
        },
        {
            id: 'biology',
            name: 'Biology',
            description: 'Botany, Zoology, Genetics',
            icon: 'eco',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
            hoverBorder: '',
            stats: { concepts: 200, questions: 800 },
            badge: 'Coming Soon',
            badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
            comingSoon: true,
        },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            <div className="flex-1 overflow-y-auto p-3 md:p-8 sidebar-scroll">
                <div className="max-w-6xl mx-auto h-full flex flex-col">
                    {/* Page Heading */}
                    <div className="mb-6 md:mb-10">
                        <h1 className="text-2xl md:text-4xl font-black text-text-light dark:text-text-dark tracking-tight">
                            Condensed PYQs
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm md:text-base mt-1">
                            Maximum Result with Optimized Input
                        </p>
                    </div>

                    {/* Subject Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 pb-8">
                        {subjects.map((subject) => (
                            subject.comingSoon ? (
                                /* Coming Soon Card - Simple */
                                <div
                                    key={subject.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark relative"
                                >
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 min-h-[280px]">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-500">schedule</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                                            Coming Soon
                                        </h3>
                                    </div>
                                </div>
                            ) : (
                                /* Regular Subject Card */
                                <div
                                    key={subject.id}
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            navigate('/login'); // Redirect to login if user is a guest
                                        } else if (subscriptionType?.toLowerCase() === 'lite') {
                                            // Lite tier users go directly to condensed practice
                                            navigate(`/question-set/${subject.id}/practice`);
                                        } else if (isPaidUser) {
                                            navigate(`/question-set/${subject.id}`);
                                        } else {
                                            setSelectedSubject(subject.id);
                                            setShowSubscriptionModal(true);
                                        }
                                    }}
                                    className={`group flex flex-col overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark ${subject.hoverBorder} transition-all duration-300 cursor-pointer`}
                                >
                                    {/* Card Header with gradient and image */}
                                    {/* Card Header with gradient and image */}
                                    <div className="h-32 md:h-40 w-full relative bg-gray-950 overflow-hidden">
                                        {/* Subject Image - Keep dark/black in both modes */}
                                        {subject.image && (
                                            <>
                                                <img
                                                    src={subject.image}
                                                    alt={subject.name}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 to-transparent"></div>
                                            </>
                                        )}
                                        {/* Gradient Overlay for text readability - always dark */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
                                        {subject.badge && (
                                            <div className="absolute bottom-3 left-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full ${subject.badgeColor} text-white text-xs font-bold backdrop-blur-sm`}>
                                                    {subject.badge}
                                                </span>
                                            </div>
                                        )}
                                        {/* Centered Icon - Only show if no image */}
                                        {!subject.image && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                                                <span className={`material-symbols-outlined text-8xl ${subject.textColor}`}>{subject.icon}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex flex-1 flex-col p-5 md:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex flex-col">
                                                <h3 className="text-lg md:text-xl font-bold text-text-light dark:text-text-dark group-hover:text-primary transition-colors">
                                                    {subject.name}
                                                </h3>
                                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                                                    {subject.description}
                                                </p>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full ${subject.bgColor} flex items-center justify-center ${subject.textColor}`}>
                                                <span className="material-symbols-outlined">{subject.icon}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex flex-col gap-4">
                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base">quiz</span>
                                                    <span>{subject.stats.questions} Questions</span>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 md:py-3 text-white shadow-sm hover:bg-primary-dark transition-colors font-medium group-hover:shadow-md">
                                                <span>Start Practicing</span>
                                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                </div>
            </div>

            {/* Subscription Modal for Free Users */}
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
