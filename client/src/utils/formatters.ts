export const formatDuration = (seconds: number): string => {
    if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.round((seconds % 3600) / 60);
        if (minutes === 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        return `${hours}h ${minutes}m`;
    }
    if (seconds >= 60) {
        return `${Math.floor(seconds / 60)} minutes`;
    }
    return `${seconds} seconds`;
};
