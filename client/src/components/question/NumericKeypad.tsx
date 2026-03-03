import React from 'react';

interface NumericKeypadProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
    correctAnswer?: string;
    compact?: boolean;
}

/**
 * Numeric keypad for integer/numerical type questions.
 * Supports both practice mode (with result feedback) and test mode (compact).
 */
const NumericKeypad: React.FC<NumericKeypadProps> = ({
    value,
    onChange,
    disabled = false,
    showResult = false,
    isCorrect = false,
    correctAnswer,
    compact = false,
}) => {
    const handleKeyPress = (key: string) => {
        if (disabled) return;

        if (key === 'backspace') {
            onChange(value.slice(0, -1));
        } else if (key === '.' && !value.includes('.')) {
            onChange(value + key);
        } else if (key === '-' && value === '') {
            onChange('-');
        } else if (key !== '.' && key !== '-') {
            // Limit to reasonable length
            if (value.replace('-', '').replace('.', '').length < 10) {
                onChange(value + key);
            }
        }
    };

    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['-', '0', '.'],
    ];

    const sizeClasses = compact
        ? { button: 'h-10 text-base', display: 'py-2 text-lg', gap: 'gap-2' }
        : { button: 'h-11 md:h-12 text-lg md:text-xl', display: 'py-3 text-xl md:text-2xl', gap: 'gap-1.5 md:gap-2' };

    return (
        <div className="w-full max-w-xs mx-auto">
            {/* Display */}
            <div
                className={`mb-3 px-4 rounded-xl border-2 text-center font-mono transition-all ${sizeClasses.display} ${showResult
                        ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'border-border-light dark:border-border-dark bg-background-light dark:bg-white/5 text-text-light dark:text-text-dark'
                    }`}
            >
                {value || <span className="text-text-secondary-light/50">Enter answer</span>}
            </div>

            {/* Show correct answer when result is displayed and wrong */}
            {showResult && !isCorrect && correctAnswer && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Correct: <span className="font-bold font-mono">{correctAnswer}</span>
                    </span>
                </div>
            )}

            {/* Keypad Grid */}
            <div className={`grid grid-cols-3 ${sizeClasses.gap}`}>
                {keys.map((row, rowIdx) =>
                    row.map((key, keyIdx) => (
                        <button
                            key={`${rowIdx}-${keyIdx}`}
                            onClick={() => handleKeyPress(key)}
                            disabled={disabled}
                            className={`${sizeClasses.button} rounded-lg font-bold transition-all active:scale-95 ${disabled
                                    ? 'opacity-50 cursor-not-allowed bg-background-light dark:bg-white/5 text-text-secondary-light'
                                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary hover:bg-primary/5 text-text-light dark:text-text-dark shadow-sm'
                                }`}
                        >
                            {key === '-' ? '−' : key}
                        </button>
                    ))
                )}
            </div>

            {/* Backspace Button */}
            <button
                onClick={() => handleKeyPress('backspace')}
                disabled={disabled || !value}
                className={`w-full mt-1.5 md:mt-2 h-10 md:h-11 rounded-lg flex items-center justify-center gap-1 text-sm transition-all active:scale-[0.98] ${disabled || !value
                        ? 'opacity-50 cursor-not-allowed bg-background-light dark:bg-white/5 text-text-secondary-light'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}
            >
                <span className="material-symbols-outlined text-lg">backspace</span>
                <span className="font-medium">Clear</span>
            </button>
        </div>
    );
};

export default NumericKeypad;
