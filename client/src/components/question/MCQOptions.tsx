import React from 'react';
import MCQOption from './MCQOption';
import { Option, OptionStatus, OptionsLayout } from './types';

interface MCQOptionsProps {
    options: Option[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    disabled?: boolean;
    showResult?: boolean;
    correctAnswerId?: string;
    layout?: OptionsLayout;
}

/**
 * Container for multiple MCQ options with layout variants.
 */
const MCQOptions: React.FC<MCQOptionsProps> = ({
    options,
    selectedId,
    onSelect,
    disabled = false,
    showResult = false,
    correctAnswerId,
    layout = 'vertical',
}) => {
    const getOptionStatus = (optionId: string): OptionStatus => {
        if (!showResult) {
            return selectedId === optionId ? 'selected' : 'default';
        }

        // Result mode - show correct/incorrect
        const isCorrect = correctAnswerId?.toLowerCase() === optionId.toLowerCase();
        const isSelected = selectedId === optionId;

        if (isCorrect) return 'correct';
        if (isSelected && !isCorrect) return 'incorrect';
        return 'default';
    };

    const gridClasses =
        layout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
            : 'flex flex-col gap-4';

    return (
        <div className={gridClasses}>
            {options.map((option, index) => (
                <MCQOption
                    key={option.id}
                    id={option.id}
                    text={option.text}
                    image={option.image}
                    selected={selectedId === option.id}
                    disabled={disabled || showResult}
                    status={getOptionStatus(option.id)}
                    onClick={() => onSelect(option.id)}
                    optionLabel={String.fromCharCode(65 + index)} // A, B, C, D...
                />
            ))}
        </div>
    );
};

export default MCQOptions;
