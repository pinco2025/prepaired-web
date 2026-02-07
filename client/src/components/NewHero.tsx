
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewHero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full relative z-0 overflow-hidden flex flex-col items-center">
            {/* Background Gradients & Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-3xl opacity-50 dark:opacity-10"></div>
                {/* Background Dots Removed */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent pointer-events-none dark:via-blue-900/10"></div>
            </div>

            {/* Title Section */}
            <section className="w-full max-w-7xl mx-auto px-4 pt-16 pb-8 md:pb-12 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-grotesk font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                    Get your Target %ile with <br></br><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-blue drop-shadow-sm">prepAIred Lite</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-display">
                    Follow our fluid learning timeline designed by top IITians. Watch your progress flow from foundational concepts to exam-day strategy.
                </p>
            </section>

            {/* Unified Roadmap Section */}
            <section className="w-full max-w-6xl mx-auto px-4 pb-32 pt-10 relative min-h-[800px] md:min-h-[1400px]">

                {/* Floating Orbs (Desktop) */}
                <div className="absolute top-[10%] left-[10%] size-24 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-xl animate-float hidden md:block"></div>
                <div className="absolute top-[40%] right-[15%] size-32 rounded-full bg-gradient-to-bl from-neon-purple/20 to-transparent blur-xl animate-float-delayed hidden md:block"></div>

                {/* SVG Path Background */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <svg className="w-full h-full path-shadow" preserveAspectRatio="none" viewBox="0 0 1000 1600">
                        <defs>
                            <linearGradient id="neonStream" x1="0%" x2="0%" y1="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }}></stop>
                                <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }}></stop>
                                <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }}></stop>
                            </linearGradient>
                            <filter height="200%" id="glowLine" width="200%" x="-50%" y="-50%">
                                <feGaussianBlur result="blur" stdDeviation="4"></feGaussianBlur>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                            </filter>
                        </defs>

                        {/* Desktop Path: 4 distinct loops (Left, Right, Left, Right) */}
                        <g className="hidden md:block">
                            <path className="opacity-100" d="M 500 0 C 500 50, 200 50, 200 250 C 200 450, 800 450, 800 650 C 800 850, 200 850, 200 1050 C 200 1250, 800 1250, 800 1450 S 500 1600, 500 1600" fill="none" stroke="#94a3b8" strokeLinecap="round" strokeWidth="42"></path>
                            <path className="dark:stroke-slate-800" d="M 500 0 C 500 50, 200 50, 200 250 C 200 450, 800 450, 800 650 C 800 850, 200 850, 200 1050 C 200 1250, 800 1250, 800 1450 S 500 1600, 500 1600" fill="none" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="20"></path>
                            <path d="M 500 0 C 500 50, 200 50, 200 250 C 200 450, 800 450, 800 650 C 800 850, 200 850, 200 1050 C 200 1250, 800 1250, 800 1450 S 500 1600, 500 1600" fill="none" filter="url(#glowLine)" stroke="url(#neonStream)" strokeDasharray="25 35" strokeDashoffset="0" strokeLinecap="round" strokeWidth="8">
                                <animate attributeName="stroke-dashoffset" dur="6s" from="1000" repeatCount="indefinite" to="0"></animate>
                            </path>
                        </g>

                        {/* Mobile Path: Flowing Beam Vertical Line */}
                        <g className="md:hidden">
                            <path className="opacity-100" d="M 500 0 V 1600" fill="none" stroke="#94a3b8" strokeLinecap="round" strokeWidth="12"></path>
                            <path className="dark:stroke-slate-800" d="M 500 0 V 1600" fill="none" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="6"></path>
                            {/* Animated Flowing Beam: Longer dashes, Smoother flow */}
                            <path d="M 500 0 V 1600" fill="none" filter="url(#glowLine)" stroke="url(#neonStream)" strokeDasharray="200 400" strokeDashoffset="0" strokeLinecap="round" strokeWidth="4">
                                <animate attributeName="stroke-dashoffset" dur="4s" from="1200" repeatCount="indefinite" to="0"></animate>
                            </path>
                        </g>
                    </svg>
                </div>

                {/* Mobile Container: Flex Column / Desktop Container: Block (Absolute) */}
                <div className="flex flex-col items-center gap-16 md:block md:h-full">

                    {/* 1. Super 30 Question Set */}
                    <div className="relative w-full max-w-[200px] md:max-w-md md:absolute md:top-[13%] md:left-[15%] md:w-[35%] flex flex-col items-center justify-center md:items-stretch md:justify-end group z-10">
                        {/* Desktop Card */}
                        <div
                            onClick={() => navigate('/super30')}
                            className="hidden md:block relative backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-teal-500/30 hover:border-teal-500/60 shadow-lg hover:shadow-teal-500/20 p-5 rounded-2xl w-full cursor-pointer transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-symbols-outlined text-2xl">quiz</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Super 30 Set</h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wide border border-teal-200 dark:border-teal-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                    </span>
                                    Released
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-snug font-medium pl-[52px]">
                                High-yield JEE Mains problems. Curated by IIT alumni.
                            </p>
                        </div>

                        {/* Mobile Circular Node (Animate Float) */}
                        {/* Mobile Circular Node (Animate Float) */}
                        <div className="md:hidden flex flex-col items-center gap-3 cursor-pointer transition-all animate-float" onClick={() => navigate('/super30')}>
                            <div className="relative size-20 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-2 border-teal-500/40 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300 z-20">
                                <span className="material-symbols-outlined text-3xl text-teal-600 dark:text-teal-400">quiz</span>
                                <div className="absolute -top-1 -right-1 size-5 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight text-center bg-white/60 dark:bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/20 whitespace-nowrap z-20">
                                Super 30
                            </span>
                        </div>
                    </div>

                    {/* 2. Mock Tests */}
                    <div className="relative w-full max-w-[200px] md:max-w-md md:absolute md:top-[38%] md:right-[15%] md:w-[35%] flex flex-col items-center justify-center md:items-stretch md:justify-start group z-10">
                        {/* Desktop Card */}
                        <div
                            onClick={() => navigate('/tests')}
                            className="hidden md:block relative backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 shadow-lg hover:shadow-purple-500/20 p-5 rounded-2xl w-full cursor-pointer transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <span className="material-symbols-outlined text-2xl">timer</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Mock Tests</h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wide border border-purple-200 dark:border-purple-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                    </span>
                                    Released
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-snug font-medium pl-[52px]">
                                AI-proctored full-length exams. Real pressure, real results.
                            </p>
                        </div>

                        {/* Mobile Circular Node (Animate Float Delayed) */}
                        {/* Mobile Circular Node (Animate Float Delayed) */}
                        <div className="md:hidden flex flex-col items-center gap-3 cursor-pointer transition-all animate-float-delayed" onClick={() => navigate('/tests')}>
                            <div className="relative size-20 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-2 border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300 z-20">
                                <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">timer</span>
                                <div className="absolute -top-1 -left-1 size-5 bg-purple-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight text-center bg-white/60 dark:bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/20 whitespace-nowrap z-20">
                                Mock Tests
                            </span>
                        </div>
                    </div>

                    {/* 3. Advanced Modules */}
                    <div className="relative w-full max-w-[200px] md:max-w-md md:absolute md:top-[63%] md:left-[15%] md:w-[35%] flex flex-col items-center justify-center md:items-stretch md:justify-end group z-10">
                        {/* Desktop Card */}
                        <div className="hidden md:block relative backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl w-full opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">science</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-display">Advanced Modules</h3>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-500 text-sm leading-snug font-medium pl-[52px]">
                                Deep dives into Rotational Mechanics & Integral Calculus.
                            </p>
                        </div>

                        {/* Mobile Circular Node (Animate Float) */}
                        {/* Mobile Circular Node (Animate Float) */}
                        <div className="md:hidden flex flex-col items-center gap-3 opacity-90 transition-all animate-float">
                            <div className="relative size-20 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 z-20">
                                <span className="material-symbols-outlined text-3xl text-slate-500 dark:text-slate-400">science</span>
                                <div className="absolute -top-1 -right-1 size-5 bg-slate-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                            </div>
                            <span className="font-bold text-slate-600 dark:text-slate-400 text-sm tracking-tight text-center bg-white/60 dark:bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/20 whitespace-nowrap z-20">
                                Advanced
                            </span>
                        </div>
                    </div>

                    {/* 4. Strategy Sessions */}
                    <div className="relative w-full max-w-[200px] md:max-w-md md:absolute md:top-[88%] md:right-[15%] md:w-[35%] flex flex-col items-center justify-center md:items-stretch md:justify-start group z-10">
                        {/* Desktop Card */}
                        <div className="hidden md:block relative backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl w-full opacity-90 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">school</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-display">Strategy Sessions</h3>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-500 text-sm leading-snug font-medium pl-[52px]">
                                Live webinars on exam temperament & time management.
                            </p>
                        </div>

                        {/* Mobile Circular Node (Animate Float Delayed) */}
                        {/* Mobile Circular Node (Animate Float Delayed) */}
                        <div className="md:hidden flex flex-col items-center gap-3 opacity-90 transition-all animate-float-delayed">
                            <div className="relative size-20 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 z-20">
                                <span className="material-symbols-outlined text-3xl text-slate-500 dark:text-slate-400">school</span>
                                <div className="absolute -top-1 -left-1 size-5 bg-slate-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                            </div>
                            <span className="font-bold text-slate-600 dark:text-slate-400 text-sm tracking-tight text-center bg-white/60 dark:bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/20 whitespace-nowrap z-20">
                                Strategy
                            </span>
                        </div>
                    </div>

                </div>

            </section>
        </div>
    );
};

export default NewHero;
