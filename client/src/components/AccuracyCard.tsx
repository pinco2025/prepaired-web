import React, { useState, useEffect } from 'react';

const AccuracyCard: React.FC = () => {
    const finalAccuracy = 75;
    const [accuracy, setAccuracy] = useState(0);
    const circumference = 2 * Math.PI * 70; // 2 * pi * radius
    const strokeDashoffset = circumference - (accuracy / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAccuracy(finalAccuracy);
        }, 300); // Delay start of animation
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">track_changes</span> Accuracy
                </h2>
                <span className="text-xs font-medium text-green-500">+4% vs last week</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle
                            className="text-border-light dark:text-border-dark"
                            cx="80"
                            cy="80"
                            fill="transparent"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                        ></circle>
                        <circle
                            className="text-primary transition-all duration-1000 ease-out"
                            cx="80"
                            cy="80"
                            fill="transparent"
                            r="70"
                            stroke="currentColor"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            strokeWidth="12"
                        ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-text-light dark:text-text-dark">{Math.round(accuracy)}%</span>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Overall</span>
                    </div>
                </div>
                <div className="w-full mt-4 flex justify-between px-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div> Correct
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-border-light dark:bg-border-dark"></div> Incorrect
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccuracyCard;
