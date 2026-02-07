import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import VideoPlayer from './VideoPlayer';

// Dynamic equations for the cycling effect - Inspired PrepAIred Questions (IPQs)
// Based on the PYQ: s = t³ - 6t² + 3t + 4, find velocity when a = 0

const LandingPageArchivedContent: React.FC = () => {
    usePageTitle('AI-Powered JEE & NEET Prep');
    const navigate = useNavigate();
    const { user, subscriptionType } = useAuth();
    const [darkMode, setDarkMode] = useState(true);

    const [isVisible, setIsVisible] = useState(false);
    const comparisonRef = useRef<HTMLDivElement>(null);

    // Header taglines for typewriter effect
    const headerTaglines = [
        'Crafted by IITians',
        'AI-powered analytics',
        'JEE Mains difficulty',
        'Personalized insights',
    ];
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [displayedTagline, setDisplayedTagline] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    // Typewriter effect for header tagline
    useEffect(() => {
        const currentTagline = headerTaglines[taglineIndex];
        let timeout: NodeJS.Timeout;

        if (isTyping) {
            if (displayedTagline.length < currentTagline.length) {
                timeout = setTimeout(() => {
                    setDisplayedTagline(currentTagline.slice(0, displayedTagline.length + 1));
                }, 80);
            } else {
                // Pause before erasing
                timeout = setTimeout(() => setIsTyping(false), 2000);
            }
        } else {
            if (displayedTagline.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayedTagline(displayedTagline.slice(0, -1));
                }, 40);
            } else {
                // Move to next tagline
                setTaglineIndex((prev) => (prev + 1) % headerTaglines.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayedTagline, isTyping, taglineIndex]);

    // Cycle through equations

    // State for floating CTA button visibility
    const [showFloatingCTA, setShowFloatingCTA] = useState(false);

    // Section IDs for step-by-step navigation
    const sectionIds = ['landing-scroll-container', 'question-section', 'pay-section'];

    // Intersection observer for scroll animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (comparisonRef.current) {
            observer.observe(comparisonRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Track scroll position to show/hide floating CTA (throttled for performance)
    useEffect(() => {
        const container = document.getElementById('landing-scroll-container');
        if (!container) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const paySection = document.getElementById('pay-section');
                    const scrollTop = container.scrollTop;
                    const viewportHeight = container.clientHeight;

                    // Check if we're at/near the payment section
                    let isNearPaySection = false;
                    if (paySection) {
                        const paySectionTop = paySection.offsetTop;
                        // Hide CTA when the pay section is mostly in view (within 150px of top)
                        isNearPaySection = scrollTop + viewportHeight * 0.5 >= paySectionTop;
                    }

                    // Show CTA only when scrolled past 200px AND not near payment section
                    setShowFloatingCTA(scrollTop > 200 && !isNearPaySection);
                    ticking = false;
                });
                ticking = true;
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to next section
    const scrollToNextSection = () => {
        const container = document.getElementById('landing-scroll-container');
        if (!container) return;

        const currentScroll = container.scrollTop;

        // Find the next section to scroll to
        for (const sectionId of sectionIds) {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - 120; // Account for header
                if (sectionTop > currentScroll + 50) {
                    container.scrollTo({ top: sectionTop, behavior: 'smooth' });
                    return;
                }
            }
        }

        // If no next section, scroll to bottom
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    // Scroll to previous section
    const scrollToPrevSection = () => {
        const container = document.getElementById('landing-scroll-container');
        if (!container) return;

        const currentScroll = container.scrollTop;

        // Find the previous section to scroll to (reverse order)
        for (let i = sectionIds.length - 1; i >= 0; i--) {
            const section = document.getElementById(sectionIds[i]);
            if (section) {
                const sectionTop = section.offsetTop - 120; // Account for header
                if (sectionTop < currentScroll - 50) {
                    container.scrollTo({ top: Math.max(0, sectionTop), behavior: 'smooth' });
                    return;
                }
            }
        }

        // If no previous section, scroll to top
        container.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Check if user has paid subscription
    const isPaidUser = subscriptionType?.toLowerCase() === 'ipft-01-2026';

    // Initialize dark mode from localStorage (default to dark if not set)
    useEffect(() => {
        const storedPreference = localStorage.getItem('darkMode');
        // Default to dark mode if no preference is stored
        const isDark = storedPreference === null ? true : storedPreference === 'true';
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

    // Handle "Claim Offer Now" button - redirect to login or dashboard
    const handleClaimOffer = () => {
        if (!user) {
            navigate('/login', { state: { from: '/super30' } });
            return;
        }
        // Navigate to Super 30 page for all users
        navigate('/super30');
    };

    return (
        <>
            <div id="landing-scroll-container" className="bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark text-text-light dark:text-text-dark h-screen flex flex-col pt-20 md:pt-28 overflow-y-auto overflow-x-hidden no-scrollbar scroll-momentum scroll-smooth transition-colors duration-300">
                <header className="fixed top-2 md:top-4 left-0 right-0 z-50 px-2 md:px-4 flex justify-center w-full pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full py-2 md:py-2.5 pl-3 md:pl-5 pr-2 md:pr-2.5 flex items-center justify-between gap-2 md:gap-4 transition-transform hover:scale-[1.005] duration-300">
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <img
                                alt="prepAIred logo"
                                className="h-7 w-7 md:h-8 md:w-8 object-contain"
                                src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
                            />
                            <span className="font-display font-bold text-lg tracking-tight text-slate-800 dark:text-white hidden sm:block">
                                prep<span className="text-primary">AI</span>red
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm mx-auto min-w-[200px] justify-center">
                            <span className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 font-medium">
                                {displayedTagline}<span className="animate-pulse text-primary">|</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 opacity-60 hover:opacity-100"
                                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {darkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            <button onClick={handleClickToPay} className="bg-gradient-to-r from-primary to-accent hover:to-primary text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-3 md:px-5 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-1 md:gap-1.5 shrink-0 uppercase tracking-wide">
                                Start Now
                                <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow flex flex-col items-center relative mt-8">
                    <div className="absolute inset-0 bg-grid-pattern opacity-100 dark:opacity-30 pointer-events-none"></div>
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl z-10">
                        <div className="text-center mb-10 md:mb-16 max-w-5xl mx-auto relative">
                            {/* Energy Effect Background */}
                            <div className="absolute inset-0 -z-10 overflow-visible">
                                {/* Animated glowing orbs */}
                                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                                <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-cyan-500/15 rounded-full blur-[90px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                                {/* Animated border glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 rounded-3xl blur-xl animate-pulse-slow"></div>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-5xl md:text-7xl font-grotesk font-black leading-[1.05] mb-8 tracking-tight relative">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066ff] via-[#0066ff] to-[#38b6ff]">
                                    SUPER 30
                                </span>
                                <br />
                                <span className="text-4xl md:text-5xl uppercase font-bold text-slate-700 dark:text-slate-300 tracking-tighter mt-0.5 md:mt-1 block">
                                    Question Set for JEE Mains
                                </span>
                                <span className="text-3xl md:text-4xl uppercase font-medium text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 block">
                                    Second Session
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg lg:text-xl font-medium leading-relaxed mb-8 md:mb-12 max-w-3xl mx-auto px-4">
                                Master high-yield concepts with our AI-curated test series,
                                <br className="hidden sm:block" />
                                specifically engineered for JEE Mains excellence.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                                <button
                                    onClick={() => document.getElementById('question-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-base md:text-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
                                >
                                    Increase My Percentile
                                    <span className="material-symbols-outlined text-xl">arrow_downward</span>
                                </button>
                            </div>
                        </div>

                        {/* --- Video Section --- */}
                        <div id="question-section" ref={comparisonRef} className="max-w-6xl mx-auto px-2 md:px-4 mb-8 scroll-mt-24">
                            {/* Section Header */}
                            <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <h2 className="text-2xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                                    See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">Difference</span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-2xl mx-auto">
                                    Why solve PYQs, when you can have <span className="font-semibold text-slate-700 dark:text-slate-200">a better version - IPQs</span>
                                </p>
                            </div>

                            {/* Video Container */}
                            <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/40 border-2 border-primary/20 dark:border-primary/30">
                                    <VideoPlayer />
                                </div>
                            </div>
                        </div>



                        <div className="mt-16 w-full max-w-5xl mx-auto px-4">
                            <div id="pay-section" className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500/20 dark:border-blue-500/30 shadow-[0_30px_80px_-20px_rgba(0,102,255,0.2)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] group hover:shadow-[0_40px_90px_-20px_rgba(0,102,255,0.3)] transition-all duration-500">
                                {/* Background decorations */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-bl-[150px] -z-0 opacity-40"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 dark:bg-accent/5 rounded-tr-[100px] -z-0"></div>
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    {/* Left Content */}
                                    <div className="flex-1 p-8 md:p-12 z-10 flex flex-col justify-center">
                                        {/* Badge */}


                                        {/* Heading */}
                                        <div className="mb-10 relative">
                                            <h3 className="font-grotesk font-black leading-[1.1] text-primary-dark">
                                                <span className="text-3xl md:text-5xl block mb-2 text-slate-700 dark:text-slate-300">
                                                    Get the <span className="text-blue-500 dark:text-blue-400 inline-block">Super 30</span>
                                                </span>
                                                <span className="text-4xl md:text-6xl block mb-6 text-blue-600 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:bg-clip-text pb-2">
                                                    Question Set FREE
                                                </span>
                                            </h3>
                                        </div>

                                        {/* Feature List */}
                                        <ul className="space-y-4 mb-10">
                                            <li className="flex items-center gap-3 text-lg font-bold text-slate-700 dark:text-slate-300">
                                                <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0 shadow-sm">
                                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg font-bold">check_circle</span>
                                                </div>
                                                <span>Instant Access: <strong className="text-blue-600 dark:text-blue-400">Free Super 30 Question Set</strong></span>
                                            </li>
                                            <li className="flex items-center gap-3 text-lg font-bold text-slate-700 dark:text-slate-300">
                                                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
                                                    <span className="material-symbols-outlined text-primary dark:text-blue-400 text-lg font-bold">auto_awesome</span>
                                                </div>
                                                <span>Curated by IITians</span>
                                            </li>
                                        </ul>
                                        {/* CTA Button */}
                                        {isPaidUser ? (
                                            <button
                                                onClick={() => navigate('/dashboard')}
                                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-black text-xl py-5 px-12 rounded-2xl transition-all duration-300 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1 flex items-center justify-center gap-3 group relative overflow-hidden"
                                            >
                                                <span className="relative">Go to Dashboard</span>
                                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 relative font-bold">arrow_forward</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleClaimOffer}
                                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-black text-xl py-5 px-12 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 flex items-center justify-center gap-3 group relative overflow-hidden"
                                            >
                                                <span className="relative">Claim Free Bonus Now</span>
                                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 relative font-bold">arrow_forward</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Content - Card Mockup */}
                                    <div className="w-full md:w-[45%] relative min-h-[350px] md:min-h-[500px] flex items-center justify-center p-8">
                                        <div className="relative w-80 aspect-[4/5] bg-white dark:bg-slate-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-slate-100 dark:border-slate-700 z-20 flex flex-col items-center justify-center p-8 text-center rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                                            {/* Blue accent stripe on top */}
                                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-primary dark:to-accent"></div>

                                            {/* Card Content */}
                                            <div className="flex flex-col items-center justify-center">
                                                {/* FREE label */}
                                                <div className="text-[32px] font-black text-blue-600 dark:text-blue-400 font-grotesk tracking-tight leading-tight mb-2">FREE</div>

                                                {/* SUPER text */}
                                                <div className="text-[80px] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 font-grotesk tracking-tighter select-none">SUPER</div>

                                                {/* 30 text */}
                                                <div className="text-[100px] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 font-grotesk tracking-tighter select-none">30</div>

                                                {/* Divider */}
                                                <div className="w-16 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full my-6"></div>

                                                {/* Description */}
                                                <p className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                                    IITian Curated<br />High-Yield Set
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24 border-t border-gray-200 dark:border-slate-800 pt-8 md:pt-12 max-w-5xl w-full mx-auto px-4">
                            <div className="flex flex-col items-center text-center">
                                <span className="text-2xl md:text-3xl font-display font-bold text-text-light dark:text-text-dark mb-1">50k+</span>
                                <span className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">Questions Trained on</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-2xl md:text-3xl font-display font-bold text-text-light dark:text-text-dark mb-1">98%</span>
                                <span className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">Concept Retention in IPQs</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-2xl md:text-3xl font-display font-bold text-text-light dark:text-text-dark mb-1">24/7</span>
                                <span className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">Test Availability</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-2xl md:text-3xl font-display font-bold text-text-light dark:text-text-dark mb-1">IITians</span>
                                <span className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">Questions verified by Subject Experts</span>
                            </div>
                        </div>

                    </div >
                </main >

                {/* Floating Scroll Navigation Buttons */}
                < div className="fixed right-3 md:right-6 bottom-3 md:bottom-6 z-50 flex flex-col gap-1.5 md:gap-2" >
                    <button
                        onClick={scrollToPrevSection}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
                        title="Previous section"
                    >
                        <span className="material-symbols-outlined">keyboard_arrow_up</span>
                    </button>
                    <button
                        onClick={scrollToNextSection}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
                        title="Next section"
                    >
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </button>
                </div >

                {/* Floating CTA Button - Appears when scrolled down */}
                < button
                    onClick={scrollToPaySection}
                    className={`fixed left-1/2 -translate-x-1/2 bottom-4 md:bottom-8 z-40 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-primary/90 to-accent/90 hover:from-primary hover:to-accent text-white font-semibold text-xs md:text-sm rounded-full shadow-lg shadow-blue-500/30 backdrop-blur-sm border border-white/20 transition-all duration-500 flex items-center gap-1.5 md:gap-2 group ${showFloatingCTA
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                    style={{
                        transitionProperty: 'opacity, transform',
                        willChange: 'opacity, transform'
                    }}
                >
                    <span>Get Started</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">arrow_outward</span>
                </button >
            </div >
        </>
    );
};

export default LandingPageArchivedContent;
