import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const Waitlist: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [testDate, setTestDate] = useState('both');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Redirect or show already registered if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Already logged in, can treat as registered implicitly, or just show a message
        }
    }, [isAuthenticated, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/; // Basic 10-digit Indian phone validation

        if (!email.trim() && !mobile.trim()) {
            setError("Please enter either an email address or a mobile number.");
            return;
        }

        if (email.trim() && !emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (mobile.trim() && !phoneRegex.test(mobile)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        try {
            const db = getFirestore();

            // Check if email already exists
            if (email.trim()) {
                const emailQuery = query(collection(db, 'waitlist'), where('email', '==', email.trim()));
                const emailSnapshot = await getDocs(emailQuery);
                if (!emailSnapshot.empty) {
                    setError("This email address is already registered on the waitlist.");
                    setLoading(false);
                    return;
                }
            }

            // Check if mobile already exists
            if (mobile.trim()) {
                const mobileQuery = query(collection(db, 'waitlist'), where('mobile', '==', mobile.trim()));
                const mobileSnapshot = await getDocs(mobileQuery);
                if (!mobileSnapshot.empty) {
                    setError("This mobile number is already registered on the waitlist.");
                    setLoading(false);
                    return;
                }
            }

            await addDoc(collection(db, 'waitlist'), {
                email,
                mobile,
                testDate,
                createdAt: serverTimestamp(),
            });

            navigate('/waitlist-success');
        } catch (err) {
            console.error("Error adding document: ", err);
            setError("An error occurred while submitting your registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark text-slate-900 dark:text-white px-4">
                <div className="bg-white/80 dark:bg-[#141414]/80 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200 dark:border-white/10">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Already Registered</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        You are already logged in to your account.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-brand-blue hover:bg-deep-blue text-white rounded-xl font-semibold transition duration-300"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-display bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark text-slate-900 dark:text-white">
            {/* Navigation Header */}
            <header className="absolute top-0 w-full px-4 py-4 sm:px-6 sm:py-6 md:px-20 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <img alt="prepAIred logo" className="h-8 w-auto" src="/logo.png" />
                    <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">prepAIred</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 w-full max-w-2xl px-4 sm:px-6 py-24 sm:py-20 text-center">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-4 sm:mb-6">
                    Register for <span className="text-primary">AIPT</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed mb-8 sm:mb-12 max-w-xl mx-auto">
                    Free for all JEE Aspirants. Compete with the best minds in India on <span className="font-bold text-primary">13th &amp; 15th March</span>.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-xs sm:text-sm max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {/* Registration Card */}
                <div className="bg-white/60 dark:bg-[#141414]/60 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 text-left">
                        {/* Date Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-base">calendar_month</span>
                                Select Test Date
                            </label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <label className="cursor-pointer group">
                                    <input
                                        className="hidden peer"
                                        name="test_date"
                                        type="radio"
                                        value="13"
                                        checked={testDate === '13'}
                                        onChange={(e) => setTestDate(e.target.value)}
                                    />
                                    <div className="py-3 px-1 sm:py-4 sm:px-2 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-300 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all text-xs sm:text-sm font-semibold text-center group-hover:border-primary/30">
                                        13th Mar
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input
                                        className="hidden peer"
                                        name="test_date"
                                        type="radio"
                                        value="15"
                                        checked={testDate === '15'}
                                        onChange={(e) => setTestDate(e.target.value)}
                                    />
                                    <div className="py-3 px-1 sm:py-4 sm:px-2 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-300 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all text-xs sm:text-sm font-semibold text-center group-hover:border-primary/30">
                                        15th Mar
                                    </div>
                                </label>
                                <label className="cursor-pointer group">
                                    <input
                                        className="hidden peer"
                                        name="test_date"
                                        type="radio"
                                        value="both"
                                        checked={testDate === 'both'}
                                        onChange={(e) => setTestDate(e.target.value)}
                                    />
                                    <div className="py-3 px-1 sm:py-4 sm:px-2 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-300 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all text-xs sm:text-sm font-semibold text-center group-hover:border-primary/30">
                                        Both
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-[#141414] transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm sm:text-base"
                                    placeholder="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={mobile.length > 0}
                                />
                            </div>

                            <div className="flex items-center justify-center my-4">
                                <span className="text-primary text-sm font-extrabold uppercase tracking-widest">OR</span>
                            </div>

                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">call</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-[#141414] transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm sm:text-base"
                                    placeholder="Mobile Number"
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    disabled={email.length > 0}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 sm:py-5 rounded-2xl transition-all transform active:scale-[0.99] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 text-base sm:text-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span>{loading ? 'Registering...' : 'Register for AIPT'}</span>
                            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative sm:absolute sm:bottom-6 w-full text-center px-4 sm:px-6 py-4 sm:py-0">
                <p className="text-xs text-slate-400">&copy; 2025-2026 PrepAIred. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Waitlist;
