import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PercentileDistributionGraph from './PercentileDistributionGraph';

// ─── Types (matching API /parse-pdf response) ────────────────────────────────

interface ParsedQuestion {
    q_num: string;
    question_id?: string;
    option_1_id?: string;
    option_2_id?: string;
    option_3_id?: string;
    option_4_id?: string;
    chosen_option?: string | null;
    given_answer?: string | null;
    status?: string;
    // These fields exist in the scored format (output.json)
    subject?: string;
    marks_scored?: number;
    correct_option?: string | null;
}

interface ScoredSection {
    subject: string;
    stats: {
        total_questions: number;
        answered: number;
        unanswered: number;
        total_correct: number;
        total_incorrect: number;
        total_marks: number;
    };
    questions: ParsedQuestion[];
}

interface PercentileBracket {
    percentile: number;
    marks: number;
}

interface PercentileBracketPair {
    score: number;
    nearest_above: PercentileBracket | null;
    nearest_below: PercentileBracket | null;
}

interface PercentileReport {
    overall: PercentileBracketPair;
    subjects: {
        Mathematics: PercentileBracketPair;
        Physics: PercentileBracketPair;
        Chemistry: PercentileBracketPair;
    };
}

interface ParsedResult {
    filename: string;
    metadata: {
        exam_title?: string;
        application_no?: string;
        candidate_name?: string;
        roll_no?: string;
        test_date?: string;
        test_time?: string;
        subject?: string;
        sections: string[];
    };
    stats: {
        total_questions: number;
        answered: number;
        unanswered: number;
        total_correct?: number;
        total_incorrect?: number;
        total_marks?: number;
    };
    // Raw parse format has flat questions array
    questions?: ParsedQuestion[];
    // Scored format has sections array
    sections?: ScoredSection[];
    // Percentile report from the scoring worker
    percentile_report?: PercentileReport | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
    Physics: { bar: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500' },
    Chemistry: { bar: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500' },
    Mathematics: { bar: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500' },
    Unknown: { bar: 'bg-gray-400', bg: 'bg-gray-400/10', text: 'text-gray-400' },
};

function getColors(subject: string) {
    return SUBJECT_COLORS[subject] || SUBJECT_COLORS.Unknown;
}

/** Check whether the result data is in "scored" format (has sections with marks) */
function isScored(data: ParsedResult): boolean {
    return !!data.sections && data.sections.length > 0 && data.stats.total_marks !== undefined;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const QuestionTypeBreakdown: React.FC<{ questions: ParsedQuestion[] }> = ({ questions }) => {
    const stats = useMemo(() => {
        let mcqAttempted = 0;
        let mcqTotal = 0;
        let saAttempted = 0;
        let saTotal = 0;

        questions.forEach(q => {
            // Usually, SA questions might have 'SA' in their q_num or lacking option IDs
            const isSA = q.q_num.includes('SA') || q.q_num.includes('Integer') || (!q.option_1_id && !q.option_2_id);
            if (isSA) {
                saTotal++;
                if (q.given_answer || q.chosen_option) saAttempted++;
            } else {
                mcqTotal++;
                if (q.chosen_option || q.given_answer) mcqAttempted++;
            }
        });

        return { mcqAttempted, mcqTotal, saAttempted, saTotal };
    }, [questions]);

    return (
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 h-full items-stretch justify-center py-2">
            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:border-primary transition-colors cursor-default">
                <span className="text-2xl sm:text-3xl font-black text-text-light dark:text-text-dark font-display">
                    {stats.mcqAttempted}<span className="text-sm sm:text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium leading-none">/{stats.mcqTotal}</span>
                </span>
                <span className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase mt-1 sm:mt-2 text-center tracking-wider">
                    MCQ Attempted
                </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:border-accent transition-colors cursor-default">
                <span className="text-2xl sm:text-3xl font-black text-text-light dark:text-text-dark font-display">
                    {stats.saAttempted}<span className="text-sm sm:text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium leading-none">/{stats.saTotal}</span>
                </span>
                <span className="text-[10px] sm:text-xs text-text-secondary-light dark:text-text-secondary-dark font-bold uppercase mt-1 sm:mt-2 text-center tracking-wider">
                    Integer Attempted
                </span>
            </div>
        </div>
    );
};

const AccuracyRing: React.FC<{ correct: number; attempted: number }> = ({ correct, attempted }) => {
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const circumference = 2 * Math.PI * 15.9155;
    const dashArray = `${(accuracy / 100) * circumference}, ${circumference}`;

    return (
        <div className="relative w-28 h-28 mx-auto">
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path
                    className="text-gray-100 dark:text-gray-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                />
                <path
                    className="text-primary drop-shadow-md"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={dashArray}
                    style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-xl font-bold text-text-light dark:text-text-dark block">{accuracy}%</span>
                <span className="text-[10px] uppercase text-text-secondary-light dark:text-text-secondary-dark font-semibold">Accuracy</span>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ResponseResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { resultData?: ParsedResult; examDate?: string; shift?: string } | null;

    const data: ParsedResult | null = state?.resultData || null;
    const examDate = state?.examDate || '';
    const shift = state?.shift || '';

    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    const scored = data ? isScored(data) : false;

    // Build subject sections from either format
    const subjectSections = useMemo(() => {
        if (!data) return [];
        if (scored && data.sections) {
            return data.sections;
        }
        // Raw parse format — questions are flat, group by index ranges
        // JEE: Q1–25 = subject from metadata, Q26–50, Q51–75
        // Without answer key, we don't know the subject, so show as "All Questions"
        const allQs = data.questions || [];
        return [{
            subject: 'All Questions',
            stats: {
                total_questions: data.stats.total_questions,
                answered: data.stats.answered,
                unanswered: data.stats.unanswered,
                total_correct: 0,
                total_incorrect: 0,
                total_marks: 0,
            },
            questions: allQs,
        }];
    }, [data, scored]);

    // Aggregate totals from sections
    const totalStats = useMemo(() => {
        if (!data) {
            return {
                total_questions: 0,
                answered: 0,
                unanswered: 0,
                total_correct: 0,
                total_incorrect: 0,
                total_marks: 0,
            };
        }
        if (scored) {
            return {
                total_questions: data.stats.total_questions,
                answered: data.stats.answered,
                unanswered: data.stats.unanswered,
                total_correct: data.stats.total_correct || 0,
                total_incorrect: data.stats.total_incorrect || 0,
                total_marks: data.stats.total_marks || 0,
            };
        }
        return {
            total_questions: data.stats.total_questions,
            answered: data.stats.answered,
            unanswered: data.stats.unanswered,
            total_correct: 0,
            total_incorrect: 0,
            total_marks: 0,
        };
    }, [data, scored]);

    // Calculate all questions for the breakdown
    const allQuestionsFlat = useMemo(() => {
        if (!data) return [];
        if (data.questions && data.questions.length > 0) return data.questions;
        if (data.sections) {
            return data.sections.flatMap(s => s.questions);
        }
        return [];
    }, [data]);

    // Redirect back if no data
    if (!data) {
        return (
            <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col items-center justify-center gap-6 p-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">error_outline</span>
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">No Results Found</h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-xs">
                        Please upload a response sheet first to see your analysis.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/response-upload')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all"
                >
                    <span className="material-symbols-outlined text-lg">upload_file</span>
                    Upload Response Sheet
                </button>
            </div>
        );
    }
    const totalMarks = 300;
    const scorePct = totalMarks > 0 ? (totalStats.total_marks / totalMarks) * 100 : 0;

    const statusColor = (s?: string) => {
        if (!s) return 'text-text-secondary-light dark:text-text-secondary-dark';
        const lower = s.toLowerCase();
        if (lower.includes('answered') && !lower.includes('not')) return 'text-primary';
        if (lower.includes('not answered')) return 'text-text-secondary-light dark:text-text-secondary-dark';
        if (lower.includes('review')) return 'text-amber-500';
        return 'text-text-secondary-light dark:text-text-secondary-dark';
    };

    const statusBg = (s?: string) => {
        if (!s) return 'bg-gray-100 dark:bg-gray-800';
        const lower = s.toLowerCase();
        if (lower.includes('answered') && !lower.includes('not')) return 'bg-primary/10';
        if (lower.includes('not answered')) return 'bg-gray-100 dark:bg-gray-800';
        if (lower.includes('review')) return 'bg-amber-500/10';
        return 'bg-gray-100 dark:bg-gray-800';
    };

    const marksColor = (marks?: number) => {
        if (marks === undefined) return 'text-text-secondary-light dark:text-text-secondary-dark';
        if (marks > 0) return 'text-success-light dark:text-success-dark';
        if (marks < 0) return 'text-error-light dark:text-error-dark';
        return 'text-text-secondary-light dark:text-text-secondary-dark';
    };

    const examTitle = data.metadata?.exam_title || 'JEE Mains 2026';

    return (
        <div className="h-[calc(100vh-56px)] md:h-screen overflow-y-auto scrollbar-premium">
            <div className="w-full max-w-[1200px] mx-auto p-3 sm:p-4 md:p-8 flex flex-col gap-4 sm:gap-6 pb-12">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {examDate && (
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                    {examDate} {shift && `• ${shift.replace(/\(.+\)/, '').trim()}`}
                                </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-success-light/10 dark:bg-success-dark/10 text-success-light dark:text-success-dark text-xs font-bold uppercase tracking-wide">
                                {scored ? 'Scored' : 'Parsed'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark font-display">
                            {examTitle}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Analysis</span>
                        </h1>
                        {data.metadata?.candidate_name && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                {data.metadata.candidate_name}
                                {data.metadata.roll_no && ` • ${data.metadata.roll_no}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Score Summary Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Overall Score / Parsed Stats */}
                    <div className="glass-card p-5 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-7xl text-primary">
                                {scored ? 'emoji_events' : 'description'}
                            </span>
                        </div>
                        <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-xs uppercase tracking-wider">
                            {scored ? 'Overall Score' : 'Parse Summary'}
                        </h3>
                        {scored ? (
                            <>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-text-light dark:text-text-dark tracking-tight font-display">
                                        {totalStats.total_marks}
                                    </span>
                                    <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium">/ {totalMarks}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-success-light dark:text-success-dark font-medium">
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        {totalStats.total_correct} correct
                                    </span>
                                    <span className="flex items-center gap-1 text-error-light dark:text-error-dark font-medium">
                                        <span className="material-symbols-outlined text-base">cancel</span>
                                        {totalStats.total_incorrect} wrong
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-text-light dark:text-text-dark tracking-tight font-display">
                                    {totalStats.total_questions}
                                </span>
                                <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium">questions found</span>
                            </div>
                        )}
                    </div>

                    {/* Question Type Breakdown */}
                    <div className="glass-card p-5 flex flex-col justify-center relative min-h-[140px]">
                        <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-xs uppercase tracking-wider mb-2">
                            Question Breakdown
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                            <QuestionTypeBreakdown questions={allQuestionsFlat} />
                        </div>
                    </div>

                    {/* Attempt Summary */}
                    <div className="glass-card p-5 sm:col-span-2 lg:col-span-1">
                        <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-xs uppercase tracking-wider mb-4">
                            Attempt Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total Qs', value: totalStats.total_questions, icon: 'help_outline', color: 'text-primary' },
                                { label: 'Answered', value: totalStats.answered, icon: 'edit_note', color: 'text-primary' },
                                ...(scored ? [
                                    { label: 'Correct', value: totalStats.total_correct, icon: 'check_circle', color: 'text-success-light dark:text-success-dark' },
                                ] : []),
                                { label: 'Unanswered', value: totalStats.unanswered, icon: 'remove_circle_outline', color: 'text-text-secondary-light dark:text-text-secondary-dark' },
                                ...(scored ? [
                                    { label: 'Wrong', value: totalStats.total_incorrect, icon: 'cancel', color: 'text-error-light dark:text-error-dark' },
                                ] : []),
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-2.5">
                                    <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                                    <div>
                                        <p className="text-lg font-bold text-text-light dark:text-text-dark">{stat.value}</p>
                                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase tracking-wide">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Subject-wise Performance (scored only) + Accuracy ───────────── */}
                {scored && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Subject Bars */}
                        <div className="lg:col-span-2 glass-card p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-text-light dark:text-text-dark font-display">Subject-wise Performance</h3>
                                <div className="flex gap-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    {subjectSections.map(s => {
                                        const c = getColors(s.subject);
                                        return (
                                            <div key={s.subject} className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${c.bar}`} />
                                                {s.subject}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-5">
                                {subjectSections.map(sec => {
                                    const maxMarks = sec.stats.total_questions * 4;
                                    const pct = maxMarks > 0 ? (sec.stats.total_marks / maxMarks) * 100 : 0;
                                    const colors = getColors(sec.subject);
                                    return (
                                        <div key={sec.subject} className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-text-light dark:text-text-dark">{sec.subject}</span>
                                                <span className="text-text-light dark:text-text-dark font-bold">{sec.stats.total_marks} / {maxMarks}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                                <div className={`h-full rounded-full ${colors.bar} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                <span>{sec.stats.total_correct} correct</span>
                                                <span>{sec.stats.total_incorrect} wrong</span>
                                                <span>{sec.stats.unanswered} skipped</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Accuracy Ring */}
                        <div className="glass-card p-5 flex flex-col gap-5">
                            <h3 className="text-base font-bold text-text-light dark:text-text-dark font-display">Accuracy & Stats</h3>
                            <AccuracyRing correct={totalStats.total_correct} attempted={totalStats.answered} />
                            <div className="space-y-3 mt-2">
                                {subjectSections.map(sec => {
                                    const attempted = sec.stats.answered;
                                    const accuracy = attempted > 0 ? Math.round((sec.stats.total_correct / attempted) * 100) : 0;
                                    const colors = getColors(sec.subject);
                                    return (
                                        <div key={sec.subject} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
                                                <span className="text-text-light dark:text-text-dark">{sec.subject}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-text-light dark:text-text-dark">{accuracy}%</span>
                                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-1">
                                                    ({sec.stats.total_correct}/{attempted})
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Percentile Distribution Graph (scored + has report) ────────── */}
                {scored && data.percentile_report && (
                    <PercentileDistributionGraph percentileReport={data.percentile_report} totalMarks={totalMarks} />
                )}

                {/* ── Question Breakdown ──────────────────────────────────────────── */}
                <div className="glass-card p-5">
                    <h3 className="text-base font-bold text-text-light dark:text-text-dark font-display mb-1">
                        Question-wise Breakdown
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        {scored ? 'Tap a subject to expand the detailed question list.' : 'All questions extracted from your response sheet.'}
                    </p>

                    <div className="space-y-3">
                        {subjectSections.map(sec => {
                            const isExpanded = expandedSubject === sec.subject;
                            const colors = getColors(sec.subject);
                            return (
                                <div key={sec.subject} className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                                    {/* Subject Header */}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedSubject(isExpanded ? null : sec.subject)}
                                        className={`w-full flex items-center justify-between p-3 sm:p-4 transition-colors ${isExpanded ? colors.bg : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${colors.bar}`} />
                                            <span className="text-sm font-bold text-text-light dark:text-text-dark">{sec.subject}</span>
                                            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                {scored && `${sec.stats.total_marks} marks • `}{sec.questions.length} questions
                                            </span>
                                        </div>
                                        <span className={`material-symbols-outlined text-lg text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>

                                    {/* Questions Table */}
                                    {isExpanded && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-t border-border-light dark:border-border-dark whitespace-nowrap">
                                                        <th className="text-left px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Q#</th>
                                                        <th className="text-center px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Your Answer</th>
                                                        {scored && (
                                                            <th className="text-center px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Correct</th>
                                                        )}
                                                        <th className="text-center px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Status</th>
                                                        {scored && (
                                                            <th className="text-right px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">Marks</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sec.questions.map((q, i) => {
                                                        const userAnswer = q.chosen_option || q.given_answer || null;
                                                        return (
                                                            <tr
                                                                key={q.question_id || q.q_num}
                                                                className={`border-t border-border-light/50 dark:border-border-dark/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${i % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-800/10'}`}
                                                            >
                                                                <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-text-light dark:text-text-dark font-mono text-xs">
                                                                    {q.q_num}
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">
                                                                    <span className={`inline-flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap
                                                                        ${userAnswer
                                                                            ? (scored && q.marks_scored !== undefined
                                                                                ? (q.marks_scored > 0 ? 'bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark' : 'bg-error-light/10 text-error-light dark:bg-error-dark/10 dark:text-error-dark')
                                                                                : 'bg-primary/10 text-primary')
                                                                            : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark'
                                                                        }`}>
                                                                        {userAnswer ?? '—'}
                                                                    </span>
                                                                </td>
                                                                {scored && (
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">
                                                                        <span className="inline-flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-xs font-bold bg-primary/10 text-primary whitespace-nowrap">
                                                                            {q.correct_option ?? '—'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-center">
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${statusBg(q.status)} ${statusColor(q.status)}`}>
                                                                        {q.status || 'Unknown'}
                                                                    </span>
                                                                </td>
                                                                {scored && (
                                                                    <td className={`px-2 sm:px-4 py-2 sm:py-2.5 text-right font-bold text-xs sm:text-sm whitespace-nowrap ${marksColor(q.marks_scored)}`}>
                                                                        {q.marks_scored !== undefined ? (q.marks_scored > 0 ? `+${q.marks_scored}` : q.marks_scored) : '—'}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
                <div className="glass-card p-4 sm:p-6 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark font-display">
                                Want to analyze another attempt?
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                Upload a different response sheet to compare your performance across shifts.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/response-upload')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">upload_file</span>
                            Upload New PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponseResult;
