import React from 'react';
import RenderMath from './RenderMath';
import ImageWithProgress from '../ImageWithProgress';

interface QuestionCardProps {
    text: string;
    image?: string | null;
    questionNumber?: number;
    totalQuestions?: number;
    metadata?: {
        chapter?: string;
        year?: string;
        difficulty?: 'E' | 'M' | 'H';
        type?: 'MCQ' | 'Integer' | 'Numerical';
        section?: string;
    };
}

/**
 * Main question display component (text + image + metadata badges).
 */
const QuestionCard: React.FC<QuestionCardProps> = ({
    text,
    image,
    questionNumber,
    totalQuestions,
    metadata,
}) => {
    const getDifficultyBadge = (difficulty: 'E' | 'M' | 'H') => {
        const config = {
            E: {
                label: 'Easy',
                color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
            },
            M: {
                label: 'Medium',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
            },
            H: {
                label: 'Hard',
                color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
            },
        };

        const { label, color } = config[difficulty];
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${color}`}>
                {label}
            </span>
        );
    };

    const getTypeBadge = (type: 'MCQ' | 'Integer' | 'Numerical') => {
        const label = type === 'MCQ' ? 'Single Correct Type' : 'Integer Type';
        return (
            <div className="inline-block px-3 py-1 bg-background-light dark:bg-white/5 rounded-lg text-xs font-bold text-text-secondary-light uppercase tracking-widest">
                {label}
            </div>
        );
    };

    return (
        <div className="mb-4">
            {/* Type badge */}
            {metadata?.type && (
                <div className="mb-4">
                    {getTypeBadge(metadata.type)}
                </div>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-xs text-text-secondary-light">
                {questionNumber !== undefined && totalQuestions !== undefined && (
                    <span className="font-medium">
                        Q{questionNumber} of {totalQuestions}
                    </span>
                )}
                {metadata?.section && (
                    <span className="px-2 py-0.5 bg-background-light dark:bg-white/5 rounded-md font-medium">
                        {metadata.section}
                    </span>
                )}
                {metadata?.chapter && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                        {metadata.chapter}
                    </span>
                )}
                {metadata?.year && (
                    <span className="font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        {metadata.year}
                    </span>
                )}
                {metadata?.difficulty && getDifficultyBadge(metadata.difficulty)}
            </div>

            {/* Question text */}
            <div className="text-lg md:text-xl font-medium leading-relaxed text-text-light dark:text-text-dark mb-2 whitespace-pre-wrap break-words">
                <RenderMath text={text} />
            </div>

            {/* Question image */}
            {image && (
                <div className="p-4 bg-white rounded-xl border border-gray-200 mt-2 w-fit mx-auto flex justify-center max-w-full">
                    <ImageWithProgress
                        src={image}
                        alt="Question"
                        className="max-w-full md:max-w-xl max-h-[35vh] w-auto h-auto rounded-lg"
                    />
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
