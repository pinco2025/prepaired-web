import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const REPORT_PARTS = [
  { id: 'question',       label: 'Question',       icon: 'help_outline'   },
  { id: 'options',        label: 'Options',         icon: 'list'           },
  { id: 'answer',         label: 'Answer',          icon: 'check_circle'   },
  { id: 'solution',       label: 'Solution',        icon: 'lightbulb'      },
  { id: 'question_image', label: 'Question Image',  icon: 'image'          },
  { id: 'solution_image', label: 'Solution Image',  icon: 'image_search'   },
  { id: 'option_image',   label: 'Option Image',    icon: 'photo_library'  },
];

// ─── Internal Modal ──────────────────────────────────────────────────────────

interface ReportModalProps {
  questionId: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ questionId, onClose }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('question_reports')
        .insert({
          question_uuid: questionId,
          reported_parts: Array.from(selected),
          user_id: user?.id ?? null,
        });
      if (insertError) throw insertError;
      setSubmitted(true);
      setTimeout(onClose, 1600);
    } catch {
      setError('Could not submit. Please try again.');
      setSubmitting(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl bg-surface-light dark:bg-surface-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-modal-content pb-safe">

        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-black/15 dark:bg-white/15" />
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-10 px-6">
            <div className="mb-3 flex w-12 h-12 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
              <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
            </div>
            <p className="font-bold text-text-light dark:text-text-dark mb-1">Report submitted</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              We'll review this question soon. Thanks!
            </p>
          </div>
        ) : (
          <div className="p-5 pt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex w-9 h-9 items-center justify-center rounded-xl bg-red-500/10">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">flag</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-light dark:text-text-dark leading-tight">Report an Issue</p>
                  <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Select all that apply</p>
                </div>
              </div>
              {/* Close — bigger tap target */}
              <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Options list — tall tap targets for mobile */}
            <div className="space-y-1.5 mb-5">
              {REPORT_PARTS.map(part => {
                const isSelected = selected.has(part.id);
                return (
                  <button
                    key={part.id}
                    onClick={() => toggle(part.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.04] text-text-light dark:text-text-dark'
                    }`}
                  >
                    {/* Custom checkbox */}
                    <span className={`flex-shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center border-2 transition-colors ${
                      isSelected
                        ? 'bg-red-500 border-red-500'
                        : 'border-black/20 dark:border-white/20'
                    }`}>
                      {isSelected && (
                        <span className="material-symbols-outlined text-white text-[13px]">check</span>
                      )}
                    </span>
                    <span className="material-symbols-outlined text-[17px] opacity-50">{part.icon}</span>
                    {part.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center mb-3">{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
              className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all ${
                selected.size > 0 && !submitting
                  ? 'bg-red-500 text-white active:scale-[0.98] shadow-md shadow-red-500/20'
                  : 'bg-black/[0.07] dark:bg-white/[0.07] text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                `Report${selected.size > 0 ? ` (${selected.size})` : ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

// ─── Public Component ─────────────────────────────────────────────────────────

interface ReportFlagProps {
  questionId: string;
  /** Optional extra classes for the trigger button */
  className?: string;
}

/**
 * Self-contained report flag button + modal.
 * Drop in anywhere a question is rendered: <ReportFlag questionId={q.uuid} />
 */
const ReportFlag: React.FC<ReportFlagProps> = ({ questionId, className = '' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Report an issue with this question"
        className={`flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary-light/40 dark:text-text-secondary-dark/35 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-400/10 transition-colors active:scale-90 ${className}`}
      >
        <span className="material-symbols-outlined text-[18px]">flag</span>
      </button>
      {open && <ReportModal questionId={questionId} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ReportFlag;
