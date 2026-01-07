import React, { useState, useEffect } from 'react';

interface JEELoaderProps {
    message?: string;
    variant?: 'full' | 'compact' | 'inline';
}

const JEELoader: React.FC<JEELoaderProps> = ({
    message = 'Loading...',
    variant = 'full'
}) => {
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const dots = '.'.repeat(dotCount);

    if (variant === 'inline') {
        return (
            <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {message}
                </span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex flex-col items-center justify-center p-6 gap-4">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
                </div>
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {message.replace('...', '')}{dots}
                </span>
            </div>
        );
    }

    // Full variant (default) - Clean, minimal full-screen loader
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="flex flex-col items-center gap-6">
                {/* Clean circular loader with gradient accent */}
                <div className="relative w-16 h-16">
                    {/* Subtle background ring */}
                    <div className="absolute inset-0 rounded-full border-3 border-primary/10"></div>

                    {/* Animated gradient spinner */}
                    <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.2s' }}>
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            strokeWidth="3"
                            stroke="url(#loaderGradient)"
                            strokeLinecap="round"
                            strokeDasharray="120"
                            strokeDashoffset="60"
                        />
                        <defs>
                            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0066ff" stopOpacity="1" />
                                <stop offset="100%" stopColor="#38b6ff" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Simple message with animated dots */}
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark tracking-wide">
                    {message.replace('...', '')}<span className="inline-block w-6 text-left">{dots}</span>
                </p>
            </div>
        </div>
    );
};

export default JEELoader;
