import React, { useRef, useState } from 'react';

const VideoPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Handle click/tap to toggle play/pause
    const handleTogglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    return (
        <div
            className="relative w-full aspect-video max-w-full cursor-pointer"
            onClick={handleTogglePlayPause}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Pause indicator - Responsive size */}
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-none">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl md:text-4xl text-slate-700 dark:text-slate-200">
                            pause
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
