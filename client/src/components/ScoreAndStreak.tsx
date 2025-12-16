import React from 'react';
import useCountUp from '../hooks/useCountUp';

const ScoreAndStreak: React.FC = () => {
    const score = useCountUp(842, 2500);
    const scorePercentage = (score / 1000) * 100;

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur-md animate-pulse-glow"></div>
                <div className="relative flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-xl border border-white/50 dark:border-white/10 h-full">
                    <div className="w-full flex justify-between items-center mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">prepAIred Score</p>
                        <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm">
                            <span className="material-icons-outlined text-sm">trending_up</span>
                            <span className="text-xs font-extrabold">Top 5%</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-bold text-primary tracking-tighter leading-none" style={{ textShadow: '0 4px 20px rgba(0, 102, 255, 0.2)' }}>
                            {score}
                        </div>
                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">/ 1000</span>
                    </div>
                    <div className="w-full h-1 bg-border-light dark:bg-border-dark mt-4 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
                            style={{ width: `${scorePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark relative overflow-hidden group flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Current Streak</h2>
                        <div className="flex items-center text-orange-500">
                            <span className="material-symbols-outlined text-2xl fill-1">local_fire_department</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-bold text-text-light dark:text-text-dark">12</span>
                        <span className="text-base font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">days</span>
                    </div>
                    <div className="flex justify-between items-center w-full gap-1">
                        <div className="h-2 flex-1 rounded-full bg-primary/20" title="Mon"></div>
                        <div className="h-2 flex-1 rounded-full bg-primary/40" title="Tue"></div>
                        <div className="h-2 flex-1 rounded-full bg-primary/60" title="Wed"></div>
                        <div className="h-2 flex-1 rounded-full bg-primary/80" title="Thu"></div>
                        <div className="h-2 flex-1 rounded-full bg-primary" title="Fri"></div>
                        <div className="h-2 flex-1 rounded-full bg-border-light dark:bg-border-dark" title="Sat"></div>
                        <div className="h-2 flex-1 rounded-full bg-border-light dark:bg-border-dark" title="Sun"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreAndStreak;
