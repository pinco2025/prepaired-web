import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Test } from '../data';
import { useAuth } from '../contexts/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDataCache } from '../contexts/DataCacheContext';
import JEEMInstructions from './JEEMInstructions';
import TestInterface from './TestInterface';
import TestSubmitted from './TestSubmitted';

type TestStatus = 'completed' | 'unlocked' | 'locked' | 'subscription_required';
type PageState = 'selection' | 'instructions' | 'inProgress' | 'submitted';

interface AIPTTest extends Test {
    tier: 'free' | 'lite';
    status: TestStatus;
    submissionId?: string;
    hasResult?: boolean;
}

// ── Subscription Upgrade Modal ──────────────────────────────────────────────
const SubscriptionModal: React.FC<{ onClose: () => void; onUpgrade: () => void }> = ({ onClose, onUpgrade }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="relative bg-surface-light dark:bg-surface-dark rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 shadow-2xl border border-border-light dark:border-border-dark"
            onClick={e => e.stopPropagation()}
        >
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-5">
                {/* Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span
                        className="material-symbols-outlined text-primary text-lg sm:text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        lock
                    </span>
                </div>

                {/* Heading */}
                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-text-light dark:text-text-dark mb-1">
                        prepAIred Lite Required
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        This test is exclusively available to Lite subscribers. Upgrade to unlock all 6 hand-picked, verified AIPT tests and more.
                    </p>
                </div>

                {/* Perks */}
                <div className="w-full space-y-2 sm:space-y-3 text-left">
                    {[
                        '4 Best AI-Powered Tests with verified performance analysis',
                        'Hand-picked Condensed PYQ Set based on JEE Main 2026 Jan',
                        'Handcrafted Statement Based & Fast-Track Sets',
                        'Most analysed 360° Preparation Set',
                        'JEE Advanced Phase 2 coverage included',
                    ].map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 sm:gap-3">
                            <div className="rounded-full bg-primary/10 p-0.5 shrink-0">
                                <span className="material-symbols-outlined text-primary text-[15px] sm:text-[18px] font-bold">check</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-text-light dark:text-text-dark">{perk}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div className="w-full">
                    <div className="flex items-baseline justify-center gap-1.5 mb-3">
                        <span className="text-base sm:text-xl line-through text-text-secondary-light dark:text-text-secondary-dark font-medium">₹399</span>
                        <span className="text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark">₹119</span>
                        <span className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">/month</span>
                    </div>
                    <button
                        onClick={onUpgrade}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-dark hover:scale-[1.02] transition-all"
                    >
                        Get prepAIred Lite for ₹119 →
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full mt-1.5 py-2 text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── NTA Mode Dialog ──────────────────────────────────────────────────────────
const NTAModeDialog: React.FC<{
    onSelectNTA: () => void;
    onSelectStandard: () => void;
}> = ({ onSelectNTA, onSelectStandard }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border border-border-light dark:border-border-dark">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">computer</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-light dark:text-text-dark mb-1">Attempt in NTA Mode?</h2>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        NTA mode replicates the official JEE exam portal interface — same layout, same buttons, same experience.
                    </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-1">
                    <button
                        onClick={onSelectNTA}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        Yes, Open in NTA Mode
                    </button>
                    <button
                        onClick={onSelectStandard}
                        className="w-full py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                    >
                        Continue in Standard Mode
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── NTA Back Warning Dialog ───────────────────────────────────────────────────
const NTABackWarningDialog: React.FC<{
    onStay: () => void;
    onLeave: () => void;
}> = ({ onStay, onLeave }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800 mb-1">Leave the test?</h2>
                    <p className="text-sm text-slate-600">Your saved progress might get lost if you navigate away from the test.</p>
                </div>
                <div className="w-full flex gap-2 mt-1">
                    <button
                        onClick={onStay}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
                    >
                        Stay on Test
                    </button>
                    <button
                        onClick={onLeave}
                        className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── Guest Exam Type Modal (no DB save, for unauthenticated visitors) ──────────
const GuestExamTypeModal: React.FC<{ onSelect: (examType: 'JEE' | 'NEET') => void }> = ({ onSelect }) => {
    const [selected, setSelected] = useState<'JEE' | 'NEET' | null>(null);

    const handleSelect = (examType: 'JEE' | 'NEET') => {
        setSelected(examType);
        onSelect(examType);
    };

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative z-10 w-full max-w-3xl mx-4 sm:mx-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative text-center mb-8 sm:mb-10">
                    <h1 className="font-grotesk text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-dark mb-3 sm:mb-4">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Path</span>
                    </h1>
                    <p className="font-display text-sm sm:text-base text-text-secondary-dark max-w-md mx-auto leading-relaxed px-4">
                        Select your exam to see the right tests for you.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
                    <button
                        onClick={() => handleSelect('JEE')}
                        disabled={!!selected}
                        className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 min-h-[220px] sm:min-h-[320px] bg-surface-dark/90 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] border transition-all duration-500 overflow-hidden active:scale-[0.98]
                            ${selected === 'JEE' ? 'border-primary shadow-[0_0_30px_rgba(0,102,255,0.3)]' : 'border-border-dark/30 hover:border-primary/40'}
                            ${selected && selected !== 'JEE' ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex flex-col items-center">
                            <div className="font-grotesk text-[6rem] sm:text-[8rem] font-extrabold leading-none tracking-tighter text-surface-dark group-hover:text-primary/10 transition-colors duration-500 select-none">J</div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-grotesk text-4xl sm:text-5xl font-bold text-text-dark group-hover:scale-110 transition-transform duration-500">
                                {selected === 'JEE' ? <span className="inline-block w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" /> : 'JEE'}
                            </div>
                        </div>
                        <div className="relative text-center mt-4 sm:mt-6">
                            <p className="font-display text-[10px] sm:text-xs tracking-widest text-text-secondary-dark group-hover:text-text-dark transition-colors duration-300 uppercase">Engineering Entrance</p>
                        </div>
                    </button>
                    <button
                        onClick={() => handleSelect('NEET')}
                        disabled={!!selected}
                        className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 min-h-[220px] sm:min-h-[320px] bg-surface-dark/90 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] border transition-all duration-500 overflow-hidden active:scale-[0.98]
                            ${selected === 'NEET' ? 'border-accent shadow-[0_0_30px_rgba(53,178,255,0.3)]' : 'border-border-dark/30 hover:border-accent/40'}
                            ${selected && selected !== 'NEET' ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex flex-col items-center">
                            <div className="font-grotesk text-[6rem] sm:text-[8rem] font-extrabold leading-none tracking-tighter text-surface-dark group-hover:text-accent/10 transition-colors duration-500 select-none">N</div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-grotesk text-4xl sm:text-5xl font-bold text-text-dark group-hover:scale-110 transition-transform duration-500">
                                {selected === 'NEET' ? <span className="inline-block w-8 h-8 border-[3px] border-accent border-t-transparent rounded-full animate-spin" /> : 'NEET'}
                            </div>
                        </div>
                        <div className="relative text-center mt-4 sm:mt-6">
                            <p className="font-display text-[10px] sm:text-xs tracking-widest text-text-secondary-dark group-hover:text-text-dark transition-colors duration-300 uppercase">Medical Entrance</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

// ── AIPT Test Selection Screen ───────────────────────────────────────────────
const testPositions = [
    { top: 0, left: 50 },
    { top: 120, left: 350 },
    { top: 0, left: 640 },
    { top: 240, left: 800 },
    { top: 480, left: 640 },
    { top: 360, left: 350 },
];

interface SelectionScreenProps {
    tests: AIPTTest[];
    onSelectTest: (test: AIPTTest) => void;
    onShowSubscriptionModal: () => void;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ tests, onSelectTest, onShowSubscriptionModal }) => {
    const numTests = Math.min(tests.length, testPositions.length);

    // Calculate SVG path points
    const nodeCenter = 40;
    const points = testPositions.slice(0, numTests).map(pos => ({
        x: pos.left + 70 + nodeCenter,
        y: pos.top + 40 + nodeCenter,
    }));

    let svgPath = '';
    if (points.length > 1) {
        const tension = 0.3;
        svgPath = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;
            svgPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
    }

    const minHeight = numTests > 0
        ? Math.max(testPositions[numTests - 1].top + 200, 400)
        : 400;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 md:mb-16">
                <h1 className="text-3xl md:text-5xl font-bold text-text-light dark:text-text-dark tracking-tight mb-3">
                    Select Your AIPT
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-base md:text-lg max-w-2xl mx-auto px-2">
                    Benchmark your JEE Main 2026 & JEE Advanced 2026 performance against thousands of students. Each AIPT gives you a verified percentile rank powered by the best AI analysis.
                </p>
            </div>

            {/* Mobile grid layout */}
            <div className="md:hidden grid grid-cols-2 gap-6 px-2 pb-8">
                {tests.map((test, index) => {
                    const testNumber = index + 1;

                    if (test.status === 'completed' && test.hasResult && test.submissionId) {
                        return (
                            <Link key={test.testID} to={`/results/${test.submissionId}`} className="group flex flex-col items-center gap-2">
                                <div className="relative w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-green-500 shadow-glow-green flex items-center justify-center">
                                    <span className="text-xl font-bold text-green-500">{testNumber}</span>
                                    <span className="material-symbols-outlined absolute -top-1.5 -right-1.5 text-white bg-green-500 rounded-full p-0.5 text-xs shadow-sm">check</span>
                                </div>
                                <p className="font-bold text-text-light dark:text-text-dark text-xs leading-tight text-center">{test.title}</p>
                            </Link>
                        );
                    }

                    if (test.status === 'completed') {
                        return (
                            <div key={test.testID} className="flex flex-col items-center gap-2">
                                <div className="relative w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-amber-500 flex items-center justify-center">
                                    <span className="text-xl font-bold text-amber-500">{testNumber}</span>
                                    <span className="material-symbols-outlined absolute -top-1.5 -right-1.5 text-white bg-amber-500 rounded-full p-0.5 text-xs shadow-sm animate-spin">sync</span>
                                </div>
                                <p className="font-bold text-text-light dark:text-text-dark text-xs leading-tight text-center">{test.title}</p>
                            </div>
                        );
                    }

                    if (test.status === 'unlocked') {
                        return (
                            <button key={test.testID} onClick={() => onSelectTest(test)} className="group flex flex-col items-center gap-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
                                    <div className="relative w-16 h-16 rounded-full bg-primary text-white shadow-glow-primary flex items-center justify-center ring-2 ring-primary/20 group-hover:scale-105 transition-transform">
                                        <span className="text-xl font-bold">{testNumber}</span>
                                        <span className="material-symbols-outlined absolute -bottom-2 text-primary bg-white dark:bg-surface-dark rounded-full p-0.5 shadow-md text-sm">play_arrow</span>
                                    </div>
                                </div>
                                <p className="font-bold text-text-light dark:text-text-dark text-xs leading-tight text-center">{test.title}</p>
                            </button>
                        );
                    }

                    if (test.status === 'subscription_required') {
                        return (
                            <button key={test.testID} onClick={onShowSubscriptionModal} className="group flex flex-col items-center gap-2">
                                <div className="relative w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-primary/40 group-hover:border-primary/70 flex items-center justify-center transition-colors group-hover:scale-105">
                                    <span className="text-xl font-bold text-primary/60">{testNumber}</span>
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">LITE</div>
                                    <span className="material-symbols-outlined absolute -bottom-2 text-white bg-primary/70 group-hover:bg-primary rounded-full p-px shadow-md text-[13px] transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                </div>
                                <p className="font-bold text-text-light dark:text-text-dark text-xs leading-tight text-center">{test.title}</p>
                            </button>
                        );
                    }

                    return (
                        <div key={test.testID} className="flex flex-col items-center gap-2 cursor-not-allowed opacity-50">
                            <div className="relative w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-border-light dark:border-border-dark flex items-center justify-center">
                                <span className="text-xl font-bold text-text-secondary-light dark:text-text-secondary-dark">{testNumber}</span>
                                <span className="material-symbols-outlined absolute -bottom-1.5 -right-1.5 bg-border-light dark:bg-border-dark text-text-secondary-light rounded-full p-0.5 text-xs">lock</span>
                            </div>
                            <p className="font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs leading-tight text-center">{test.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Desktop path layout */}
            <div
                className="relative w-full max-w-5xl mx-auto py-10 hidden md:block"
                style={{ minHeight: `${minHeight}px` }}
            >
                {/* SVG connecting path */}
                <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                    style={{ strokeWidth: 3, fill: 'none' }}
                >
                    <defs>
                        <linearGradient id="aiptPathGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                            <stop offset="25%" style={{ stopColor: '#0066ff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#9ca3af', stopOpacity: 0.3 }} />
                        </linearGradient>
                    </defs>
                    {svgPath && (
                        <path
                            d={svgPath}
                            style={{ stroke: 'url(#aiptPathGradient)', strokeLinecap: 'round' }}
                        />
                    )}
                </svg>

                {/* Test nodes */}
                <div className="relative z-10">
                    {tests.map((test, index) => {
                        const position = testPositions[index % testPositions.length];
                        const testNumber = index + 1;

                        // ── Completed with result ──
                        if (test.status === 'completed' && test.hasResult && test.submissionId) {
                            return (
                                <div
                                    key={test.testID}
                                    className="flex justify-center md:absolute mb-8 md:mb-0"
                                    style={{ top: `${position.top}px`, left: `${position.left}px` }}
                                >
                                    <Link to={`/results/${test.submissionId}`} className="group relative flex flex-col items-center w-48">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-green-500 shadow-glow-green flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 z-10 relative">
                                                <span className="text-2xl font-bold text-green-500">{testNumber}</span>
                                                <span className="material-symbols-outlined absolute -top-2 -right-2 text-white bg-green-500 rounded-full p-0.5 text-sm shadow-sm">check</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center w-full">
                                            <h3 className="font-bold text-text-light dark:text-text-dark text-sm leading-tight">{test.title}</h3>
                                        </div>
                                    </Link>
                                </div>
                            );
                        }

                        // ── Completed, result processing ──
                        if (test.status === 'completed') {
                            return (
                                <div
                                    key={test.testID}
                                    className="flex justify-center md:absolute mb-8 md:mb-0"
                                    style={{ top: `${position.top}px`, left: `${position.left}px` }}
                                >
                                    <div className="group relative flex flex-col items-center w-48">
                                        <div className="w-20 h-20 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-amber-500 flex items-center justify-center z-10 relative">
                                            <span className="text-2xl font-bold text-amber-500">{testNumber}</span>
                                            <span className="material-symbols-outlined absolute -top-2 -right-2 text-white bg-amber-500 rounded-full p-0.5 text-sm shadow-sm animate-spin">sync</span>
                                        </div>
                                        <div className="mt-3 text-center w-full">
                                            <h3 className="font-bold text-text-light dark:text-text-dark text-sm leading-tight">{test.title}</h3>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // ── Unlocked (next available test) ──
                        if (test.status === 'unlocked') {
                            return (
                                <div
                                    key={test.testID}
                                    className="flex justify-center md:absolute mb-8 md:mb-0 z-20"
                                    style={{ top: `${position.top}px`, left: `${position.left}px` }}
                                >
                                    <button
                                        onClick={() => onSelectTest(test)}
                                        className="group relative flex flex-col items-center w-56 text-left"
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/30 rounded-full blur-xl animate-pulse" />
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-full bg-primary text-white shadow-glow-primary flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 z-10 ring-4 ring-primary/20 relative">
                                                <span className="text-3xl font-bold">{testNumber}</span>
                                                <span className="material-symbols-outlined absolute -bottom-3 text-primary bg-white dark:bg-surface-dark rounded-full p-1 shadow-md text-lg">play_arrow</span>
                                            </div>
                                        </div>
                                        <div className="text-center bg-surface-light dark:bg-surface-dark p-3 rounded-xl shadow-card-light dark:shadow-card-dark border border-primary/20 backdrop-blur-sm w-full">
                                            <h3 className="font-bold text-text-light dark:text-text-dark text-sm leading-tight">{test.title}</h3>
                                        </div>
                                    </button>
                                </div>
                            );
                        }

                        // ── Subscription required (lite test, free user) ──
                        if (test.status === 'subscription_required') {
                            return (
                                <div
                                    key={test.testID}
                                    className="flex justify-center md:absolute mb-8 md:mb-0"
                                    style={{ top: `${position.top}px`, left: `${position.left}px` }}
                                >
                                    <button
                                        onClick={onShowSubscriptionModal}
                                        className="group relative flex flex-col items-center w-56 text-left"
                                    >
                                        {/* Subtle glow to keep it looking clickable */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/15 rounded-full blur-xl" />
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-primary/40 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 z-10 relative group-hover:border-primary/70">
                                                <span className="text-3xl font-bold text-primary/60 group-hover:text-primary/90 transition-colors">{testNumber}</span>
                                                {/* Lite badge */}
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    LITE
                                                </div>
                                                <span className="material-symbols-outlined absolute -bottom-3 text-white bg-primary/70 group-hover:bg-primary rounded-full p-1 shadow-md text-base transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                            </div>
                                        </div>
                                        <div className="text-center bg-surface-light dark:bg-surface-dark p-3 rounded-xl shadow-card-light dark:shadow-card-dark border border-primary/20 group-hover:border-primary/40 transition-colors backdrop-blur-sm w-full">
                                            <h3 className="font-bold text-text-light dark:text-text-dark text-sm leading-tight">{test.title}</h3>
                                        </div>
                                    </button>
                                </div>
                            );
                        }

                        // ── Locked (sequential, free test) ──
                        return (
                            <div
                                key={test.testID}
                                className="flex justify-center md:absolute mb-8 md:mb-0"
                                style={{ top: `${position.top}px`, left: `${position.left}px` }}
                            >
                                <div className="group relative flex flex-col items-center w-48 cursor-not-allowed">
                                    <div className="w-20 h-20 rounded-full bg-surface-light dark:bg-surface-dark border-[3px] border-border-light dark:border-border-dark flex items-center justify-center z-10 relative">
                                        <span className="text-2xl font-bold text-text-secondary-light dark:text-text-secondary-dark">{testNumber}</span>
                                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full" />
                                        <span className="material-symbols-outlined absolute bottom-0 right-0 bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark rounded-full p-1 text-xs">lock</span>
                                    </div>
                                    <div className="mt-3 text-center w-full">
                                        <h3 className="font-semibold text-text-secondary-light dark:text-text-secondary-dark text-sm leading-tight">{test.title}</h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ── Main AIPTPage ────────────────────────────────────────────────────────────
const AIPTPage: React.FC = () => {
    usePageTitle('AIPT');
    const { user, isPaidUser, examType, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { invalidateCache } = useDataCache();

    const [rawTests, setRawTests] = useState<any[] | null>(null);
    const [submissionsMap, setSubmissionsMap] = useState<Map<string, { id: string; hasResult: boolean }>>(new Map());
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [pageState, setPageState] = useState<PageState>('selection');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [ntaMode, setNtaMode] = useState(false);
    const [showNtaDialog, setShowNtaDialog] = useState(false);
    const [ntaBackWarning, setNtaBackWarning] = useState(false);

    // Guest exam type (for unauthenticated visitors)
    const [guestExamType, setGuestExamType] = useState<'JEE' | 'NEET' | null>(() => {
        const stored = sessionStorage.getItem('aipt_guest_exam_type');
        return (stored === 'JEE' || stored === 'NEET') ? stored : null;
    });
    const [showGuestExamModal, setShowGuestExamModal] = useState(false);

    // Show guest exam type modal for unauthenticated visitors without a stored selection
    useEffect(() => {
        if (authLoading) return;
        if (user) return;
        if (!guestExamType) setShowGuestExamModal(true);
    }, [authLoading, user, guestExamType]);

    // Track which fetch is the "current" one so stale fetches can't update state
    const fetchIdRef = React.useRef(0);
    // Track whether we've done the initial load (avoids referencing rawTests in effect)
    const hasLoadedRef = React.useRef(false);

    // Fetch raw data — works for both authenticated users and guests
    useEffect(() => {
        if (authLoading) return; // wait for auth state to settle

        const id = ++fetchIdRef.current;
        // Only show loading skeleton on first fetch — not on re-fetches
        if (!hasLoadedRef.current) setIsLoading(true);
        setError(null);

        const fetchTests = async (attempt = 0): Promise<void> => {
            try {
                const { data: testsData, error: testsError } = await supabase
                    .from('tests')
                    .select('*')
                    .ilike('testID', 'AIPT-%')
                    .order('testID');

                if (fetchIdRef.current !== id) return;
                if (testsError) throw testsError;

                const sMap = new Map<string, { id: string; hasResult: boolean }>();

                if (user?.id) {
                    const testIds = (testsData || []).map((t: any) => String(t.testID));

                    const { data: submissionsData, error: submissionsError } = await supabase
                        .from('student_tests')
                        .select('id, test_id, result_url, submitted_at')
                        .eq('user_id', user.id)
                        .in('test_id', testIds.length > 0 ? testIds : ['__none__'])
                        .not('submitted_at', 'is', null);

                    if (fetchIdRef.current !== id) return;
                    if (submissionsError) throw submissionsError;

                    // If tests query returned nothing, session may be stale — retry
                    if ((testsData || []).length === 0 && attempt < 2) {
                        await new Promise(r => setTimeout(r, 800));
                        if (fetchIdRef.current === id) return fetchTests(attempt + 1);
                        return;
                    }

                    (submissionsData || []).forEach((s: any) => {
                        sMap.set(s.test_id, { id: s.id, hasResult: !!s.result_url });
                    });
                }

                if (fetchIdRef.current === id) {
                    setRawTests(testsData || []);
                    setSubmissionsMap(sMap);
                    hasLoadedRef.current = true;
                }
            } catch (err: any) {
                if (attempt < 2 && fetchIdRef.current === id) {
                    await new Promise(r => setTimeout(r, 800));
                    if (fetchIdRef.current === id) return fetchTests(attempt + 1);
                }
                if (fetchIdRef.current === id) setError(err.message || 'Failed to load tests.');
            } finally {
                if (fetchIdRef.current === id) setIsLoading(false);
            }
        };

        fetchTests();
    }, [user?.id, authLoading]);

    // For guests use their locally-selected type; for logged-in users use context
    const effectiveExamType = user ? examType : guestExamType;

    // Compute test statuses from raw data + isPaidUser + effectiveExamType (no refetch needed)
    const tests: AIPTTest[] = React.useMemo(() => {
        if (!rawTests) return [];

        // Filter to only tests matching the effective exam type.
        // If effectiveExamType is null or the test has no exam field, include it.
        const examFilteredTests = effectiveExamType
            ? rawTests.filter((t: any) => !t.exam || t.exam.toUpperCase() === effectiveExamType.toUpperCase())
            : rawTests;

        let firstFreeUnlocked = false;

        return examFilteredTests.map((test: any) => {
            const submissionInfo = submissionsMap.get(String(test.testID));
            const isCompleted = !!submissionInfo;
            const testTier = ((test.tier || 'free') as 'free' | 'lite');

            if (isCompleted) {
                return {
                    ...test,
                    tier: testTier,
                    status: 'completed' as TestStatus,
                    submissionId: submissionInfo?.id,
                    hasResult: submissionInfo?.hasResult,
                };
            }

            if (isPaidUser) {
                return { ...test, tier: testTier, status: 'unlocked' as TestStatus };
            }

            if (testTier === 'lite') {
                return { ...test, tier: testTier, status: 'subscription_required' as TestStatus };
            }

            if (!firstFreeUnlocked) {
                firstFreeUnlocked = true;
                return { ...test, tier: testTier, status: 'unlocked' as TestStatus };
            }

            return { ...test, tier: testTier, status: 'locked' as TestStatus };
        });
    }, [rawTests, submissionsMap, isPaidUser, effectiveExamType]);

    // Handle back button during test
    useEffect(() => {
        const handlePopState = () => {
            if (ntaMode && pageState === 'inProgress') {
                setNtaBackWarning(true);
            } else {
                setPageState('instructions');
            }
        };
        if (pageState === 'inProgress' || pageState === 'submitted') {
            window.history.pushState({ state: pageState }, '');
            window.addEventListener('popstate', handlePopState);
        }
        return () => window.removeEventListener('popstate', handlePopState);
    }, [pageState, ntaMode]);

    const handleSelectTest = (test: AIPTTest) => {
        if (!user) {
            navigate('/login', { state: { from: '/aipt' } });
            return;
        }
        setSelectedTest(test as Test);
        setNtaMode(false);
        setPageState('instructions');
    };

    const handleStartTest = () => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && effectiveExamType?.toUpperCase() === 'JEE') {
            setShowNtaDialog(true);
        } else {
            setPageState('inProgress');
            document.documentElement.requestFullscreen?.().catch(() => {});
        }
    };

    const handleConfirmNtaMode = (useNta: boolean) => {
        setShowNtaDialog(false);
        setNtaMode(useNta);
        setPageState('inProgress');
        window.dispatchEvent(new CustomEvent('ntamodechange', { detail: useNta }));
        document.documentElement.requestFullscreen?.().catch(() => {});
    };

    const handleSubmitSuccess = () => {
        invalidateCache('all');
        setNtaMode(false);
        setPageState('submitted');
        window.dispatchEvent(new CustomEvent('ntamodechange', { detail: false }));
    };

    const handleBackToSelection = () => {
        setSelectedTest(null);
        setNtaMode(false);
        setPageState('selection');
        window.dispatchEvent(new CustomEvent('ntamodechange', { detail: false }));
    };

    const isTestInProgress = pageState === 'inProgress';

    const guestModal = !authLoading && !user && showGuestExamModal ? (
        <GuestExamTypeModal
            onSelect={(type) => {
                sessionStorage.setItem('aipt_guest_exam_type', type);
                setGuestExamType(type);
                setShowGuestExamModal(false);
            }}
        />
    ) : null;

    // ── Loading skeleton ──
    if (isLoading) {
        return (
            <>
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Header skeleton */}
                        <div className="text-center mb-16 flex flex-col items-center gap-4">
                            <div className="relative overflow-hidden rounded-full bg-black/5 dark:bg-white/5 h-7 w-40">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                            </div>
                            <div className="relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 h-10 w-64 sm:w-80">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                            </div>
                            <div className="relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 h-5 w-72 sm:w-96">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                            </div>
                        </div>
                        {/* Test nodes skeleton — mobile: vertical list, desktop: scattered */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <div className="relative overflow-hidden rounded-full bg-black/5 dark:bg-white/5 w-20 h-20">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" style={{ animationDelay: `${i * 0.15}s` }} />
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 h-4 w-24">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" style={{ animationDelay: `${i * 0.15}s` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            {guestModal}
            </>
        );
    }

    // ── Error ──
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

    // ── Test in progress ──
    if (isTestInProgress && selectedTest) {
        if (ntaMode) {
            return (
                <>
                    <TestInterface test={selectedTest} onSubmitSuccess={handleSubmitSuccess} exam={selectedTest.exam} ntaMode={true} />
                    {ntaBackWarning && (
                        <NTABackWarningDialog
                            onStay={() => {
                                setNtaBackWarning(false);
                                window.history.pushState({ state: 'inProgress' }, '');
                            }}
                            onLeave={() => {
                                setNtaBackWarning(false);
                                setNtaMode(false);
                                setPageState('instructions');
                                window.dispatchEvent(new CustomEvent('ntamodechange', { detail: false }));
                            }}
                        />
                    )}
                </>
            );
        }
        return (
            <main className="flex-grow h-screen overflow-hidden">
                <div className="w-full h-full p-4 bg-background-light dark:bg-background-dark">
                    <TestInterface test={selectedTest} onSubmitSuccess={handleSubmitSuccess} exam={selectedTest.exam} />
                </div>
            </main>
        );
    }

    // ── Submitted ──
    if (pageState === 'submitted') {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 flex justify-center">
                    <TestSubmitted />
                </div>
            </main>
        );
    }

    // ── Instructions for selected test ──
    if (pageState === 'instructions' && selectedTest) {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 flex flex-col items-center gap-4">
                    <button
                        onClick={handleBackToSelection}
                        className="self-start flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to AIPT
                    </button>
                    <JEEMInstructions test={selectedTest} onStartTest={handleStartTest} />
                </div>

                {showNtaDialog && (
                    <NTAModeDialog
                        onSelectNTA={() => handleConfirmNtaMode(true)}
                        onSelectStandard={() => handleConfirmNtaMode(false)}
                    />
                )}
            </main>
        );
    }

    // ── No tests available for this exam type ──
    if (!isLoading && !error && tests.length === 0 && effectiveExamType) {
        return (
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4 max-w-md">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-primary text-3xl">science</span>
                        </div>
                        <h2 className="text-text-light dark:text-text-dark text-xl font-bold">
                            {effectiveExamType.toUpperCase()} AIPTs are on their way!
                        </h2>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                            We're building AI-powered tests specifically for {effectiveExamType.toUpperCase()} aspirants. Till then, stay consistent with your practice and check back soon!
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ── Selection screen ──
    return (
        <>
        <main className="flex-grow">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SelectionScreen
                    tests={tests}
                    onSelectTest={handleSelectTest}
                    onShowSubscriptionModal={() => setShowSubscriptionModal(true)}
                />
            </div>

            {showSubscriptionModal && (
                <SubscriptionModal
                    onClose={() => setShowSubscriptionModal(false)}
                    onUpgrade={() => navigate('/pricing')}
                />
            )}

            {showNtaDialog && (
                <NTAModeDialog
                    onSelectNTA={() => handleConfirmNtaMode(true)}
                    onSelectStandard={() => handleConfirmNtaMode(false)}
                />
            )}
        </main>
        {guestModal}
        </>
    );
};

export default AIPTPage;
