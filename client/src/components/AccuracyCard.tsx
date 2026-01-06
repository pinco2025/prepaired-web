import React, { useState, useEffect } from 'react';

interface AccuracyCardProps {
    accuracy?: number;
}

const AccuracyCard: React.FC<AccuracyCardProps> = ({ accuracy: propAccuracy = 0 }) => {
    const finalAccuracy = propAccuracy;
    const [accuracy, setAccuracy] = useState(0);
    const radius = 60; // Adjusted for better fit
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (accuracy / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAccuracy(finalAccuracy);
        }, 300); // Delay start of animation
        return () => clearTimeout(timer);
    }, [finalAccuracy]);

    return (
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2 lg:mb-4 shrink-0">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1.5 sm:gap-2">
                    <span className="material-symbols-outlined text-base sm:text-lg">track_changes</span> Accuracy
                </h2>
                <span className="text-[10px] sm:text-xs font-medium text-green-500">+4% vs last week</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle
                            className="text-border-light dark:text-border-dark"
                            cx="80"
                            cy="80"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                        ></circle>
                        <circle
                            className="text-primary transition-all duration-1000 ease-out"
                            cx="80"
                            cy="80"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            strokeWidth="12"
                        ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-light dark:text-text-dark">{Math.round(accuracy)}%</span>
                        <span className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Overall</span>
                    </div>
                </div>
                <div className="w-full mt-1.5 sm:mt-2 lg:mt-4 flex justify-between px-2 sm:px-4 text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></div> Correct
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-border-light dark:bg-border-dark"></div> Incorrect
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccuracyCard;
