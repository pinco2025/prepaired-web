
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import VideoPlayer from './VideoPlayer';
import { useRef } from 'react';

// Card Images
import super30Img from '../assets/cards/super30.png';
import condensedPyqImg from '../assets/cards/condensed-pyq.png';
import assertionImg from '../assets/cards/assertion.png';
import accuracySpeedImg from '../assets/cards/accuracy-speed.png';
import lvl2PyqImg from '../assets/cards/lvl-2-pyq.png';

const LandingPage: React.FC = () => {
    usePageTitle('AI-Powered JEE & NEET Prep');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(true);

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
    const [isVisible, setIsVisible] = useState(false);
    const comparisonRef = useRef<HTMLDivElement>(null);


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

    // Intersection observer for video section scroll animation
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

    const handleClickToStart = () => {
        if (!user) {
            navigate('/register');
        } else {
            navigate('/dashboard');
        }
    };

    const scrollToTrending = () => {
        const element = document.getElementById('trending-sets');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            setIsScrolled(target.scrollTop > 50);
        };
        const scrollContainer = document.getElementById('app-layout-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        } else {
            // Fallback for window scroll if ID not found (e.g. if layout changes)
            window.addEventListener('scroll', () => setIsScrolled(window.scrollY > 50));
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', () => { });
            }
        };
    }, []);

    return (
        <div id="landing-scroll-container" className="bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark text-slate-900 dark:text-white font-display overflow-x-hidden min-h-screen flex flex-col">
            {/* Navbar - Kept as requested with existing logic */}
            <header className={`fixed top-2 md:top-4 left-0 right-0 z-50 px-2 md:px-4 flex justify-center w-full transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="pointer-events-auto w-full max-w-4xl bg-white dark:bg-[#141414] border border-blue-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full py-2 md:py-3 pl-3 md:pl-5 pr-2 md:pr-2.5 flex items-center justify-between gap-2 md:gap-4 transition-transform hover:scale-[1.005] duration-300">
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <img
                            alt="prepAIred logo"
                            className="w-8 h-8 md:w-10 md:h-10 border border-black/5 dark:border-white/10 rounded-full bg-white/50 backdrop-blur-sm"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGK2QWvI0F6c0r-VfX2K6vK-H3F5aL4gP0C7Z8dE1fJ9m_nO3pG4sR7tTqkYlD8h-U-Wy_jK9oT2N-_q5kL-z8xS8=s120-c"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-sm md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                prep<span className="text-primary">AI</span>red
                            </h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 text-sm font-grotesk text-slate-500 dark:text-slate-400 gap-2">
                        <span className="relative flex h-2 w-2">
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

                        <button onClick={handleClickToStart} className="bg-gradient-to-r from-primary to-accent hover:to-primary text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-3 md:px-5 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-1 md:gap-1.5 shrink-0 uppercase tracking-wide">
                            Start Now
                            <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {/* Hero / Featured Banner */}
                <div className="relative w-full min-h-screen flex items-center justify-center pb-12 px-4 md:px-12 overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <img
                            src="/prepaired-bg.png"
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        {/* Netflix-style overlay: General darken + bottom fade */}
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/40"></div>
                    </div>
                    {/* Content */}
                    <div className="relative z-10 max-w-2xl flex flex-col gap-4 items-center text-center animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase">By IITians</span>
                            <span className="text-gray-600 dark:text-gray-300 text-xs font-medium tracking-wide">GET YOUR TARGET %ILE</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            Question sets <br /> Test Series &&nbsp;
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">More</span>
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 text-sm md:text-lg max-w-lg leading-relaxed mt-2">
                            Get started just at ₹119, Cancel Anytime
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button onClick={handleClickToStart} className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded text-base font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-[24px]">login</span>
                                Join Now
                            </button>
                            <button onClick={scrollToTrending} className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-slate-900 dark:text-white px-8 py-3 rounded text-base font-bold transition-all">
                                <span className="material-symbols-outlined text-[24px]">expand_more</span>
                                See How
                            </button>
                        </div>
                    </div>
                </div>



                {/* Trending Question Sets */}
                <section id="trending-sets" className="mb-12 px-4 md:px-12 relative group/section scroll-mt-24">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 group-hover/section:text-primary transition-colors cursor-pointer">
                        Trending Question Sets
                        <span className="material-symbols-outlined text-sm opacity-0 group-hover/section:opacity-100 group-hover/section:translate-x-1 transition-all">arrow_forward_ios</span>
                    </h3>
                    <div className="relative">
                        {/* Carousel Container */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 py-8 pb-12 -mb-4 px-4 md:px-0">
                            {/* Dynamic Cards */}
                            {[
                                {
                                    title: "Super30",
                                    image: super30Img,
                                    isComingSoon: false,
                                    tag: "MUST DO",
                                    link: "/super30"
                                },
                                {
                                    title: "Condensed PYQ",
                                    image: condensedPyqImg,
                                    isComingSoon: false,
                                    tag: "HIGH YIELD",
                                    link: "/question-set"
                                },
                                {
                                    title: "Statement Based Set",
                                    image: assertionImg,
                                    isComingSoon: true,
                                    tag: "NEW PATTERN",
                                    comingSoonText: "Coming Monday"
                                },
                                {
                                    title: "Accuracy and Speed Test",
                                    image: accuracySpeedImg,
                                    isComingSoon: true,
                                    tag: "TIMED",
                                    comingSoonText: "Coming Friday"
                                },
                                {
                                    title: "Level-2 Pyqs",
                                    image: lvl2PyqImg,
                                    isComingSoon: true,
                                    tag: "RANK BOOSTER",
                                    comingSoonText: "Next Monday"
                                }
                            ].map((set, index) => (
                                <div
                                    key={index}
                                    onClick={() => set.link && !set.isComingSoon && navigate(set.link)}
                                    className={`group relative flex-none w-40 md:w-[240px] cursor-pointer transition-all duration-300 hover:z-30 hover:scale-105 ${set.isComingSoon ? 'cursor-not-allowed opacity-80' : ''}`}
                                >
                                    <div className="aspect-[2/3] w-full rounded-lg overflow-hidden relative shadow-lg shadow-black/20 dark:shadow-black/50">
                                        <img
                                            alt={set.title}
                                            className={`w-full h-full object-cover object-center ${set.isComingSoon ? 'grayscale-[0.5] brightness-75' : ''}`}
                                            src={set.image}
                                        />

                                        {set.isComingSoon ? (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl transform group-hover:scale-110 transition-transform">
                                                    {(set as any).comingSoonText || "Coming Soon"}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20">
                                                {set.tag}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                            <h4 className="text-white font-bold text-lg leading-tight">{set.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Video Section --- */}
                <div id="question-section" ref={comparisonRef} className="max-w-6xl mx-auto px-2 md:px-4 mb-16 scroll-mt-24">
                    {/* Section Header */}
                    <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-2xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                            See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">Difference</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-2xl mx-auto">
                            Why solve PYQs, when you can have <span className="font-semibold text-slate-700 dark:text-slate-200">better - IPQs</span>
                        </p>
                    </div>
                    {/* Video Container */}
                    <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/40 border-2 border-primary/20 dark:border-primary/30">
                            <VideoPlayer />
                        </div>
                    </div>
                </div>


            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-black text-slate-500 dark:text-gray-500 py-12 px-4 md:px-12 border-t border-gray-200 dark:border-white/5 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col gap-8">
                    <div className="flex gap-5">
                        <a href="https://www.instagram.com/prepai_red/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M16.5,6.33C16.96,6.33 17.33,6.7 17.33,7.17C17.33,7.64 16.96,8 16.5,8C16.04,8 15.67,7.64 15.67,7.17C15.67,6.7 16.04,6.33 16.5,6.33Z" />
                            </svg>
                        </a>
                        <a href="https://t.me/prepAIred_JEE_NEET" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
                            <span className="sr-only">Telegram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@prepAIred-0" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
                            <span className="sr-only">YouTube</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="https://discord.gg/u9RYMdKaqH" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
                            <span className="sr-only">Discord</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-8 text-sm">
                        <button className="hover:underline text-left">Privacy</button>
                        <button className="hover:underline text-left">Legal Notices</button>
                        <button className="hover:underline text-left">Contact Us</button>
                    </div>
                    <p className="text-xs">©PrepAIred, Inc.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
