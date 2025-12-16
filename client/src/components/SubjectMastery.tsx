import React from 'react';
import SubjectBubble from './SubjectBubble';

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
                    <SubjectBubble key={subject.name} {...subject} />
                ))}
            </div>
        </div>
    );
};

export default SubjectMastery;
