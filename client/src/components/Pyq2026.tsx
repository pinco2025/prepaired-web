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

            <div className="flex-1 overflow-y-auto p-3 md:p-8 sidebar-scroll">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-5 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">2026 Previous Year Questions</h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Select your preferred attempt mode for JEE Main 2026 preparation.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 flex-1 pb-8">
                        {/* Subject-wise Attempt */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary">auto_stories</span>
                                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Subject-wise Attempt</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Physics */}
                                <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/pyq-2026/Physics')}>
                                    <div className="flex items-center gap-3 md:gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-3xl">bolt</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-primary transition-colors">Physics</h3>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>

                                {/* Chemistry */}
                                <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark relative overflow-hidden cursor-not-allowed group">
                                    <div className="absolute inset-0 z-20 bg-background-light/60 dark:bg-background-dark/60 flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-300">
                                        <div className="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            Coming Soon
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-5 relative z-10 opacity-40 grayscale filter">
                                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-500">
                                            <span className="material-symbols-outlined text-3xl">science</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark">Chemistry</h3>
                                                <span className="text-sm font-medium text-text-secondary-light">78/120 Solved</span>
                                            </div>
                                            <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light">chevron_right</span>
                                    </div>
                                </div>

                                {/* Mathematics */}
                                <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/pyq-2026/Mathematics')}>
                                    <div className="flex items-center gap-3 md:gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-500">
                                            <span className="material-symbols-outlined text-3xl">calculate</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-orange-500 transition-colors">Mathematics</h3>
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
                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full min-h-[400px] items-center justify-center relative p-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 pointer-events-none"></div>
                                <div className="z-10 flex flex-col items-center text-center max-w-sm mx-auto">
                                    <div className="w-20 h-20 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg flex items-center justify-center mb-6 text-primary border border-border-light dark:border-border-dark transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-4xl">event_upcoming</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-3">Shift-Wise Papers Coming Soon</h3>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                        We are currently compiling and verifying the 2026 shift-wise papers. They will be available for practice very soon.
                                    </p>
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
