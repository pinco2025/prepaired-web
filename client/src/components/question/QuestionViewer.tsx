import React from 'react';
import QuestionCard from './QuestionCard';
import MCQOptions from './MCQOptions';
import NumericKeypad from './NumericKeypad';
import SolutionDisplay from './SolutionDisplay';
import { Question, Solution, ViewerMode, OptionsLayout } from './types';

interface QuestionViewerProps {
    mode: ViewerMode;
    question: Question;
    solution?: Solution;

    // Answer handling
    selectedAnswer?: string | null;
    numericAnswer?: string;
    onAnswerChange?: (answer: string) => void;
    onNumericAnswerChange?: (answer: string) => void;

    // Result display
    showResult?: boolean;
    isCorrect?: boolean;

    // Navigation (optional - can be external)
    onNext?: () => void;
    onPrevious?: () => void;
    canGoNext?: boolean;
    canGoPrevious?: boolean;

    // Customization
    questionNumber?: number;
    totalQuestions?: number;
    hideNavigation?: boolean;
    hideSolution?: boolean;
    optionsLayout?: OptionsLayout;

    // Metadata
    chapterName?: string;
}

/**
 * Type for questions that can be checked for integer type.
 * More permissive than Question to allow different local types.
 */
interface QuestionLike {
    options?: { id: string; text?: string; image?: string | null }[];
    correctAnswer?: string;
}

/**
 * Helper to detect if a question is integer/numerical type.
 */
const isIntegerTypeQuestion = (question: QuestionLike): boolean => {
    // Check if options are empty or all have empty text
    const hasValidOptions =
        question.options &&
        question.options.length > 0 &&
        question.options.some((opt) => opt.text?.trim() || opt.image);

    if (!hasValidOptions) {
        return true;
    }

    // Numeric correct answer (not a single letter like a, b, c, d) = integer type
    const answer = question.correctAnswer?.trim();
    if (
        answer &&
        !['a', 'b', 'c', 'd'].includes(answer.toLowerCase()) &&
        !isNaN(parseFloat(answer))
    ) {
        return true;
    }

    return false;
};

/**
 * Main unified question viewer component.
 * Composes QuestionCard, MCQOptions/NumericKeypad, and SolutionDisplay.
 */
const QuestionViewer: React.FC<QuestionViewerProps> = ({
    mode,
    question,
    solution,
    selectedAnswer = null,
    numericAnswer = '',
    onAnswerChange,
    onNumericAnswerChange,
    showResult = false,
    isCorrect = false,
    onNext,
    onPrevious,
    canGoNext = true,
    canGoPrevious = true,
    questionNumber,
    totalQuestions,
    hideNavigation = false,
    hideSolution = false,
    optionsLayout = 'grid',
    chapterName,
}) => {
    const isInteger = isIntegerTypeQuestion(question);

    // Determine question type for metadata
    const questionType = isInteger ? 'Integer' : 'MCQ';

    // Handle option selection
    const handleOptionSelect = (optionId: string) => {
        if (onAnswerChange) {
            // Toggle behavior - if same option clicked, deselect
            const newSelection = selectedAnswer === optionId ? '' : optionId;
            onAnswerChange(newSelection);
        }
    };

    // Check if numeric answer is correct
    const isNumericCorrect =
        isInteger && showResult && numericAnswer.trim() === question.correctAnswer?.trim();

    return (
        <div className="space-y-4">
            {/* Question display */}
            <QuestionCard
                text={question.text}
                image={question.image}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                metadata={{
                    chapter: chapterName,
                    year: question.year,
                    difficulty: question.difficulty,
                    type: questionType,
                    section: question.section,
                }}
            />

            {/* Answer section */}
            {isInteger ? (
                <div className="py-4">
                    <NumericKeypad
                        value={numericAnswer}
                        onChange={onNumericAnswerChange || (() => { })}
                        disabled={showResult}
                        showResult={showResult}
                        isCorrect={isNumericCorrect}
                        correctAnswer={question.correctAnswer}
                        compact={mode === 'test'}
                    />
                </div>
            ) : (
                <MCQOptions
                    options={question.options}
                    selectedId={selectedAnswer}
                    onSelect={handleOptionSelect}
                    disabled={showResult && mode !== 'review'}
                    showResult={showResult}
                    correctAnswerId={question.correctAnswer}
                    layout={optionsLayout}
                />
            )}

            {/* Solution display (practice/review modes) */}
            {!hideSolution && solution && (mode === 'practice' || mode === 'review') && (
                <SolutionDisplay
                    text={solution.text}
                    image={solution.image}
                    visible={showResult}
                />
            )}

            {/* Navigation buttons (optional) */}
            {!hideNavigation && (onNext || onPrevious) && (
                <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                    <button
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Previous
                    </button>

                    <button
                        onClick={onNext}
                        disabled={!canGoNext}
                        className="flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionViewer;
export { isIntegerTypeQuestion };
