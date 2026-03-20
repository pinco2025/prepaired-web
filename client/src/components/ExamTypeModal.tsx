import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

interface ExamTypeModalProps {
  /** Called after a successful selection */
  onComplete: () => void;
  /** If true, show a close/dismiss button (used when triggered from profile menu) */
  allowDismiss?: boolean;
  /** Called when dismiss button is clicked (only relevant when allowDismiss=true) */
  onDismiss?: () => void;
}

const ExamTypeModal: React.FC<ExamTypeModalProps> = ({ onComplete, allowDismiss = false, onDismiss }) => {
  const { user, refreshExamType } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<'JEE' | 'NEET' | null>(null);

  const handleSelect = async (examType: 'JEE' | 'NEET') => {
    if (!user || saving) return;
    setSelected(examType);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ exam_type: examType })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating exam type:', error);
        alert('Failed to save exam type. Please try again.');
        setSelected(null);
        return;
      }

      // Refresh the context state from DB to verify the update took effect
      await refreshExamType();
      onComplete();
    } catch (err) {
      console.error('Error in handleSelect:', err);
      alert('Something went wrong. Please try again.');
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={allowDismiss ? onDismiss : undefined}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl mx-4 sm:mx-6">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Dismiss button */}
        {allowDismiss && (
          <button
            onClick={onDismiss}
            className="absolute -top-2 -right-2 sm:top-0 sm:right-0 z-20 w-10 h-10 rounded-full bg-surface-dark/90 border border-border-dark flex items-center justify-center text-text-secondary-dark hover:text-text-dark hover:border-primary transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}

        <div className="relative text-center mb-8 sm:mb-10">
          <h1 className="font-grotesk text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-dark mb-3 sm:mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Path</span>
          </h1>
          <p className="font-display text-sm sm:text-base text-text-secondary-dark max-w-md mx-auto leading-relaxed px-4">
            Select your exam to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
          {/* JEE Tile */}
          <button
            onClick={() => handleSelect('JEE')}
            disabled={saving}
            className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 min-h-[220px] sm:min-h-[320px] bg-surface-dark/90 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] border transition-all duration-500 overflow-hidden active:scale-[0.98]
              ${selected === 'JEE' ? 'border-primary shadow-[0_0_30px_rgba(0,102,255,0.3)]' : 'border-border-dark/30 hover:border-primary/40'}
              ${saving && selected !== 'JEE' ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center">
              <div className="font-grotesk text-[6rem] sm:text-[8rem] font-extrabold leading-none tracking-tighter text-surface-dark group-hover:text-primary/10 transition-colors duration-500 select-none">
                J
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-grotesk text-4xl sm:text-5xl font-bold text-text-dark group-hover:scale-110 transition-transform duration-500">
                {saving && selected === 'JEE' ? (
                  <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                ) : 'JEE'}
              </div>
            </div>
            <div className="relative text-center mt-4 sm:mt-6">
              <p className="font-display text-[10px] sm:text-xs tracking-widest text-text-secondary-dark group-hover:text-text-dark transition-colors duration-300 uppercase">
                Engineering Entrance
              </p>
            </div>
          </button>

          {/* NEET Tile */}
          <button
            onClick={() => handleSelect('NEET')}
            disabled={saving}
            className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 min-h-[220px] sm:min-h-[320px] bg-surface-dark/90 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] border transition-all duration-500 overflow-hidden active:scale-[0.98]
              ${selected === 'NEET' ? 'border-accent shadow-[0_0_30px_rgba(53,178,255,0.3)]' : 'border-border-dark/30 hover:border-accent/40'}
              ${saving && selected !== 'NEET' ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center">
              <div className="font-grotesk text-[6rem] sm:text-[8rem] font-extrabold leading-none tracking-tighter text-surface-dark group-hover:text-accent/10 transition-colors duration-500 select-none">
                N
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-grotesk text-4xl sm:text-5xl font-bold text-text-dark group-hover:scale-110 transition-transform duration-500">
                {saving && selected === 'NEET' ? (
                  <span className="inline-block w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                ) : 'NEET'}
              </div>
            </div>
            <div className="relative text-center mt-4 sm:mt-6">
              <p className="font-display text-[10px] sm:text-xs tracking-widest text-text-secondary-dark group-hover:text-text-dark transition-colors duration-300 uppercase">
                Medical Entrance
              </p>
            </div>
          </button>
        </div>


      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ExamTypeModal;
