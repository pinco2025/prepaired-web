import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onSubmitted: () => void;
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const MIN_WORD_COUNT = 20;

interface Ratings {
  aipt: number | null;
  questionSet: number | null;
  ux: number | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onSubmitted }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Ratings>({ aipt: null, questionSet: null, ux: null });
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const wordCount = remarks.trim() === '' ? 0 : remarks.trim().split(/\s+/).length;
  const allRated = ratings.aipt !== null && ratings.questionSet !== null && ratings.ux !== null;
  const isFormValid = allRated && wordCount >= MIN_WORD_COUNT;

  const handleSubmit = async () => {
    if (!isFormValid || !user || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          aipt_rating: ratings.aipt,
          question_set_rating: ratings.questionSet,
          ux_rating: ratings.ux,
          remarks: remarks.trim(),
        });
      if (insertError) throw insertError;
      setSubmitted(true);
      setTimeout(() => onSubmitted(), 1800);
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories: { key: keyof Ratings; label: string; icon: string; description: string }[] = [
    { key: 'aipt', label: 'AIPT Tests', icon: 'psychology', description: 'AI Percentile Test experience' },
    { key: 'questionSet', label: 'Question Set', icon: 'quiz', description: 'Practice question quality & variety' },
    { key: 'ux', label: 'Overall UX', icon: 'devices', description: 'Interface & ease of use' },
  ];

  const getHintText = () => {
    if (!allRated && wordCount < MIN_WORD_COUNT) return 'Rate all categories and share your remarks';
    if (!allRated) return 'Please rate all 3 categories to continue';
    const remaining = MIN_WORD_COUNT - wordCount;
    return `Add ${remaining} more word${remaining !== 1 ? 's' : ''} to your remarks`;
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-modal-backdrop">
      <div className="relative w-full sm:max-w-md overflow-hidden sm:rounded-2xl rounded-t-2xl bg-surface-light dark:bg-surface-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-modal-content max-h-[92vh] flex flex-col">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 grid-bg-light dark:grid-bg-dark opacity-40 dark:opacity-20 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, white 20%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, white 20%, transparent 70%)',
          }}
        />

        {/* Scrollable content */}
        <div className="relative overflow-y-auto flex-1 p-5 pb-6">

          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="mb-4 flex w-16 h-16 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
                <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
              </div>
              <h2 className="text-xl font-black text-text-light dark:text-text-dark mb-2">Thank you!</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-xs">
                Your feedback helps us build a better prepAIred for everyone.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="mb-3 flex w-11 h-11 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/10 dark:ring-primary/20">
                  <span className="material-symbols-outlined text-primary text-xl">rate_review</span>
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">
                  Quick Feedback
                </span>
                <h2 className="text-lg font-black tracking-tight text-text-light dark:text-text-dark mb-1">
                  How's your experience so far?
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs leading-relaxed max-w-[260px]">
                  Help us improve — takes less than a minute.
                </p>
              </div>

              {/* Rating Categories */}
              <div className="space-y-4 mb-5">
                {categories.map(({ key, label, icon, description }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-[17px]">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-text-light dark:text-text-dark leading-tight">{label}</p>
                        <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark leading-tight">{description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {RATING_LABELS.map((ratingLabel, idx) => {
                        const value = idx + 1;
                        const isSelected = ratings[key] === value;
                        return (
                          <button
                            key={ratingLabel}
                            onClick={() => setRatings(prev => ({ ...prev, [key]: value }))}
                            className={`py-2 rounded-lg text-[11px] font-semibold transition-all active:scale-95 select-none ${
                              isSelected
                                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                : 'bg-black/5 dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary'
                            }`}
                          >
                            {ratingLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-black/5 dark:bg-white/5 mb-5" />

              {/* Remarks */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-text-light dark:text-text-dark">
                    Your Remarks
                  </label>
                  <span className={`text-[10px] font-semibold tabular-nums transition-colors ${
                    wordCount >= MIN_WORD_COUNT ? 'text-green-500' : 'text-text-secondary-light dark:text-text-secondary-dark'
                  }`}>
                    {wordCount} / {MIN_WORD_COUNT} words
                  </span>
                </div>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="What did you like? What could be better? Any specific suggestions for us..."
                  rows={4}
                  className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 px-3.5 py-3 text-sm text-text-light dark:text-text-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-xs text-center mb-3">{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || submitting}
                className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                  isFormValid && !submitting
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.98] glow-button'
                    : 'bg-black/8 dark:bg-white/8 text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : 'Submit Feedback'}
              </button>

              {!isFormValid && (
                <p className="text-center text-[11px] text-text-secondary-light dark:text-text-secondary-dark mt-2.5">
                  {getHintText()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default FeedbackModal;
