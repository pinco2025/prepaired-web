import React from 'react';

const FocusAreas: React.FC = () => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark mb-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Focus Areas &amp; Weaknesses</h2>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">AI-driven insights on areas needing improvement.</p>
                </div>
                <button className="text-sm text-primary font-medium hover:underline">View Full Analysis</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">priority_high</span> Critical Chapters
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
                            <div>
                                <div className="text-sm font-bold text-text-light dark:text-text-dark">Thermodynamics</div>
                                <div className="text-xs text-red-500 font-medium">Physics • High Weightage</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">32%</div>
                                <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">Accuracy</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-orange-100 dark:border-orange-900/20 bg-orange-50/50 dark:bg-orange-900/10">
                            <div>
                                <div className="text-sm font-bold text-text-light dark:text-text-dark">Integration</div>
                                <div className="text-xs text-orange-500 font-medium">Maths • Conceptual</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">45%</div>
                                <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">psychology_alt</span> Concept Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            Rotational Inertia
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            P-Block Reactions
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            Complex Roots
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            Doppler Effect
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            Isomerism
                        </span>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark">
                        <div className="flex items-start gap-3">
                            <span className="material-icons-outlined text-primary mt-0.5 text-lg">lightbulb</span>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                <span className="font-semibold text-text-light dark:text-text-dark">Tip:</span> Reviewing "Rotational Inertia" could improve your Physics score by approx. 15 points in the next mock.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">insights</span> Recent Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-center">
                            <div className="text-2xl font-bold text-primary mb-1">145</div>
                            <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold">Questions (7d)</div>
                            <div className="text-xs text-green-600 flex items-center justify-center mt-1"><span className="material-icons-outlined text-sm">arrow_upward</span> 12%</div>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">68%</div>
                            <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold">Mock Accuracy</div>
                            <div className="text-xs text-red-500 flex items-center justify-center mt-1"><span className="material-icons-outlined text-sm">arrow_downward</span> 2%</div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Mock Trend (Last 5)</span>
                        </div>
                        <div className="flex items-end justify-between h-16 gap-2">
                            <div className="w-full bg-border-light dark:bg-border-dark rounded-t-sm relative group" style={{ height: '40%' }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">120</div>
                            </div>
                            <div className="w-full bg-border-light dark:bg-border-dark rounded-t-sm relative group" style={{ height: '55%' }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">145</div>
                            </div>
                            <div className="w-full bg-primary/40 rounded-t-sm relative group" style={{ height: '45%' }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">132</div>
                            </div>
                            <div className="w-full bg-primary/70 rounded-t-sm relative group" style={{ height: '70%' }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">180</div>
                            </div>
                            <div className="w-full bg-primary rounded-t-sm relative group" style={{ height: '65%' }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-surface-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">175</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusAreas;
