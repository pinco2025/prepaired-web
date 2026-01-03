import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, subscriptionType } = useAuth();
    const { initiatePayment, loading: paymentLoading, error: paymentError } = useRazorpay();
    const [darkMode, setDarkMode] = useState(false);

    // Check if user has paid subscription
    const isPaidUser = subscriptionType?.toLowerCase() === 'ipft-01-2026';

    // Initialize dark mode from localStorage
    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const isDark = !darkMode;
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    // Auto-scroll to pay section when logged-in free tier user visits the page
    useEffect(() => {
        if (user && !isPaidUser) {
            // Small delay to ensure page is rendered
            const timer = setTimeout(() => {
                const paySection = document.getElementById('pay-section');
                if (paySection) {
                    paySection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [user, isPaidUser]);

    // Scroll to pay section
    const scrollToPaySection = () => {
        const paySection = document.getElementById('pay-section');
        if (paySection) {
            paySection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle "Click to Pay" button - scroll to pay section or redirect to login
    const handleClickToPay = () => {
        if (!user) {
            navigate('/register');
        } else {
            scrollToPaySection();
        }
    };

    // Handle "Claim Offer Now" button - initiate payment
    const handleClaimOffer = async () => {
        if (!user) {
            navigate('/login', { state: { from: '/' } });
            return;
        }

        if (isPaidUser) {
            navigate('/dashboard');
            return;
        }

        // Initiate payment for free tier users
        await initiatePayment({
            userId: user.id,
            planType: 'IPFT-01-2026',
            amount: 49900, // ₹499 in paise
            userEmail: user.email,
            userName: user.user_metadata?.full_name || '',
        });
    };

    return (
        <div className="bg-background text-text-main h-screen flex flex-col pt-28 overflow-y-auto overflow-x-hidden no-scrollbar scroll-momentum">
            {/* Floating Dark Mode Toggle - Left of navbar */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-5 left-4 z-50 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-blue-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all hover:scale-110"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                <span className="material-symbols-outlined text-xl">
                    {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
            </button>

            <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto w-full max-w-4xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full py-2.5 pl-5 pr-2.5 flex items-center justify-between gap-4 transition-transform hover:scale-[1.005] duration-300">
                    <div className="flex items-center gap-3 shrink-0">
                        <img
                            alt="prepAIred logo"
                            className="h-8 w-8 object-contain"
                            src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
                        />
                        <span className="font-display font-bold text-lg tracking-tight text-slate-800 hidden sm:block">
                            prep<span className="text-primary">AI</span>red
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <p className="text-slate-600 font-medium whitespace-nowrap"><span className="text-primary font-bold">Limited Time Offer:</span> Get 20% off Premium!</p>
                    </div>
                    <button onClick={handleClickToPay} className="bg-gradient-to-r from-primary to-accent hover:to-primary text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-2 shrink-0 uppercase tracking-wide">
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
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:shadow-blue-600/30">
                                Try a Question Now
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-text-main hover:bg-gray-50 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-gray-400">play_circle</span>
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    <div className="relative mt-8 max-w-5xl mx-auto">
                        <div className="w-full aspect-video bg-white rounded-2xl border border-blue-100 shadow-[0_20px_50px_-12px_rgba(0,102,255,0.15)] overflow-hidden relative group cursor-pointer mb-16">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/50"></div>
                            <div className="absolute inset-0 bg-grid-pattern opacity-[0.6] mix-blend-multiply"></div>
                            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-[60px]"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="relative flex items-center justify-center size-24 bg-white rounded-full shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-all duration-300 border border-blue-50">
                                    <div className="absolute inset-0 rounded-full border border-blue-100 animate-[ping_2s_ease-in-out_infinite] opacity-20"></div>
                                    <span className="material-symbols-outlined text-4xl text-primary ml-1">play_arrow</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-white/90 via-white/50 to-transparent pt-12">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="w-[35%] h-full bg-primary rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 font-display">01:45 / 03:20</span>
                                </div>
                            </div>
                            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start">
                                <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-blue-50 shadow-sm">
                                    <span className="text-sm font-bold text-slate-700">Platform Walkthrough</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 items-start relative">
                            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Original Question</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">PYQ</span>
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">JEE Main 2023</span>
                                    </div>
                                </div>
                                <div className="relative mb-6 text-base text-gray-600 font-body leading-relaxed">
                                    <p className="mb-4">
                                        Q. A particle moves along a straight line such that its displacement at any time t is given by
                                        <span className="border-b-2 border-gray-300 pb-0.5">s = t³ - 6t² + 3t + 4</span> meters.
                                        The velocity when the <span className="border-b-2 border-gray-300 pb-0.5">acceleration is zero</span> is:
                                    </p>
                                </div>
                                <div className="relative mb-6">
                                    <div className="border-2 border-dashed border-red-200 bg-red-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[100px]">
                                        <span className="material-symbols-outlined text-red-300 text-3xl">visibility_off</span>
                                        <span className="text-xs font-bold uppercase tracking-wide text-red-400">No Context / Hint</span>
                                        <p className="text-[10px] text-red-300">Traditional questions often lack guidance on approach.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-gray-50 opacity-60">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-500">A</span>
                                        <span className="text-sm text-gray-500">3 m/s</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-gray-50 opacity-60">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-500">B</span>
                                        <span className="text-sm text-gray-500">-12 m/s</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-gray-50 opacity-60">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-500">C</span>
                                        <span className="text-sm text-gray-500">42 m/s</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-gray-50 opacity-60">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-500">D</span>
                                        <span className="text-sm text-gray-500">-9 m/s</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative bg-white rounded-2xl border-2 border-primary/20 shadow-xl shadow-blue-900/10 p-8 flex flex-col h-full ring-4 ring-blue-50/50">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50">
                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">auto_awesome</span>
                                        prepAIred Enhanced
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full shadow-sm">AI Enhanced</span>
                                    </div>
                                </div>
                                <div className="relative mb-6 text-base text-gray-800 font-body leading-relaxed font-medium">
                                    <p className="mb-4">
                                        Q. A particle moves along a straight line such that its displacement at any time t is given by
                                        <span className="bg-blue-50 border border-blue-200 rounded px-1 text-blue-700 font-mono text-sm mx-1">s = t³ - 6t² + 3t + 4</span> meters.
                                        The velocity when the <span className="decoration-green-500 decoration-2 underline underline-offset-4 bg-green-50 px-1 rounded">acceleration is zero</span> is:
                                    </p>
                                </div>
                                <div className="relative mb-6">
                                    <div className="border border-green-200 bg-green-50/40 rounded-lg p-5 flex gap-4 items-start relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400"></div>
                                        <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm border border-green-100 shrink-0">
                                            <span className="material-symbols-outlined text-xl">lightbulb</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] text-green-700 font-bold uppercase tracking-wide mb-1">Breakdown Hint</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                1. Find acceleration <span className="font-mono text-xs bg-white border border-gray-200 px-1 rounded mx-0.5">a(t) = d²s/dt²</span>.<br />
                                                2. Solve <span className="font-mono text-xs bg-white border border-gray-200 px-1 rounded mx-0.5">a(t) = 0</span> to find 't'.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-white opacity-40 grayscale">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-400">A</span>
                                        <span className="text-sm text-gray-400">3 m/s</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-white opacity-40 grayscale">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-400">B</span>
                                        <span className="text-sm text-gray-400">-12 m/s</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-white opacity-40 grayscale">
                                        <span className="size-5 flex items-center justify-center text-[10px] font-bold border border-gray-300 rounded-full text-gray-400">C</span>
                                        <span className="text-sm text-gray-400">42 m/s</span>
                                    </div>
                                    <div className="col-span-1 relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg opacity-30 blur-[2px]"></div>
                                        <div className="relative flex items-center justify-between p-3 rounded border-2 border-green-500 bg-green-50">
                                            <div className="flex items-center gap-2">
                                                <div className="size-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">-9 m/s</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-green-700 bg-white px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-tight">Correct</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 w-full max-w-5xl mx-auto px-4">
                            <div id="pay-section" className="relative overflow-hidden rounded-3xl bg-white border-2 border-blue-500/20 shadow-[0_30px_80px_-20px_rgba(0,102,255,0.2)] group hover:shadow-[0_40px_90px_-20px_rgba(0,102,255,0.3)] transition-all duration-500">
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
                                        <button
                                            onClick={handleClaimOffer}
                                            disabled={paymentLoading}
                                            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary text-white font-bold text-lg py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {paymentLoading ? 'Processing...' : 'Claim Offer Now'}
                                            {!paymentLoading && <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>}
                                        </button>
                                        {paymentError && (
                                            <p className="text-red-500 text-sm mt-2">{paymentError}</p>
                                        )}
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
                                                <p className="text-xs text-slate-400 mt-2 font-medium">Verified by IITians</p>
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
