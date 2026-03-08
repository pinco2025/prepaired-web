import React from 'react';
import RenderMath from './RenderMath';
import ImageWithProgress from '../ImageWithProgress';
import { OptionStatus } from './types';

interface MCQOptionProps {
    id: string;
    text?: string;
    image?: string | null;
    selected?: boolean;
    disabled?: boolean;
    status?: OptionStatus;
    onClick?: () => void;
    optionLabel?: string; // A, B, C, D or custom label
}

/**
 * Single MCQ option button with configurable states.
 */
const MCQOption: React.FC<MCQOptionProps> = ({
    id,
    text,
    image,
    selected = false,
    disabled = false,
    status = 'default',
    onClick,
    optionLabel,
}) => {
    const label = optionLabel || id.toUpperCase();

    // Determine border and background colors based on status
    let borderClass = 'border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-background-light dark:hover:bg-white/5';
    let labelClass = 'border-text-secondary-light/30 text-text-secondary-light';

    if (status === 'correct') {
        borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/10';
        labelClass = 'border-green-500 bg-green-500 text-white';
    } else if (status === 'incorrect') {
        borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/10';
        labelClass = 'border-red-500 bg-red-500 text-white';
    } else if (status === 'selected' || selected) {
        borderClass = 'border-primary bg-primary/5';
        labelClass = 'border-primary bg-primary text-white';
    }

    return (
        <label
            className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] group ${borderClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
            onClick={disabled ? undefined : onClick}
        >
            {/* Option label circle */}
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold text-sm uppercase mt-0.5 transition-colors ${labelClass}`}
            >
                {selected || status === 'selected' || status === 'correct' ? (
                    <span className="material-symbols-outlined text-base">check</span>
                ) : status === 'incorrect' ? (
                    <span className="material-symbols-outlined text-base">close</span>
                ) : (
                    label
                )}
            </div>

            {/* Option content */}
            <div className="flex-1 min-w-0 whitespace-pre-wrap break-words overflow-hidden">
                {text && <RenderMath text={text} />}
                {image && (
                    <div className="mt-2 text-center flex justify-center">
                        <ImageWithProgress
                            src={image}
                            alt={`Option ${label}`}
                            className="max-w-full max-h-40 w-auto h-auto inline-block rounded-lg"
                        />
                    </div>
                )}
            </div>
        </label>
    );
};

export default MCQOption;
