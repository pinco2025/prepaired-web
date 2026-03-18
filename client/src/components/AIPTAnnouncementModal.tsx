import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface AIPTAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPTAnnouncementModal: React.FC<AIPTAnnouncementModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleAttemptNow = () => {
    onClose();
    navigate('/aipt');
  };

  if (!isOpen) return null;

  const highlights = [
    { icon: 'school', text: 'Based on JEE 2026 January attempt pattern' },
    { icon: 'trending_up', text: 'AI-powered analysis to boost your percentile' },
    { icon: 'timer', text: 'Full-length timed mock with real exam feel' },
    { icon: 'insights', text: 'Detailed performance breakdown after submission' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-modal-content"
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 grid-bg-light dark:grid-bg-dark opacity-60 dark:opacity-40 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, white, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
          }}
        />

        {/* Content */}
        <div className="relative p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-5 flex w-14 h-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/10 dark:ring-primary/20 animate-premium-icon">
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
          </div>

          {/* Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-4">
            New Test Available
          </span>

          {/* Title */}
          <h2 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark mb-2">
            AIPT-02 is Live
          </h2>

          {/* Description */}
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6 max-w-xs text-sm leading-relaxed">
            The <span className="font-bold text-text-light dark:text-text-dark">AI Percentile Test</span> is designed to simulate the real JEE Main experience and give you actionable insights to grow your percentile.
          </p>

          {/* Highlights */}
          <ul className="w-full space-y-3 mb-8 text-left">
            {highlights.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-text-light dark:text-text-dark"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={handleAttemptNow}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] glow-button"
          >
            Attempt AIPT-02 Now
          </button>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="mt-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors underline decoration-dotted underline-offset-4"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPTAnnouncementModal;
