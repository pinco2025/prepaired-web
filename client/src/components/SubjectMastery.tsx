import React from 'react';
import styles from './SubjectMastery.module.css';

const SubjectMastery: React.FC = () => {
    const subjects = [
        {
            name: 'Physics',
            topic: 'Electrostatics',
            percentage: 78,
            colorClasses: {
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                border: 'border-blue-100 dark:border-blue-800/30',
                shadow: 'shadow-blue-500/10',
                liquid1: 'bg-primary',
                liquid2: 'bg-blue-400',
            }
        },
        {
            name: 'Chemistry',
            topic: 'Chemical Bonding',
            percentage: 64,
            colorClasses: {
                bg: 'bg-green-50 dark:bg-green-900/10',
                border: 'border-green-100 dark:border-green-800/30',
                shadow: 'shadow-green-500/10',
                liquid1: 'bg-green-500',
                liquid2: 'bg-green-400',
            }
        },
        {
            name: 'Maths',
            topic: 'Calculus',
            percentage: 42,
            colorClasses: {
                bg: 'bg-orange-50 dark:bg-orange-900/10',
                border: 'border-orange-100 dark:border-orange-800/30',
                shadow: 'shadow-orange-500/10',
                liquid1: 'bg-orange-500',
                liquid2: 'bg-orange-400',
            }
        },
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Subject Mastery</h2>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:text-primary/80">
                    View Details
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 place-items-center relative z-10 flex-grow">
                {subjects.map((subject) => (
                    <div key={subject.name} className="flex flex-col items-center gap-4 group cursor-pointer">
                        <div
                            className={`relative w-36 h-36 rounded-full ${subject.colorClasses.bg} ${subject.colorClasses.border} border-4 overflow-hidden ${subject.colorClasses.shadow} shadow-lg transition-transform group-hover:scale-105`}
                        >
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-text-light dark:text-text-dark bg-surface-light/60 dark:bg-surface-dark/40 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/20">
                                    {subject.percentage}%
                                </span>
                            </div>
                            <div
                                className={`absolute bottom-0 left-[-10%] w-[120%] opacity-90 ${styles['liquid-shape']} ${styles['animate-wave-1']} ${subject.colorClasses.liquid1}`}
                                style={{ height: `${subject.percentage}%` }}
                            ></div>
                            <div
                                className={`absolute bottom-0 left-[-10%] w-[120%] opacity-60 ${styles['liquid-shape']} ${styles['animate-wave-2']} ${subject.colorClasses.liquid2}`}
                                style={{ height: `${subject.percentage > 4 ? subject.percentage - 4 : 0}%` }}
                            ></div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-text-light dark:text-text-dark">{subject.name}</h3>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{subject.topic}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectMastery;
