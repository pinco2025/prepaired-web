import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { withTimeout } from '../utils/promiseUtils';

interface Chapter {
    code: string;
    name: string;
    level: number;
}

interface ChaptersData {
    [subject: string]: Chapter[];
}

const ChapterSelection: React.FC = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(() => window.innerWidth < 768 ? 0.6 : 1);

    // Check State
    const [baseUrl, setBaseUrl] = useState<string | null>(null);
    const [checkingChapter, setCheckingChapter] = useState<string | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [comingSoonChapterName, setComingSoonChapterName] = useState<string>('');

    // Pan State
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const lastTouchDistance = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fail-safe timeout duration
    const FETCH_TIMEOUT = 5000; // 5 seconds for initial load
    const CHECK_TIMEOUT = 3000; // 3 seconds for chapter check



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallelize fetching Chapters and Supabase URL
                const [chaptersResult, supabaseResult] = await Promise.allSettled([
                    withTimeout(fetch('/chapters.json'), FETCH_TIMEOUT),
                    withTimeout(
                        Promise.resolve(supabase
                            .from('question_set')
                            .select('url')
                            .eq('set_id', '26-pyq')
                            .single()),
                        FETCH_TIMEOUT
                    )
                ]);

                // 1. Handle Chapters
                if (chaptersResult.status === 'fulfilled') {
                    const res = chaptersResult.value as Response;
                    if (!res.ok) throw new Error('Failed to fetch chapters');
                    const chaptersData: ChaptersData = await res.json();

                    if (subject && chaptersData[subject]) {
                        setChapters(chaptersData[subject]);
                    } else {
                        setError(`No chapters found for subject: ${subject}`);
                    }
                } else {
                    throw new Error('Failed to load chapters data (Timeout)');
                }

                // 2. Handle Base URL (Non-blocking failure)
                if (supabaseResult.status === 'fulfilled') {
                    const sbVal = supabaseResult.value as any; // Cast to any or appropriate type 
                    if (!sbVal.error && sbVal.data) {
                        const setRow = sbVal.data;
                        if (setRow?.url) {
                            let rawBaseUrl = setRow.url
                                .replace('github.com', 'raw.githubusercontent.com')
                                .replace('/tree/', '/');
                            if (rawBaseUrl.endsWith('/')) {
                                rawBaseUrl = rawBaseUrl.slice(0, -1);
                            }
                            setBaseUrl(rawBaseUrl);
                        }
                    } else {
                        console.warn('Failed to fetch base URL or timed out. Availability check will be skipped.');
                    }

                }
            } catch (err) {
                setError('Error loading data. Please check your connection.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Initial Zoom Update on Resize logic if needed? 
        // Currently only setting initial state.

    }, [subject]);

    const handleChapterClick = async (chapterCode: string) => {
        // Prevent click if dragging
        if (isDragging) return;

        // If already checking, prevent double-click
        if (checkingChapter) return;

        // If no base URL, just navigate (Fail Open)
        if (!baseUrl) {
            navigate(`/pyq-2026/${subject}/practice/${chapterCode}`);
            return;
        }

        try {
            setCheckingChapter(chapterCode);
            const checkUrl = `${baseUrl}/${subject}/${chapterCode}_questions.json`;

            // Use short timeout for check
            const response = await withTimeout(fetch(checkUrl, { method: 'HEAD' }), CHECK_TIMEOUT);

            if (response.ok) {
                navigate(`/pyq-2026/${subject}/practice/${chapterCode}`);
            } else if (response.status === 404) {
                // Find chapter name for the popup
                const ch = chapters.find(c => c.code === chapterCode);
                setComingSoonChapterName(ch?.name || chapterCode);
                setShowComingSoon(true);
            } else {
                // Other error (500 etc) -> Fail Open
                console.warn(`Check failed with status ${response.status}. Failing open.`);
                navigate(`/pyq-2026/${subject}/practice/${chapterCode}`);
            }
        } catch (err) {
            console.error("Error checking chapter (Timeout or Network):", err);
            // FAIL OPEN: If network fails or times out, let them through.
            // It's better to show a potential error on the next page than to block here.
            navigate(`/pyq-2026/${subject}/practice/${chapterCode}`);
        } finally {
            setCheckingChapter(null);
        }
    };

    // Memoize nodes calculation
    const nodes = React.useMemo(() => {
        if (!chapters.length) return [];

        const centerX = 0; // Center relative to container
        const centerY = 0;
        const scalingParameter = window.innerWidth < 768 ? 60 : 80; // Tighter packing on mobile
        const angleIncrement = 137.5 * (Math.PI / 180);

        // 1. Initial Phyllotaxis Placement
        let generatedNodes = chapters.map((chapter, index) => {
            const r = scalingParameter * Math.sqrt(index);
            const theta = index * angleIncrement;

            const x = centerX + r * Math.cos(theta);
            const y = centerY + r * Math.sin(theta);

            // Size based on level (1-4)
            // Tweak size for denser layout: Level 1: 90px -> Level 4: 135px
            const level = chapter.level || 1;
            const size = 90 + ((level - 1) * 15);

            return {
                ...chapter,
                x,
                y,
                size,
                colorIndex: index % 6 // Increased modulus for more colors
            };
        });

        // 2. Collision Resolution
        const iterations = 50;
        const padding = 5; // Reduced padding for tighter packing

        for (let k = 0; k < iterations; k++) {
            for (let i = 0; i < generatedNodes.length; i++) {
                for (let j = i + 1; j < generatedNodes.length; j++) {
                    const n1 = generatedNodes[i];
                    const n2 = generatedNodes[j];

                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                    const minDistance = (n1.size / 2 + n2.size / 2) + padding;

                    if (distance < minDistance) {
                        const overlap = minDistance - distance;
                        const angle = Math.atan2(dy, dx);

                        // Push apart
                        const moveX = Math.cos(angle) * overlap * 0.5;
                        const moveY = Math.sin(angle) * overlap * 0.5;

                        n1.x += moveX;
                        n1.y += moveY;
                        n2.x -= moveX;
                        n2.y -= moveY;
                    }
                }
            }
        }

        return generatedNodes;
    }, [chapters]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch Handlers for Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch Start
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchDistance.current = dist;
        } else if (e.touches.length === 1) {
            setIsDragging(true);
            lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastTouchDistance.current !== null) {
            // Pinch Move
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = dist - lastTouchDistance.current;

            // Adjust sensitivity divisor as needed (e.g., / 200 for slower zoom)
            const zoomChange = delta * 0.005;

            setZoom(prev => Math.min(Math.max(prev + zoomChange, 0.4), 2.5));
            lastTouchDistance.current = dist;
            return;
        }

        if (!isDragging || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - lastMousePos.current.x;
        const dy = e.touches[0].clientY - lastMousePos.current.y;

        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        lastTouchDistance.current = null;
    };

    // Wheel Zoom Handler
    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2.5));
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

    // Reset View Handler
    const handleResetView = () => {
        setZoom(window.innerWidth < 768 ? 0.6 : 1);
        setPan({ x: 0, y: 0 });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    // Premium, Vibrant Color Palette
    const bubbleClasses = [
        "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 text-violet-700 dark:text-violet-300",
        "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300",
        "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
        "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-700 dark:text-amber-300",
        "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-700 dark:text-blue-300",
        "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-700 dark:text-rose-300",
    ];

    // Check if view is drifted
    const isDrifted = pan.x !== 0 || pan.y !== 0 || zoom !== 1;

    return (
        <div className="flex-1 overflow-hidden h-full relative flex flex-col">
            <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10 bg-fixed pointer-events-none opacity-60"></div>

            {/* Header */}
            <div className="flex-shrink-0 p-4 md:p-8 z-20 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="pointer-events-auto">
                        <nav className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
                            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/pyq-2026')}>2026 PYQ</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="text-text-light dark:text-text-dark font-medium">{subject}</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark flex items-center gap-3 tracking-tight">
                            <span className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-primary text-2xl">bubble_chart</span>
                            </span>
                            Select {subject} Chapter
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-4 pb-4 md:px-8 md:pb-8 flex flex-col overflow-hidden">
                {/* Visible Container for the Cloud */}
                <div
                    ref={containerRef}
                    className="flex-1 relative rounded-3xl border border-border-light/50 dark:border-border-dark/50 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-inner overflow-hidden cursor-grab active:cursor-grabbing hover:border-primary/20 transition-colors select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    // Touch Events
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                >
                    {/* Controls overlay - Hides on drag */}
                    <div className={`absolute bottom-24 md:bottom-6 right-4 md:right-6 z-30 flex flex-col gap-2 pointer-events-auto transition-opacity duration-300 ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {isDrifted && (
                            <button
                                onClick={handleResetView}
                                className="w-10 h-10 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95 mb-2"
                                title="Reset View"
                            >
                                <span className="material-symbols-outlined">center_focus_strong</span>
                            </button>
                        )}
                        <button onClick={handleZoomIn} className="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center justify-center text-text-light dark:text-text-dark hover:text-primary transition-colors hover:scale-110 active:scale-95">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button onClick={handleZoomOut} className="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center justify-center text-text-light dark:text-text-dark hover:text-primary transition-colors hover:scale-110 active:scale-95">
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                    </div>

                    {/* Draggable World */}
                    <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center will-change-transform"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                        }}
                    >
                        <div className="relative"> {/* Zero-size center point */}
                            {nodes.map((node, i) => {
                                // Random float animation delay
                                const delay = i % 5;
                                const floatClass = i % 2 === 0 ? 'chapter-float' : 'chapter-float-reverse';

                                // Theme Colors
                                const themeClass = bubbleClasses[node.colorIndex];

                                // Text Logic
                                const isLongName = node.name.length > 20;
                                // Use lower threshold for mobile so names appear sooner
                                const isZoomedIn = zoom > (window.innerWidth < 768 ? 0.8 : 1.2);
                                const shouldShowCode = isLongName && !isZoomedIn;

                                // Check State
                                const isThisChecking = checkingChapter === node.code;

                                return (
                                    <div
                                        key={node.code}
                                        title={node.name} // Native tooltip for full name
                                        className={`absolute rounded-full flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all duration-300 hover:z-50 hover:scale-110 shadow-sm backdrop-blur-sm border-2 ${themeClass} ${floatClass}`}
                                        style={{
                                            width: `${node.size}px`,
                                            height: `${node.size}px`,
                                            left: `${node.x}px`,
                                            top: `${node.y}px`,
                                            transform: 'translate(-50%, -50%)',
                                            animationDelay: `${delay}s`
                                        }}
                                        onClick={(e) => {
                                            if (Math.abs(e.clientX - lastMousePos.current.x) < 5 && Math.abs(e.clientY - lastMousePos.current.y) < 5) {
                                                // Only trigger click if we didnt drag much
                                                e.stopPropagation();
                                                handleChapterClick(node.code);
                                            }
                                        }}
                                    >
                                        <div className="pointer-events-none flex flex-col h-full justify-center items-center w-full overflow-hidden relative">
                                            {isThisChecking ? (
                                                <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full opacity-70"></div>
                                            ) : (
                                                <>
                                                    {isLongName ? (
                                                        <>
                                                            {/* Code View - Zoomed Out */}
                                                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${shouldShowCode ? 'opacity-100' : 'opacity-0'}`}>
                                                                <h3 className="text-xl md:text-2xl font-black tracking-tight opacity-90">
                                                                    {node.code}
                                                                </h3>
                                                            </div>
                                                            {/* Full Name View - Zoomed In */}
                                                            <div className={`absolute inset-0 flex items-center justify-center p-2 text-center transition-opacity duration-500 ease-in-out ${shouldShowCode ? 'opacity-0' : 'opacity-100'}`}>
                                                                <h3 className="text-[8px] md:text-[10px] font-medium leading-[1.1] break-words w-full font-sans tracking-wide">
                                                                    {node.name}
                                                                </h3>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <h3 className="text-[10px] md:text-xs font-bold leading-tight line-clamp-3 px-1 transition-all duration-300 break-all whitespace-normal">
                                                            {node.name}
                                                        </h3>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Coming Soon Popup */}
            {showComingSoon && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 px-6" style={{ zIndex: 9999 }}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowComingSoon(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 animate-in zoom-in-95 duration-300">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 to-violet-500/20 -z-10"></div>
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>

                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3 border border-slate-100 dark:border-slate-700">
                                <span className="material-symbols-outlined text-5xl text-primary bg-gradient-to-br from-primary to-violet-500 bg-clip-text text-transparent">rocket_launch</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Coming Soon!
                            </h3>

                            <div className="space-y-4 mb-8">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    Team <span className="text-primary font-bold">prepAIred</span> is meticulously crafting high-quality questions for <br />
                                    <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block text-sm border border-slate-200 dark:border-slate-700">
                                        {comingSoonChapterName}
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    In the meantime, feel free to explore and practice questions from other available chapters!
                                </p>
                            </div>

                            <button
                                onClick={() => setShowComingSoon(false)}
                                className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterSelection;
