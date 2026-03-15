import React from 'react';
import RenderMath from './RenderMath';
import ImageWithProgress from '../ImageWithProgress';

interface SolutionDisplayProps {
    text?: string;
    image?: string | null;
    visible: boolean;
    variant?: 'default' | 'compact' | 'inline';
    title?: string;
}

/**
 * Solution/explanation display component.
 */
const SolutionDisplay: React.FC<SolutionDisplayProps> = ({
    text,
    image,
    visible,
    variant = 'default',
    title = 'Detailed Solution',
}) => {
    if (!visible || (!text && !image)) return null;

    const containerClasses = {
        default:
            'mt-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4',
        compact:
            'mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-in fade-in',
        inline:
            'mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 animate-in fade-in slide-in-from-bottom-2',
    };

    const titleClasses = {
        default: 'font-bold text-slate-700 dark:text-slate-300 mb-3',
        compact: 'font-semibold text-slate-700 dark:text-slate-300 mb-2 text-sm',
        inline: 'font-bold text-indigo-900 dark:text-indigo-300 mb-2 text-sm',
    };

    const hideScrollbarStyle = {
        msOverflowStyle: 'none' as const,
        scrollbarWidth: 'none' as const,
    };

    return (
        <div className={`${containerClasses[variant]} overflow-x-auto [&::-webkit-scrollbar]:hidden`} style={hideScrollbarStyle}>
            <h3 className={titleClasses[variant]}>{title}</h3>
            <div className="prose dark:prose-invert max-w-none text-sm md:text-base text-text-light dark:text-text-dark break-words whitespace-pre-wrap overflow-x-auto [&::-webkit-scrollbar]:hidden" style={hideScrollbarStyle}>
                {text && (
                    <div>
                        <RenderMath text={text} />
                    </div>
                )}

                {image && (
                    <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-full bg-white p-2 w-fit mx-auto flex justify-center">
                        <ImageWithProgress
                            src={image}
                            alt="Solution"
                            className="max-w-full md:max-w-lg max-h-[30vh] w-auto h-auto rounded-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SolutionDisplay;
