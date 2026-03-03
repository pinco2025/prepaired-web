/**
 * Unified type definitions for Question components
 */

// Base option structure
export interface Option {
    id: string;
    text: string;
    image?: string | null;
}

// Question structure - unified across all contexts
export interface Question {
    id: string;
    uuid: string;
    text: string;
    image?: string | null;
    options: Option[];
    correctAnswer: string;
    // Optional metadata
    chapterCode?: string;
    topicCode?: string;
    year?: string;
    type?: 'MCQ' | 'Integer' | 'Numerical';
    section?: string;
    difficulty?: 'E' | 'M' | 'H';
}

// Solution structure
export interface Solution {
    id?: string;
    text: string;
    image?: string | null;
}

// Question status for palette
export type QuestionStatus =
    | 'not-visited'
    | 'answered'
    | 'not-answered'
    | 'marked-for-review'
    | 'correct'
    | 'wrong'
    | 'unattempted';

// Option status for display
export type OptionStatus =
    | 'default'
    | 'selected'
    | 'correct'
    | 'incorrect';

// Viewer mode
export type ViewerMode = 'practice' | 'test' | 'review' | 'paired';

// Layout variants
export type LayoutVariant = 'full' | 'compact' | 'split';
export type OptionsLayout = 'vertical' | 'grid';
export type PaletteVariant = 'sidebar' | 'overlay' | 'header';
