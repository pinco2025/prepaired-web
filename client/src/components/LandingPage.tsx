import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background text-text-main overflow-x-hidden min-h-screen flex flex-col pt-28">
            <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto w-full max-w-4xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full py-2.5 pl-5 pr-2.5 flex items-center justify-between gap-4 transition-transform hover:scale-[1.005] duration-300">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="size-8 flex items-center justify-center bg-primary text-white rounded-full shadow-md shadow-blue-500/20">
                            <span className="material-symbols-outlined text-lg">psychology</span>
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight text-slate-800 hidden sm:block">prepAIred</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <p className="text-slate-600 font-medium whitespace-nowrap"><span className="text-primary font-bold">Limited Time Offer:</span> Get 20% off Premium!</p>
                    </div>
                    <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-accent hover:to-primary text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2 shrink-0 uppercase tracking-wide">
                        Click to Pay
                        <span className="material-symbols-outlined text-sm">credit_card</span>
                    </button>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center relative mt-8">
                <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none"></div>
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
                <div className="container mx-auto px-4 py-16 max-w-7xl z-10">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            AI-Powered Learning
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-text-main tracking-tight">
                            Stop Guessing. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Start Understanding.</span>
                        </h1>
                        <p className="text-text-muted text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto">
                            Experience the difference between traditional rote memorization and AI-powered adaptive learning designed specifically for JEE and NEET aspirants.
                        </p>
                    </div>

                    <div className="relative mt-8 max-w-5xl mx-auto">
                        <div className="mt-16 w-full max-w-5xl mx-auto px-4">
                            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-blue-500/20 shadow-[0_30px_80px_-20px_rgba(0,102,255,0.2)] group hover:shadow-[0_40px_90px_-20px_rgba(0,102,255,0.3)] transition-all duration-500">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-[150px] -z-0 opacity-40"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-tr-[100px] -z-0"></div>
                                <div className="absolute right-20 top-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex-1 p-8 md:p-12 z-10 flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-primary-dark text-xs font-bold uppercase tracking-wider w-fit mb-6 shadow-sm">
                                            <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                            Launch Offer
                                        </div>
                                        <h3 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 leading-[1.1]">
                                            10 <span className="text-primary">Inspired PrepAIred</span><br />Full Tests
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                                            <div className="flex flex-col">
                                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">Total Value</p>
                                                <span className="text-2xl text-slate-400 line-through decoration-2 decoration-red-400 font-medium">₹2499</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">Your Price</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">₹499</span>
                                                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200 mb-2">80% OFF</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-10">
                                            <li className="flex items-center gap-3 text-base font-medium text-slate-700">
                                                <div className="size-6 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-green-800 text-sm font-bold">check</span>
                                                </div>
                                                Exact JEE Mains Difficulty Level
                                            </li>
                                            <li className="flex items-center gap-3 text-base font-medium text-slate-700">
                                                <div className="size-6 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-green-800 text-sm font-bold">check</span>
                                                </div>
                                                Detailed Performance Analytics
                                            </li>
                                        </ul>
                                        <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary text-white font-bold text-lg py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn">
                                            Claim Offer Now
                                            <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                                        </button>
                                    </div>
                                    <div className="w-full md:w-[40%] relative min-h-[350px] md:min-h-[500px] flex items-center justify-center p-8 overflow-visible">
                                        <div className="relative w-64 aspect-[3/4] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 z-20 flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 hover:scale-105 rotate-[-3deg] group-hover:rotate-0">
                                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl z-0"></div>
                                            <div className="relative z-10 mb-6">
                                                <div className="text-9xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-600 font-display leading-none tracking-tighter drop-shadow-sm">
                                                    10
                                                </div>
                                                <div className="text-6xl font-serif font-black text-slate-900 font-display tracking-tight -mt-4">
                                                    IPFT
                                                </div>
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4"></div>
                                                <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Full Syllabus Tests</p>
                                                <p className="text-xs text-slate-400 mt-2 font-medium">Verified by Top Educators</p>
                                            </div>
                                            <div className="absolute -top-6 -right-6 size-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-blue-400/30 animate-pulse-slow border-4 border-white z-30">
                                                <span className="text-white text-xs font-black text-center leading-tight uppercase transform -rotate-12 [text-shadow:-0.5px_-0.5px_0_#000,0.5px_-0.5px_0_#000,-0.5px_0.5px_0_#000,0.5px_0.5px_0_#000]">Best<br />Seller</span>
                                            </div>
                                        </div>
                                        <div className="absolute z-10 w-64 aspect-[3/4] bg-slate-50 rounded-2xl border border-slate-200 rotate-[6deg] scale-95 translate-x-4 shadow-lg"></div>
                                        <div className="absolute z-0 w-64 aspect-[3/4] bg-slate-100 rounded-2xl border border-slate-200 rotate-[12deg] scale-90 translate-x-8 shadow-md opacity-60"></div>
                                        <div className="absolute bottom-10 left-10 text-primary/10 animate-pulse">
                                            <span className="material-symbols-outlined text-8xl">auto_awesome</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-gray-200 pt-12 max-w-5xl w-full mx-auto px-4">
                            <div className="flex flex-col items-center text-center">
                                <span className="text-3xl font-display font-bold text-text-main mb-1">50k+</span>
                                <span className="text-sm text-text-muted font-medium">Questions Practiced</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-3xl font-display font-bold text-text-main mb-1">98%</span>
                                <span className="text-sm text-text-muted font-medium">Concept Retention</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-3xl font-display font-bold text-text-main mb-1">24/7</span>
                                <span className="text-sm text-text-muted font-medium">AI Tutor Availability</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-3xl font-display font-bold text-text-main mb-1">10k+</span>
                                <span className="text-sm text-text-muted font-medium">Active Students</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
