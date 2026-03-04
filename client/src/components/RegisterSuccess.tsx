import React from 'react';
import { useNavigate } from 'react-router-dom';

// Existing set images (used in QuestionSet.tsx)
import lvl2PyqImg from '../assets/cards/lvl-2-pyq.png';
import super30Img from '../assets/cards/super30.png';
import condensedImg from '../assets/cards/condensed-pyq.png';

const RegisterSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col">
            <header className="w-full bg-white dark:bg-[#141414] border-b border-primary/10 dark:border-white/10 px-6 py-4 fixed top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img alt="prepAIred logo" className="h-8 w-auto" src="/logo.png" />
                        <span className="text-secondary dark:text-primary font-bold text-xl tracking-tight">prepAIred</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 mt-16 relative">
                <div className="w-full bg-white dark:bg-[#141414] rounded-xl shadow-xl shadow-black/5 dark:shadow-black/40 p-8 md:p-12 text-center border border-primary/10 dark:border-white/10 max-w-4xl z-10 relative">
                    {/* Success Header — compact */}
                    <div className="mb-2 flex justify-center text-5xl">🎉</div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-secondary dark:text-slate-100 mb-3 leading-tight">
                        You're all set!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                        Login details & time-slot link will arrive <span className="font-semibold text-primary">24 hrs before</span> the test.
                    </p>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 rounded-full text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">home</span>
                            Take me to Home
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10"></div></div>
                        <div className="relative flex justify-center"><span className="bg-white dark:bg-[#141414] px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Explore Question Sets</span></div>
                    </div>

                    {/* Question Set Cards — prominent and visual-first */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div
                            className="bg-white dark:bg-slate-800/50 rounded-2xl border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
                            onClick={() => navigate('/pyq-2026')}
                        >
                            <div className="w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden relative">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url("${lvl2PyqImg}")` }}
                                ></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-base font-bold text-secondary dark:text-primary mb-1 group-hover:text-primary transition-colors">26-PYQ Set</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Curated previous-year questions.</p>
                            </div>
                        </div>

                        <div
                            className="bg-white dark:bg-slate-800/50 rounded-2xl border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
                            onClick={() => navigate('/super30')}
                        >
                            <div className="w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden relative">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url("${super30Img}")` }}
                                ></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-base font-bold text-secondary dark:text-primary mb-1 group-hover:text-primary transition-colors">Super 30 Set</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">30 essential concept-sharpening questions.</p>
                            </div>
                        </div>

                        <div
                            className="bg-white dark:bg-slate-800/50 rounded-2xl border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
                            onClick={() => navigate('/question-set')}
                        >
                            <div className="w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden relative">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url("${condensedImg}")` }}
                                ></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-base font-bold text-secondary dark:text-primary mb-1 group-hover:text-primary transition-colors">Condensed PYQ Set</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Quick-review past papers for efficient revision.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
                            <p className="text-sm">Need a hand? We're here for you.</p>
                            <div className="flex gap-6">
                                <a className="flex items-center gap-1 hover:text-primary transition-colors" href="mailto:support@prepaired.in">
                                    <span className="material-symbols-outlined text-base">mail</span> support@prepaired.in
                                </a>
                                <a className="flex items-center gap-1 hover:text-primary transition-colors" href="/">
                                    <span className="material-symbols-outlined text-base">help_center</span> Help Center
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-500 text-sm relative z-10">
                &copy; 2024 prepAIred All India Test Platform. All rights reserved.
            </footer>
        </div>
    );
};

export default RegisterSuccess;
