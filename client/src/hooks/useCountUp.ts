import { useState, useEffect } from 'react';

const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = currentTime - startTime;

            if (progress < duration) {
                // easeOutExpo easing function: 1 - pow(2, -10 * t)
                const t = progress / duration;
                const easeOut = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

                setCount(Math.round(end * easeOut));
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [end, duration]);

    return count;
};

export default useCountUp;
