import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { usePageTitle } from '../hooks/usePageTitle';
import PaymentSuccessOverlay from './PaymentSuccessOverlay';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Dynamic equations for the cycling effect - Inspired PrepAIred Questions (IPQs)
// Based on the PYQ: s = t³ - 6t² + 3t + 4, find velocity when a = 0
const dynamicEquations = [
    { eq: 's = 2t^3 - 9t^2 + 12t', ask: 'total distance when velocity becomes zero' },
    { eq: 's = t^3 - 4t^2 + 3t + 5', ask: 'average velocity in [0, t] where a = 0' },
    { eq: 's = 3t^3 - 12t^2 + 9t', ask: 'time when particle returns to origin' },
    { eq: 's = t^3 - 5t^2 + 6t + 2', ask: 'displacement when speed is maximum' },
    { eq: 's = 2t^3 - 8t^2 + 6t', ask: 'velocity when acceleration changes sign' },
];

const LandingPage: React.FC = () => {
    usePageTitle('AI-Powered JEE & NEET Prep');
    const navigate = useNavigate();
    const { user, subscriptionType, refreshSubscription } = useAuth();

    // Handle successful payment - navigate to dashboard
    const handlePaymentSuccess = useCallback(() => {
        setPaymentSuccess(true);
        navigate('/dashboard', { replace: true });
    }, [navigate]);

    const {
        initiatePayment,
        loading: paymentLoading,
        error: paymentError,
        showSuccess,
        successPlanType,
        handleSuccessComplete
    } = useRazorpay({
        refreshSubscription,
        onPaymentSuccess: handlePaymentSuccess,
    });
    const [darkMode, setDarkMode] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // State for cycling equations
    const [equationIndex, setEquationIndex] = useState(0);
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
    }, [displayedTagline, isTyping, taglineIndex]);

    // Cycle through equations
    useEffect(() => {
        const interval = setInterval(() => {
            setEquationIndex((prev) => (prev + 1) % dynamicEquations.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
        const containerHeight = container.clientHeight;

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
        <>
            {/* Payment Success Overlay */}
            <PaymentSuccessOverlay
                isVisible={showSuccess}
                planType={successPlanType}
                onComplete={handleSuccessComplete}
            />
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
                        <div className="text-center mb-10 md:mb-16 max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-4 md:mb-6 text-text-light dark:text-text-dark tracking-tight">
                                Stop Panicking. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Start Prep<span className="text-white">AI</span>ring.</span>
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base md:text-xl font-light leading-relaxed mb-6 md:mb-10 max-w-2xl mx-auto px-2">
                                Experience the best way to prepare for your exams. Random test's will not tell you what you need to improve, but AI Analysis will.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => document.getElementById('question-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:shadow-blue-600/30"
                                >
                                    Try a Question Now
                                    <span className="material-symbols-outlined">arrow_downward</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative mt-4 md:mt-8 mb-16 md:mb-24 w-full">
                            <div className="absolute inset-y-0 left-0 w-8 md:w-40 bg-gradient-to-r from-background-light via-background-light/80 dark:from-background-dark dark:via-background-dark/80 to-transparent z-20 pointer-events-none"></div>
                            <div className="absolute inset-y-0 right-0 w-8 md:w-40 bg-gradient-to-l from-background-light via-background-light/80 dark:from-background-dark dark:via-background-dark/80 to-transparent z-20 pointer-events-none"></div>
                            <div className="overflow-hidden flex items-center">
                                <div className="flex animate-scroll hover:[animation-play-state:paused] gap-4 md:gap-6 py-4 md:py-8 w-max">
                                    {[...Array(2)].map((_, i) => (
                                        <React.Fragment key={i}>
                                            {/* Dashboard Recommendations Card - Warm gradient for personalization */}
                                            <div className="w-[260px] md:w-[320px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-indigo-500/25 border border-white/10">
                                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/15 rounded-full blur-2xl"></div>
                                                <div className="absolute bottom-0 right-0 p-6 opacity-[0.08] pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                                    <span className="material-symbols-outlined text-[140px] leading-none text-white">dashboard_customize</span>
                                                </div>
                                                <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-6 border border-white/20 shadow-inner">
                                                    <span className="material-symbols-outlined text-2xl">lightbulb</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2">Dashboard Recommendations</h3>
                                                <p className="text-white/90 font-medium text-sm leading-relaxed">Personalized study plans.<br />AI-curated weak area focus.</p>
                                            </div>
                                            {/* Cumulative Analytics Card - Data/tech feel */}
                                            <div className="w-[260px] md:w-[320px] bg-[#0f172a] rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-slate-900/30 border border-cyan-500/20">
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
                                                <div className="size-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/30">
                                                    <span className="material-symbols-outlined text-2xl">insights</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 relative z-10">Cumulative Analytics</h3>
                                                <p className="text-slate-400 font-medium text-sm leading-relaxed relative z-10">Track progress over time.<br />Chapter-wise performance stats.</p>
                                            </div>
                                            {/* Same Relevance, Different Feel Card - Fresh/creative feel */}
                                            <div className="w-[260px] md:w-[320px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                                                <div className="absolute -right-8 top-10 w-32 h-32 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-full blur-3xl"></div>
                                                <div className="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                                                    <span className="material-symbols-outlined text-2xl">autorenew</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-slate-800 dark:text-white mb-2 relative z-10">Same Relevance, Different Feel</h3>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed relative z-10">Fresh question variants.<br />Same concepts, new challenges.</p>
                                            </div>
                                            {/* IPQs Card - Inspired/creative feel */}
                                            <div className="w-[260px] md:w-[320px] bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-orange-500/25 border border-white/10">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                                <div className="absolute -left-4 -bottom-4 w-24 h-24 border-4 border-white/15 rounded-full"></div>
                                                <div className="absolute right-4 top-4 opacity-[0.1]">
                                                    <span className="material-symbols-outlined text-7xl text-white">auto_awesome</span>
                                                </div>
                                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-6 border border-white/20 backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-2xl">bolt</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 relative z-10">Inspired PrepAIred Questions</h3>
                                                <p className="text-orange-100 font-medium text-sm leading-relaxed relative z-10">PYQ-inspired, AI-enhanced.<br />Never repeat the same question.</p>
                                            </div>
                                            {/* JEE-Like Interface Card - Professional/exam feel */}
                                            <div className="w-[260px] md:w-[320px] bg-gradient-to-bl from-[#1e3a5f] to-[#0d1b2a] rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-slate-900/30 border border-blue-500/20">
                                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-4 right-4 opacity-[0.08]">
                                                    <span className="material-symbols-outlined text-8xl text-white">computer</span>
                                                </div>
                                                <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/30">
                                                    <span className="material-symbols-outlined text-2xl">desktop_windows</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 relative z-10">JEE-Like Interface</h3>
                                                <p className="text-slate-400 font-medium text-sm leading-relaxed relative z-10">Authentic NTA experience.<br />Practice under real conditions.</p>
                                            </div>
                                            {/* Live Rank Card - Competitive/achievement feel */}
                                            <div className="w-[260px] md:w-[320px] bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 md:p-7 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-amber-500/25 border border-white/20">
                                                <div className="absolute right-0 top-0 p-4 opacity-[0.15]">
                                                    <span className="material-symbols-outlined text-8xl text-white">emoji_events</span>
                                                </div>
                                                <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
                                                <div className="size-12 rounded-xl bg-white/25 flex items-center justify-center text-white mb-6 border border-white/30 shadow-inner backdrop-blur-sm">
                                                    <span className="material-symbols-outlined text-2xl">trending_up</span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 relative z-10">Live Percentile</h3>
                                                <p className="text-white/90 font-medium text-sm leading-relaxed relative z-10">Percentile predictions.<br />Compete with peers nationwide.</p>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* --- Question Comparison Section --- */}
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

                            {/* Comparison Cards Container */}
                            <div className="relative">
                                {/* Floating Decorative Elements */}
                                <div className="absolute -top-8 -left-8 w-16 h-16 text-primary/10 dark:text-primary/5 animate-float-particle pointer-events-none hidden lg:block" style={{ animationDelay: '0s' }}>
                                    <span className="material-symbols-outlined text-6xl">function</span>
                                </div>
                                <div className="absolute -bottom-8 -right-8 w-16 h-16 text-accent/10 dark:text-accent/5 animate-float-particle pointer-events-none hidden lg:block" style={{ animationDelay: '2s' }}>
                                    <span className="material-symbols-outlined text-6xl">calculate</span>
                                </div>
                                <div className="absolute top-1/4 -right-12 w-12 h-12 text-green-500/10 animate-float-particle pointer-events-none hidden lg:block" style={{ animationDelay: '1s' }}>
                                    <span className="material-symbols-outlined text-5xl">neurology</span>
                                </div>

                                {/* Central VS Badge - visible on desktop */}
                                <div className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary animate-gradient-shift shadow-2xl shadow-blue-500/50 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 hover:scale-110 transition-transform cursor-default group">
                                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></div>
                                        <span className="font-display font-black text-white text-3xl group-hover:scale-110 transition-transform">VS</span>
                                    </div>
                                </div>


                                <div className="grid lg:grid-cols-2 gap-4 lg:gap-20 items-stretch">
                                    {/* --- Traditional Approach Card --- */}
                                    <div className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                                        {/* Diagonal "Outdated" Stripe */}
                                        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 overflow-hidden rounded-3xl pointer-events-none z-10">
                                            <div className="absolute top-8 -left-12 w-40 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 text-center transform -rotate-45 shadow-lg">
                                                Outdated
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-slate-50 to-red-50/30 dark:from-slate-800 dark:to-red-950/20 rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-red-200/60 dark:border-red-900/40 shadow-lg h-full relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                                            {/* Faded overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent dark:from-slate-900/30 pointer-events-none rounded-3xl"></div>

                                            {/* Card Header */}
                                            <div className="relative flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-red-100/80 dark:bg-red-900/30 flex items-center justify-center border border-red-200/50 dark:border-red-800/30">
                                                    <span className="material-symbols-outlined text-2xl text-red-400/80">history_edu</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-display font-bold text-xl text-slate-600 dark:text-slate-300">Traditional</h3>
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 rounded uppercase">PYQ</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500">Static question banks</p>
                                                </div>
                                            </div>

                                            {/* Question Display */}
                                            <div className="relative mb-6 p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-red-100 dark:border-red-900/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200/50 dark:border-orange-800/30">JEE Main 2023</span>
                                                    <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                        Never Changes
                                                    </span>
                                                </div>
                                                <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] space-y-2">
                                                    <p>A particle moves such that:</p>
                                                    <div
                                                        className="flex items-center justify-center py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                                                        dangerouslySetInnerHTML={{
                                                            __html: katex.renderToString('s = t^3 - 6t^2 + 3t + 4', {
                                                                throwOnError: false,
                                                                displayMode: false
                                                            })
                                                        }}
                                                    />
                                                    <p>Find velocity when acceleration is zero.</p>
                                                </div>
                                            </div>

                                            {/* Drawbacks - More prominent */}
                                            <div className="relative space-y-2 p-4 bg-red-50/80 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Limitations</span>
                                                </div>
                                                {['Same numbers every time', 'Encourages memorization', 'Limited concept testing'].map((text, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-red-600/80 dark:text-red-400/80">
                                                        <span className="material-symbols-outlined text-base">block</span>
                                                        <span className="text-sm font-medium">{text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile VS Badge - Between cards */}
                                    <div className="lg:hidden flex justify-center py-2">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary animate-gradient-shift shadow-lg shadow-blue-500/40 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                            <span className="font-display font-bold text-white text-base">VS</span>
                                        </div>
                                    </div>

                                    {/* --- AI-Enhanced Card --- */}
                                    <div className={`relative group transition-all duration-700 delay-150 pt-4 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                                        {/* Animated Glow Effect */}
                                        <div className="absolute -inset-2 top-2 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-40 blur-2xl group-hover:opacity-60 transition-opacity duration-500 animate-gradient-shift"></div>

                                        <div className="relative bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-primary/40 dark:border-primary/30 shadow-2xl shadow-blue-500/30 comparison-card-hover overflow-visible">
                                            {/* Background Pattern */}
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 dark:from-blue-900/20 via-transparent to-transparent pointer-events-none rounded-3xl"></div>

                                            {/* Corner Accent */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-[80px] rounded-tr-3xl pointer-events-none"></div>

                                            {/* Verified Badge */}
                                            <div className="absolute -top-4 right-6 z-20">
                                                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/40 flex items-center gap-1 md:gap-2 hover:scale-105 transition-transform whitespace-nowrap">
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    Verified by IITians
                                                </div>
                                            </div>

                                            {/* Card Header */}
                                            <div className="relative flex items-center gap-4 mb-8 mt-2">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center ring-2 ring-primary/30 group-hover:scale-110 group-hover:ring-primary/50 transition-all">
                                                    <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">prepAIred</h3>
                                                    <p className="text-sm text-primary dark:text-primary-light font-medium">Adaptive learning engine</p>
                                                </div>
                                            </div>

                                            {/* Question Display - Dynamic! */}
                                            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/80 dark:to-slate-900/40 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-200 dark:border-slate-600 overflow-hidden">
                                                {/* Regeneration Progress Bar */}
                                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent animate-gradient-shift" style={{ width: '100%', animation: 'progress 3s linear infinite' }}></div>
                                                <style>{`
                                                @keyframes progress {
                                                    0% { width: 0%; opacity: 0.5; }
                                                    90% { width: 100%; opacity: 1; }
                                                    100% { width: 100%; opacity: 0; }
                                                }
                                            `}</style>

                                                {/* Live indicator */}
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Live</span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-sm">Generated Now</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">• Refreshes every attempt</span>
                                                </div>
                                                <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                                                    <p>For a particle with position function:</p>
                                                    <div
                                                        key={equationIndex}
                                                        className="flex items-center justify-center py-3 px-4 bg-white dark:bg-slate-800 rounded-xl border border-primary/30 shadow-sm animate-value-glow"
                                                        dangerouslySetInnerHTML={{
                                                            __html: katex.renderToString(dynamicEquations[equationIndex].eq, {
                                                                throwOnError: false,
                                                                displayMode: false
                                                            })
                                                        }}
                                                    />
                                                    <p>
                                                        Find the{' '}
                                                        <span
                                                            key={`ask-${equationIndex}`}
                                                            className="font-semibold text-accent"
                                                        >
                                                            {dynamicEquations[equationIndex].ask}
                                                        </span>
                                                        <span className="animate-typewriter-cursor text-primary ml-0.5">|</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Advantages */}
                                            <div className="relative space-y-3">
                                                {['Fresh values every attempt', 'Tests true understanding', 'Multi-concept integration'].map((text, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group/item hover:translate-x-1 transition-transform"
                                                        style={{ animationDelay: `${i * 100}ms` }}
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center checkmark-bounce shadow-sm">
                                                            <span className="material-symbols-outlined text-green-500 text-lg">check</span>
                                                        </div>
                                                        <span className="text-sm font-medium">{text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Bottom Stats */}
                                            <div className="relative mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2 group/stat hover:scale-105 transition-transform cursor-default">
                                                    <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-slate-800 dark:text-white">45%</span>
                                                        <span className="text-xs text-slate-400">better retention</span>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 text-sm font-bold rounded-xl border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default">
                                                    ✓ Proven Results
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="mt-10 md:mt-16 w-full max-w-5xl mx-auto px-2 md:px-4">
                            <div id="pay-section" className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-slate-800 border-2 border-blue-500/20 dark:border-blue-500/30 shadow-[0_30px_80px_-20px_rgba(0,102,255,0.2)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] group hover:shadow-[0_40px_90px_-20px_rgba(0,102,255,0.3)] transition-all duration-500">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-bl-[150px] -z-0 opacity-40"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 dark:bg-accent/5 rounded-tr-[100px] -z-0"></div>
                                <div className="absolute right-20 top-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex-1 p-6 md:p-12 z-10 flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 text-primary-dark dark:text-primary-light text-xs font-bold uppercase tracking-wider w-fit mb-6 shadow-sm">
                                            Launch Offer
                                        </div>
                                        <h3 className="text-3xl md:text-6xl font-display font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-[1.1]">
                                            10 <span className="text-primary">Inspired PrepAIred</span><br />Full Tests
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                                            <div className="flex flex-col">
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wide mb-1">Total Value</p>
                                                <span className="text-2xl text-slate-400 dark:text-slate-600 line-through decoration-2 decoration-red-400 font-medium">₹2499</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wide mb-1">Your Price</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">₹499</span>
                                                    <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-full border border-red-200 dark:border-red-800 mb-2">80% OFF</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-10">
                                            <li className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300">
                                                <div className="size-6 rounded-full bg-green-200 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-green-800 dark:text-green-400 text-sm font-bold">check</span>
                                                </div>
                                                Exact JEE Mains Difficulty Level
                                            </li>
                                            <li className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300">
                                                <div className="size-6 rounded-full bg-green-200 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-green-800 dark:text-green-400 text-sm font-bold">check</span>
                                                </div>
                                                Detailed Performance Analytics
                                            </li>
                                        </ul>
                                        {(isPaidUser || paymentSuccess) ? (
                                            <button
                                                onClick={() => navigate('/dashboard')}
                                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn animate-bounce-in"
                                            >
                                                Go to Dashboard
                                                <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleClaimOffer}
                                                disabled={paymentLoading}
                                                className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary text-white font-bold text-lg py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {paymentLoading ? 'Processing...' : 'Claim Offer Now'}
                                                {!paymentLoading && <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>}
                                            </button>
                                        )}
                                        {paymentError && (
                                            <p className="text-red-500 text-sm mt-2">{paymentError}</p>
                                        )}
                                    </div>
                                    <div className="w-full md:w-[40%] relative min-h-[280px] md:min-h-[500px] flex items-center justify-center p-4 md:p-8 overflow-visible">
                                        <div className="relative w-48 md:w-64 aspect-[3/4] bg-white dark:bg-slate-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 z-20 flex flex-col items-center justify-center p-4 md:p-6 text-center transition-transform duration-500 hover:scale-105 rotate-[-3deg] group-hover:rotate-0">
                                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-2xl z-0"></div>
                                            <div className="relative z-10 mb-6">
                                                <div className="text-7xl md:text-9xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-600 font-display leading-none tracking-tighter drop-shadow-sm">
                                                    10
                                                </div>
                                                <div className="text-5xl md:text-6xl font-serif font-black text-slate-900 dark:text-white font-display tracking-tight -mt-2 md:-mt-4">
                                                    IPFT
                                                </div>
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4"></div>
                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Syllabus Tests</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Verified by IITians</p>
                                            </div>
                                            <div className="absolute -top-4 md:-top-6 -right-4 md:-right-6 size-14 md:size-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-blue-400/30 animate-pulse-slow border-4 border-white dark:border-slate-700 z-30">
                                                <span className="text-white text-[10px] md:text-xs font-black text-center leading-tight uppercase transform -rotate-12 [text-shadow:-0.5px_-0.5px_0_#000,0.5px_-0.5px_0_#000,-0.5px_0.5px_0_#000,0.5px_0.5px_0_#000]">Best<br />Seller</span>
                                            </div>
                                        </div>
                                        <div className="absolute z-10 w-48 md:w-64 aspect-[3/4] bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 rotate-[6deg] scale-95 translate-x-3 md:translate-x-4 shadow-lg"></div>
                                        <div className="absolute z-0 w-48 md:w-64 aspect-[3/4] bg-slate-100 dark:bg-slate-600 rounded-2xl border border-slate-200 dark:border-slate-500 rotate-[12deg] scale-90 translate-x-6 md:translate-x-8 shadow-md opacity-60"></div>
                                        <div className="absolute bottom-10 left-10 text-primary/10 animate-pulse">
                                            <span className="material-symbols-outlined text-8xl">auto_awesome</span>
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

                    </div>
                </main>

                {/* Floating Scroll Navigation Buttons */}
                <div className="fixed right-3 md:right-6 bottom-3 md:bottom-6 z-50 flex flex-col gap-1.5 md:gap-2">
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
                </div>

                {/* Floating CTA Button - Appears when scrolled down */}
                <button
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
                </button>
            </div>
        </>
    );
};

export default LandingPage;
