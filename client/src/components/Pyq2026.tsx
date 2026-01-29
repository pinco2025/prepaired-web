import React from 'react';
import { useNavigate } from 'react-router-dom';

const Pyq2026: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            {/* Mobile header is handled by Sidebar component's mobile header or AppLayout, 
          but usually main content starts after that. 
          The user design has a header inside main, but our AppLayout layout handles sidebar separately.
          We will stick to the content inside main. */}

            <div className="flex-1 overflow-y-auto p-4 md:p-8 sidebar-scroll">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">2026 Previous Year Questions</h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Select your preferred attempt mode for JEE Main 2026 preparation.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-8">
                        {/* Subject-wise Attempt */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary">auto_stories</span>
                                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Subject-wise Attempt</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Physics */}
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/subjects/Physics/12')}>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-3xl">bolt</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-primary transition-colors">Physics</h3>
                                                <span className="text-sm font-medium text-text-secondary-light">42/120 Solved</span>
                                            </div>
                                            <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full" style={{ width: '35%' }}></div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>

                                {/* Chemistry */}
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/subjects/Chemistry/12')}>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-500">
                                            <span className="material-symbols-outlined text-3xl">science</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-green-500 transition-colors">Chemistry</h3>
                                                <span className="text-sm font-medium text-text-secondary-light">78/120 Solved</span>
                                            </div>
                                            <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>

                                {/* Mathematics */}
                                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/subjects/Mathematics/12')}>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-500">
                                            <span className="material-symbols-outlined text-3xl">calculate</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-orange-500 transition-colors">Mathematics</h3>
                                                <span className="text-sm font-medium text-text-secondary-light">15/120 Solved</span>
                                            </div>
                                            <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full overflow-hidden">
                                                <div className="bg-orange-500 h-full rounded-full" style={{ width: '12%' }}></div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shift-wise Attempt */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary">event_repeat</span>
                                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Shift-wise Attempt</h2>
                            </div>
                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full max-h-[500px]">
                                <div className="p-4 border-b border-border-light dark:border-border-dark bg-background-light/30 dark:bg-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary-light">Available Shift Papers</span>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-white/10 transition-colors">
                                            <span className="material-symbols-outlined text-sm">filter_list</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-3">
                                    {/* Shifts */}
                                    {[
                                        { label: "Jan 24 - Shift 1", info: "75 Questions • 180 Mins", status: "start" },
                                        { label: "Jan 24 - Shift 2", info: "75 Questions • 180 Mins", status: "start" },
                                        { label: "Jan 25 - Shift 1", info: "Completed • 215/300", status: "retake" },
                                        { label: "Jan 25 - Shift 2", info: "75 Questions • 180 Mins", status: "start" },
                                        { label: "Jan 27 - Shift 1", info: "75 Questions • 180 Mins", status: "start" },
                                        { label: "Jan 27 - Shift 2", info: "75 Questions • 180 Mins", status: "start" },
                                    ].map((shift, index) => (
                                        <div key={index} className={`flex items-center justify-between p-4 rounded-xl bg-background-light/50 dark:bg-white/5 border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-white/10 transition-colors ${shift.status === 'retake' ? 'opacity-75' : ''}`}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-text-light dark:text-text-dark">{shift.label}</span>
                                                <span className="text-xs text-text-secondary-light">{shift.info}</span>
                                            </div>
                                            {shift.status === 'start' ? (
                                                <button className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all">Start</button>
                                            ) : (
                                                <button className="px-5 py-2 border border-primary text-primary text-sm font-bold rounded-lg hover:bg-primary/5 transition-all">Retake</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pyq2026;
