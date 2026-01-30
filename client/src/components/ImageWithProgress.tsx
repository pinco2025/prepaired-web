import React, { useState, useEffect } from 'react';

interface ImageWithProgressProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageWithProgress: React.FC<ImageWithProgressProps> = ({ src, alt, className = '' }) => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(false);
    const [, setImageLoaded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Reset state when src changes
        setLoading(true);
        setProgress(0);
        setError(false);
        setImageLoaded(false);
    }, [src]);

    useEffect(() => {
        // Simulate progress with smooth animation (fills to ~90% while loading)
        let interval: ReturnType<typeof setInterval> | null = null;
        if (loading && !error) {
            interval = setInterval(() => {
                setProgress(prev => {
                    // Slow down as we approach 90%
                    const increment = prev < 50 ? 8 : prev < 75 ? 4 : prev < 85 ? 2 : 1;
                    return Math.min(prev + increment, 90);
                });
            }, 150);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading, error]);

    const handleLoad = () => {
        setProgress(100);
        setImageLoaded(true);
        // Small delay to show 100% before hiding skeleton
        setTimeout(() => setLoading(false), 200);
    };

    const handleError = () => {
        setError(true);
        setLoading(false);
    };

    const openLightbox = () => {
        if (!loading && !error) {
            setIsLightboxOpen(true);
        }
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setZoomLevel(1); // Reset zoom when closing
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => prev === 1 ? 2 : prev === 2 ? 3 : 1);
    };

    const retryLoad = () => {
        setError(false);
        setLoading(true);
        setProgress(0);
        setRetryCount(prev => prev + 1); // Bust browser cache
    };

    // Generate cache-busted URL for retries
    const imageSrc = retryCount > 0
        ? `${src}${src.includes('?') ? '&' : '?'}_retry=${retryCount}`
        : src;

    if (error) {
        return (
            <div
                className={`flex items-center justify-center rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${className}`}
                style={{ minHeight: '120px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)' }}
                onClick={retryLoad}
                title="Click to retry"
            >
                <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)' }}>
                        <span className="material-icons-outlined text-2xl text-red-400">broken_image</span>
                    </div>
                    <span className="text-sm text-red-400/80 block mb-3">Failed to load image</span>
                    <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors">
                        <span className="material-icons-outlined text-lg">refresh</span>
                        Click to Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                {/* Modern Loading Skeleton with Glassmorphism */}
                {loading && (
                    <div
                        className={`relative flex flex-col items-center justify-center rounded-2xl overflow-hidden p-4 min-h-[220px] min-w-[200px] bg-gradient-to-br from-blue-500/5 via-sky-400/5 to-cyan-400/5 ${className}`}
                    >
                        {/* Animated shimmer overlay */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(56, 182, 255, 0.3) 50%, transparent 100%)',
                                animation: 'shimmer 2s infinite',
                            }}
                        />
                        <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes pulse-ring {
                0% { transform: scale(0.95); opacity: 0.5; }
                50% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(0.95); opacity: 0.5; }
              }
            `}</style>

                        {/* Glassmorphism card */}
                        <div
                            className="relative z-10 px-8 py-6 rounded-2xl backdrop-blur-sm bg-blue-500/5 shadow-2xl border border-sky-400/15"
                            style={{
                                boxShadow: '0 8px 32px rgba(0, 102, 255, 0.1)',
                            }}
                        >
                            {/* Circular Progress Indicator with gradient */}
                            <div className="relative w-20 h-20 mb-4 mx-auto">
                                {/* Pulsing background ring */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.15) 0%, rgba(56, 182, 255, 0.15) 100%)',
                                        animation: 'pulse-ring 2s ease-in-out infinite',
                                    }}
                                />

                                {/* SVG Progress Ring */}
                                <svg className="w-20 h-20 transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                                    {/* Track */}
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        className="stroke-border-light dark:stroke-border-dark"
                                        strokeWidth="2.5"
                                        strokeOpacity="0.3"
                                    />
                                    {/* Progress with gradient effect */}
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#0066ff" />
                                            <stop offset="50%" stopColor="#35b2ff" />
                                            <stop offset="100%" stopColor="#38b6ff" />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${progress * 0.88} 88`}
                                        style={{ transition: 'stroke-dasharray 0.2s ease-out' }}
                                    />
                                </svg>

                                {/* Percentage text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span
                                        className="text-lg font-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #0066ff 0%, #35b2ff 50%, #38b6ff 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                            </div>

                            {/* Loading text */}
                            <p className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark font-medium whitespace-nowrap">
                                Loading image...
                            </p>
                        </div>
                    </div>
                )}

                {/* Actual Image (hidden while loading) */}
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 cursor-zoom-in hover:opacity-90 ${loading ? 'opacity-0 absolute top-0 left-0' : 'opacity-100'}`}
                    style={{ backgroundColor: 'white' }}
                    onLoad={handleLoad}
                    onError={handleError}
                    onClick={openLightbox}
                    title="Click to enlarge"
                />
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-auto p-8"
                    onClick={closeLightbox}
                    style={{ cursor: zoomLevel > 1 ? 'zoom-out' : 'default' }}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="fixed top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <span className="material-icons-outlined text-white text-3xl">close</span>
                    </button>

                    {/* Zoom indicator */}
                    <div className="fixed top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                        {zoomLevel === 1 ? '1x' : zoomLevel === 2 ? '2x' : '3x'} - Click image to {zoomLevel < 3 ? 'zoom in' : 'reset'}
                    </div>

                    {/* Enlarged image container - scrollable with zoom */}
                    <div
                        className="relative"
                        onClick={toggleZoom}
                        style={{ cursor: zoomLevel < 3 ? 'zoom-in' : 'zoom-out' }}
                    >
                        <img
                            src={imageSrc}
                            alt={alt}
                            className="shadow-2xl transition-transform duration-300 ease-out"
                            style={{
                                backgroundColor: 'white',
                                maxWidth: zoomLevel === 1 ? '90vw' : 'none',
                                maxHeight: zoomLevel === 1 ? '85vh' : 'none',
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: 'center center',
                            }}
                        />
                    </div>

                    {/* Click outside hint */}
                    <p className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        Click outside image or press ESC to close
                    </p>
                </div>
            )}
        </>
    );
};

export default ImageWithProgress;
