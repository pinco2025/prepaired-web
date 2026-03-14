import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface FeedbackData {
    rating: number; // Overall Session Quality (1-5)
    helpfulness: 'very' | 'somewhat' | 'notmuch' | null; // PYQ vs IPQ comparison
    difficulty: number; // Difficulty Level of IPQs (1-10)
    comments: string;
}

interface Super30FeedbackProps {
    sessionId: string | null;
    onClose: () => void;
}

const Super30Feedback: React.FC<Super30FeedbackProps> = ({ sessionId, onClose }) => {
    const [feedback, setFeedback] = useState<FeedbackData>({
        rating: 0,
        helpfulness: null,
        difficulty: 5,
        comments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (sessionId) {
            await supabase
                .from('student_sets')
                .update({
                    feedback_rating: feedback.rating,
                    feedback_helpfulness: feedback.helpfulness,
                    feedback_difficulty: feedback.difficulty,
                    feedback_comments: feedback.comments || null
                })
                .eq('id', sessionId);
        }

        setSubmitted(true);
        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-50 duration-300">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-emerald-600 dark:text-emerald-400">
                        🎉
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Thank You!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Your feedback helps us craft the ultimate revision experience. Good luck with your preparation!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto scrollbar-premium">
            <style>{`
                .star-rating {
                    display: flex;
                    flex-direction: row-reverse;
                    justify-content: flex-end;
                }
                .star-rating input {
                    display: none;
                }
                .star-rating label {
                    cursor: pointer;
                    color: #cbd5e1;
                    transition: color 0.2s;
                }
                .star-rating label:hover,
                .star-rating label:hover ~ label,
                .star-rating input:checked ~ label {
                    color: #fbbf24;
                }
                input[type=range] {
                    -webkit-appearance: none;
                    width: 100%;
                    background: transparent;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: #e2e8f0;
                    border-radius: 4px;
                }
                .dark input[type=range]::-webkit-slider-runnable-track {
                    background: #334155;
                }
                input[type=range]::-webkit-slider-thumb {
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #137fec;
                    cursor: pointer;
                    -webkit-appearance: none;
                    margin-top: -8px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
            `}</style>

            <div className="bg-white dark:bg-background-dark/95 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 fade-in duration-500 max-h-[90vh] overflow-y-auto">
                <main className="math-grid">
                    <div className="px-6 py-12">
                        <div className="text-center mb-12">
                            <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                                <span className="material-symbols-outlined text-primary text-4xl leading-none">rate_review</span>
                            </div>
                            <h2 className="text-4xl font-display font-bold mb-3 tracking-tight dark:text-white">We value your feedback!</h2>
                            <p className="text-slate-500 dark:text-slate-400">Help us improve the Super 30 experience by sharing your thoughts on today's session.</p>
                        </div>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Overall Quality */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <label className="block text-lg font-display font-bold mb-4 dark:text-white">How would you rate the overall session quality?</label>
                                <div className="star-rating gap-2 justify-center sm:justify-end">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <React.Fragment key={star}>
                                            <input
                                                id={`star${star}`}
                                                name="rating"
                                                type="radio"
                                                value={star}
                                                checked={feedback.rating === star}
                                                onChange={() => setFeedback(prev => ({ ...prev, rating: star }))}
                                            />
                                            <label htmlFor={`star${star}`}><span className="material-symbols-outlined text-5xl">star</span></label>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Helpfulness */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <label className="block text-lg font-display font-bold mb-6 dark:text-white">How helpful was the PYQ vs IPQ comparison?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { value: 'very', label: 'Very Helpful' },
                                        { value: 'somewhat', label: 'Somewhat' },
                                        { value: 'notmuch', label: 'Not Much' }
                                    ].map((option) => (
                                        <label key={option.value} className="relative cursor-pointer group">
                                            <input
                                                className="peer sr-only"
                                                name="helpfulness"
                                                type="radio"
                                                value={option.value}
                                                checked={feedback.helpfulness === option.value}
                                                onChange={() => setFeedback(prev => ({ ...prev, helpfulness: option.value as any }))}
                                            />
                                            <div className="p-4 text-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 transition-all">
                                                <p className="font-bold dark:text-slate-200 group-hover:text-primary transition-colors">{option.label}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <label className="block text-lg font-display font-bold mb-2 dark:text-white">Difficulty Level of IPQs</label>
                                <p className="text-sm text-slate-500 mb-8">Specifically regarding the Intelligent Practice Questions generated for you.</p>
                                <div className="px-2">
                                    <input
                                        className="mb-4 w-full accent-primary"
                                        max="10"
                                        min="1"
                                        step="1"
                                        type="range"
                                        value={feedback.difficulty}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                                    />
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <span>Too Easy</span>
                                        <span>Perfect</span>
                                        <span>Too Hard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <label className="block text-lg font-display font-bold mb-4 dark:text-white">Any additional comments or suggestions?</label>
                                <textarea
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 focus:ring-primary focus:border-primary transition-all p-4 text-slate-900 dark:text-white resize-none"
                                    placeholder="Tell us what you liked or what we can improve..."
                                    rows={4}
                                    value={feedback.comments}
                                    onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                                ></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8">
                                <button
                                    className="w-full sm:w-auto bg-primary text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={isSubmitting || feedback.rating === 0}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
                <footer className="bg-white/50 dark:bg-background-dark/50 border-t border-slate-200 dark:border-slate-800 py-8">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <p className="text-xs text-slate-400 font-medium tracking-wide">© 2026 prepAIred. Your feedback helps us build the best JEE preparation tool.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Super30Feedback;
