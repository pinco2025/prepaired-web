import React, { useEffect, useState } from 'react';

interface PaymentSuccessOverlayProps {
    isVisible: boolean;
    planType: string;
    onComplete: () => void;
    countdownSeconds?: number;
}

const PaymentSuccessOverlay: React.FC<PaymentSuccessOverlayProps> = ({
    isVisible,
    planType,
    onComplete,
    countdownSeconds = 3
}) => {
    const [countdown, setCountdown] = useState(countdownSeconds);
    const [showCheckmark, setShowCheckmark] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setCountdown(countdownSeconds);
            setShowCheckmark(false);
            return;
        }

        // Show checkmark animation first
        const checkmarkTimer = setTimeout(() => {
            setShowCheckmark(true);
        }, 300);

        // Start countdown after checkmark appears
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearTimeout(checkmarkTimer);
            clearInterval(countdownInterval);
        };
    }, [isVisible, countdownSeconds, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md mx-4">
                {/* Success Circle with Checkmark */}
                <div className="relative mb-8">
                    {/* Animated rings */}
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/20 animate-ping" />
                    <div className="absolute inset-2 w-28 h-28 rounded-full bg-green-500/30 animate-pulse" />

                    {/* Main circle */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
                        {/* Checkmark SVG with animation */}
                        <svg
                            className={`w-16 h-16 text-white transition-all duration-500 ${showCheckmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                                className="checkmark-path"
                            />
                        </svg>
                    </div>
                </div>

                {/* Success Text */}
                <h2 className="text-3xl font-bold text-white mb-2 text-center animate-fade-in-up">
                    Payment Successful!
                </h2>
                <p className="text-lg text-gray-300 mb-6 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Welcome to <span className="text-primary font-semibold">{planType}</span>
                </p>

                {/* Countdown */}
                <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-gray-400 text-sm mb-2">Redirecting to dashboard</p>
                    <div className="flex items-center gap-2">
                        {/* Countdown number with animation */}
                        <div className="relative w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                            <span
                                key={countdown}
                                className="text-2xl font-bold text-white animate-bounce-in"
                            >
                                {countdown}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-white/20 rounded-full mt-6 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-primary rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${((countdownSeconds - countdown) / countdownSeconds) * 100}%`
                        }}
                    />
                </div>
            </div>

            {/* Confetti-like particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '-10px',
                            backgroundColor: ['#22c55e', '#3B82F6', '#A855F7', '#F59E0B', '#EC4899'][i % 5],
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                
                @keyframes fade-in-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                
                @keyframes bounce-in {
                    0% { 
                        transform: scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s ease-out forwards;
                }
                
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti 3s ease-in forwards;
                }
                
                .checkmark-path {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: draw-checkmark 0.5s ease-out 0.3s forwards;
                }
                
                @keyframes draw-checkmark {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessOverlay;
