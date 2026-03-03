import React, { useState, useEffect } from 'react';

interface ImageWithProgressProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageWithProgress: React.FC<ImageWithProgressProps> = ({ src, alt, className = '' }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [, setImageLoaded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // Reset state when src changes
        setLoading(true);
        setError(false);
        setImageLoaded(false);
    }, [src]);

    const handleLoad = () => {
        setImageLoaded(true);
        // Small delay to ensure smooth transition
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
            <div className={`relative overflow-hidden ${className} ${loading ? 'min-h-[220px]' : ''}`}>
                {/* Skeleton Loader */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse z-10 flex items-center justify-center">
                        <span className="sr-only">Loading image...</span>
                        <div className="w-12 h-12 text-gray-300 dark:text-gray-700">
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Actual Image (hidden while loading) */}
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`block max-w-full max-h-full w-auto h-auto mx-auto object-contain transition-opacity duration-500 ease-in-out cursor-zoom-in ${loading ? 'opacity-0' : 'opacity-100'}`}
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
