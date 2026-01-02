import React from 'react';
import useCountUp from '../hooks/useCountUp';
import styles from './SubjectMastery.module.css';

interface SubjectColorClasses {
    bg: string;
    border: string;
    shadow: string;
    liquid1: string;
    liquid2: string;
}

interface SubjectProps {
    name: string;
    topic: string;
    percentage: number;
    colorClasses: SubjectColorClasses;
    sizeClass?: string;
}

const SubjectBubble: React.FC<SubjectProps> = ({ name, topic, percentage, colorClasses, sizeClass = "w-36 h-36" }) => {
    // Animate percentage from 0 to target over 2 seconds
    const animatedPercentage = useCountUp(percentage, 2000);

    return (
        <div className="flex flex-col items-center gap-4 group cursor-pointer">
            <div
                className={`relative ${sizeClass} rounded-full ${colorClasses.bg} ${colorClasses.border} border-4 overflow-hidden ${colorClasses.shadow} shadow-lg transition-transform group-hover:scale-105`}
            >
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl lg:text-2xl font-bold text-text-light dark:text-text-dark bg-surface-light/60 dark:bg-surface-dark/40 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/20">
                        {animatedPercentage}%
                    </span>
                </div>
                <div
                    className={`absolute bottom-0 left-[-10%] w-[120%] opacity-90 overflow-hidden ${styles['liquid-shape']} animate-wave-1 ${colorClasses.liquid1}`}
                    style={{ height: `${animatedPercentage}%`, transition: 'height 0.1s linear' }}
                >
                    <div className="bubble w-1 h-1 left-[20%]" style={{ animationDelay: '0s' }}></div>
                    <div className="bubble w-1.5 h-1.5 left-[50%]" style={{ animationDelay: '1s' }}></div>
                    <div className="bubble w-0.5 h-0.5 left-[70%]" style={{ animationDelay: '2.5s' }}></div>
                    <div className="bubble w-1.5 h-1.5 left-[35%]" style={{ animationDelay: '1.5s' }}></div>
                    <div className="bubble w-1 h-1 left-[80%]" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div
                    className={`absolute bottom-0 left-[-10%] w-[120%] opacity-60 overflow-hidden ${styles['liquid-shape']} animate-wave-2 ${colorClasses.liquid2}`}
                    style={{ height: `${animatedPercentage > 4 ? animatedPercentage - 4 : 0}%`, transition: 'height 0.1s linear' }}
                ></div>
            </div>
            <div className="text-center">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark">{name}</h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{topic}</p>
            </div>
        </div>
    );
};

export default SubjectBubble;
