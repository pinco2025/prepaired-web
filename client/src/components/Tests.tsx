import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import './Tests.css';
import { Test } from '../data';
import { useAuth } from '../contexts/AuthContext';

interface TestWithStatus extends Test {
  status: 'completed' | 'unlocked' | 'locked';
}

const Tests: React.FC = () => {
    const { user } = useAuth();
    const [tests, setTests] = useState<TestWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTestsAndSubmissions = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Fetch all tests
                const { data: testsData, error: testsError } = await supabase
                    .from('tests')
                    .select('*')
                    .order('id', { ascending: true });

                if (testsError) throw testsError;

                // Fetch user's submitted tests
                const { data: submissionsData, error: submissionsError } = await supabase
                    .from('student_tests')
                    .select('test_id')
                    .eq('student_id', user.id)
                    .not('submitted_at', 'is', null);

                if (submissionsError) throw submissionsError;

                const completedTestIds = new Set(submissionsData.map(s => s.test_id));

                let firstUnlockedFound = false;
                const testsWithStatus: TestWithStatus[] = (testsData || []).map(test => {
                    const isCompleted = completedTestIds.has(test.id);
                    let status: 'completed' | 'unlocked' | 'locked' = 'locked';

                    if (isCompleted) {
                        status = 'completed';
                    } else if (!firstUnlockedFound) {
                        status = 'unlocked';
                        firstUnlockedFound = true;
                    }

                    return { ...test, status };
                });

                setTests(testsWithStatus);

            } catch (error: any) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchTestsAndSubmissions();
        } else {
            // Handle case where user is not logged in, maybe show all as locked.
            // For now, just stop loading and show empty.
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading) {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading tests...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <span className="material-icons-outlined text-red-500 text-5xl mb-4">error_outline</span>
                        <p className="text-red-500 text-lg font-medium mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (tests.length === 0) {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-5xl mb-4">quiz</span>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">No tests available at the moment.</p>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-2">Check back later for new tests.</p>
                    </div>
                </div>
            </main>
        );
    }
    const testPositions = [
        { top: 0, left: 50 },
        { top: 120, left: 350 },
        { top: 0, left: 640 },
        { top: 240, left: 800 },
        { top: 480, left: 640 },
        { top: 360, left: 350 },
        { top: 480, left: 50 },
        { top: 700, left: 50 },
        { top: 740, left: 350 },
        { top: 700, left: 640 },
    ];
    return (
        <main className="flex-grow">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark tracking-tight mb-4">Select Your Test</h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg max-w-2xl mx-auto">Navigate through the mastery path. Unlock new challenges by completing levels.</p>
                    </div>
                    <div className="relative w-full max-w-5xl mx-auto py-10 min-h-[900px]">
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 hidden md:block" style={{ strokeWidth: 3, fill: 'none' }}>
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                                    <stop offset="20%" style={{ stopColor: '#0066ff', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#9ca3af', stopOpacity: 0.3 }} />
                                </linearGradient>
                            </defs>
                            <path
                                className="stroke-border-light dark:stroke-border-dark path-line"
                                d="M 120 80 C 250 80, 300 200, 420 200 C 540 200, 590 80, 710 80 C 830 80, 880 200, 880 320 C 880 440, 830 560, 710 560 C 590 560, 540 440, 420 440 C 300 440, 250 560, 120 560 C 50 560, 50 680, 120 780 C 200 880, 350 880, 420 800 C 490 720, 500 700, 650 780"
                                style={{ stroke: 'url(#pathGradient)', strokeLinecap: 'round' }}
                            />
                        </svg>
                        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-border-light dark:bg-border-dark -translate-x-1/2 md:hidden z-0"></div>

                        <div className="relative z-10 grid grid-cols-1 md:block gap-12 md:gap-0">
                            {tests.map((test, index) => {
                                const position = testPositions[index % testPositions.length];
                                const testNumber = test.id.split('-').pop();

                                if (test.status === 'completed') {
                                    return (
                                        <div key={test.id} className="flex justify-center md:absolute mb-8 md:mb-0" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
                                            <Link to={`/results/${test.id}`} className="group relative flex flex-col items-center w-48">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-green-500 shadow-glow-green flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 z-10 relative">
                                                        <span className="text-2xl font-bold text-green-500">{testNumber}</span>
                                                        <span className="material-symbols-outlined absolute -top-2 -right-2 text-white bg-green-500 rounded-full p-0.5 text-sm shadow-sm">check</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-center w-full">
                                                    <h3 className="font-bold text-text-light dark:text-text-dark text-sm leading-tight mb-1">{test.title}</h3>
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">Completed</span>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                }

                                if (test.status === 'unlocked') {
                                    return (
                                        <div key={test.id} className="flex justify-center md:absolute mb-8 md:mb-0 z-20" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
                                            <Link to={`/tests/${test.id}`} className="group relative flex flex-col items-center w-56">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                                                <div className="relative mb-4">
                                                    <div className="w-24 h-24 rounded-full bg-primary text-white shadow-glow-primary flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 z-10 ring-4 ring-primary/20 relative">
                                                        <span className="text-3xl font-bold">{testNumber}</span>
                                                        <span className="material-symbols-outlined absolute -bottom-3 text-primary bg-white dark:bg-surface-dark rounded-full p-1 shadow-md text-lg">play_arrow</span>
                                                    </div>
                                                </div>
                                                <div className="text-center bg-surface-light dark:bg-surface-dark p-3 rounded-xl shadow-card-light dark:shadow-card-dark border border-primary/20 backdrop-blur-sm w-full">
                                                    <h3 className="font-bold text-text-light dark:text-text-dark text-base leading-tight mb-2">{test.title}</h3>
                                                    <button className="w-full py-1.5 px-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wide rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1">
                                                        Start Now
                                                    </button>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={test.id} className="flex justify-center md:absolute mb-8 md:mb-0" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
                                        <div className="group relative flex flex-col items-center w-48 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed">
                                            <div className="w-20 h-20 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-border-light dark:border-border-dark flex items-center justify-center z-10 relative">
                                                <span className="text-2xl font-bold text-text-secondary-light dark:text-text-secondary-dark">{testNumber}</span>
                                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full"></div>
                                                <span className="material-symbols-outlined absolute bottom-0 right-0 bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark rounded-full p-1 text-xs">lock</span>
                                            </div>
                                            <div className="mt-3 text-center w-full">
                                                <h3 className="font-semibold text-text-secondary-light dark:text-text-secondary-dark text-sm leading-tight mb-1">{test.title}</h3>
                                                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wider">Locked</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Tests;
