import React from 'react';
import { useNavigate } from 'react-router-dom';

const Pyq2026: React.FC = () => {
    const navigate = useNavigate();

    const availableShifts = [
        '21st January Morning Shift', '21st January Evening Shift',
        '22nd January Morning Shift', '22nd January Evening Shift',
        '23rd January Morning Shift', '23rd January Evening Shift',
        '24th January Morning Shift', '24th January Evening Shift',
        '28th January Morning Shift', '28th January Evening Shift'
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            {/* Mobile header is handled by Sidebar component's mobile header or AppLayout, 
          but usually main content starts after that. 
          The user design has a header inside main, but our AppLayout layout handles sidebar separately.
          We will stick to the content inside main. */}

            <div className="flex-1 overflow-y-auto p-3 md:p-8 sidebar-scroll">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-5 md:mb-8">
                        <h1 className="text-2xl md:text-4xl font-black text-text-light dark:text-text-dark tracking-tight">2026 Previous Year Questions</h1>
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
                                <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate('/pyq-2026/Chemistry')}>
                                    <div className="flex items-center gap-3 md:gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-500">
                                            <span className="material-symbols-outlined text-3xl">science</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark group-hover:text-green-500 transition-colors">Chemistry</h3>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableShifts.map((shift, idx) => (
                                    <div key={idx}
                                        onClick={() => navigate(`/pyq-2026/shift/practice/${encodeURIComponent(shift)}`)}
                                        className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary transition-all cursor-pointer group flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">event</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-text-light dark:text-text-dark group-hover:text-primary transition-colors line-clamp-2">{shift}</h3>
                                        </div>
                                        <span className="material-symbols-outlined text-text-secondary-light group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pyq2026;
