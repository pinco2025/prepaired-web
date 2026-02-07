import React, { useEffect, useRef } from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe?: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
    onSubscribe,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // Prevent body scroll when modal is open
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

    if (!isOpen) return null;

    const features = [
        'Unlimited high-yield Question Sets',
        'Extensive %ile boosting tactics',
        'Clean, modern, distraction-free experience',
        'Upcoming Weakness Analysis system',
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
                {/* Grid pattern background - matching website design */}
                <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark opacity-60 dark:opacity-40 pointer-events-none"
                    style={{
                        maskImage: 'linear-gradient(to bottom, white, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
                    }}
                />

                {/* Content */}
                <div className="relative p-8 flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="mb-5 flex w-14 h-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/10 dark:ring-primary/20 animate-premium-icon">
                        <img
                            alt="prepAIred logo"
                            className="h-8 w-8 object-contain"
                            src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
                        />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark mb-2">
                        Premium Feature
                    </h2>

                    {/* Description */}
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-xs text-sm leading-relaxed">
                        Upgrade to <span className="font-bold text-text-light dark:text-text-dark">prepAIred Lite</span> to unlock unlimited access to Condensed PYQs and accelerate your revision.
                    </p>

                    {/* Features List */}
                    <ul className="w-full space-y-3 mb-8 text-left">
                        {features.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 text-sm text-text-light dark:text-text-dark"
                                style={{ animationDelay: `${150 + index * 50}ms` }}
                            >
                                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                                    check_circle
                                </span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                        onClick={onSubscribe}
                        className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] glow-button"
                    >
                        Unlock Premium Now
                    </button>

                    {/* Continue as Free */}
                    <button
                        onClick={onClose}
                        className="mt-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Continue as Free User (limited access)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
