import { useEffect } from 'react';

/**
 * Custom hook to set the document title (browser tab title)
 * @param title - The title to display in the browser tab
 * @param includeAppName - Whether to append " | prepAIred" to the title (default: true)
 */
export const usePageTitle = (title: string, includeAppName: boolean = true) => {
    useEffect(() => {
        const fullTitle = includeAppName ? `${title} | prepAIred` : title;
        document.title = fullTitle;

        // Cleanup: reset to default title when component unmounts
        return () => {
            document.title = 'prepAIred';
        };
    }, [title, includeAppName]);
};

export default usePageTitle;
