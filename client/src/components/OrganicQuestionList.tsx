import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAllOrganicQuestions } from '../data/organicQuestions';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Grid page listing all organic questions with links to individual pages.
 * Route: /questions/organic
 */
const OrganicQuestionList: React.FC = () => {
    const questions = getAllOrganicQuestions();
    usePageTitle('Organic Chemistry Questions - JEE & NEET');

    const stripLatex = (text: string) =>
        text.replace(/\$\$[\s\S]+?\$\$/g, '').replace(/\$[\s\S]+?\$/g, '')
            .replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\textbf\{([^}]*)\}/g, '$1')
            .replace(/\\[a-zA-Z]+/g, '').replace(/[{}\\^_]/g, '').trim();

    return (
        <>
            <Helmet>
                <title>Organic Chemistry Questions with Solutions | JEE & NEET | prepAIred</title>
                <meta name="description" content="Practice curated organic chemistry questions from JEE Main, JEE Advanced and NEET exams. Haloalkanes, haloarenes, reaction mechanisms — each with detailed step-by-step solutions. Free access on prepAIred." />
                <meta name="keywords" content="organic chemistry questions, JEE chemistry, NEET chemistry, haloalkanes, haloarenes, reaction mechanism, practice questions, solved examples, prepAIred" />
                <link rel="canonical" href="https://www.prepaired.site/questions/organic" />
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Organic Chemistry Questions with Solutions | prepAIred" />
                <meta property="og:description" content="Practice curated organic chemistry questions from JEE & NEET with detailed solutions." />
                <meta property="og:url" content="https://www.prepaired.site/questions/organic" />
                <meta property="og:site_name" content="prepAIred" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Organic Chemistry Questions | prepAIred" />
                <meta name="twitter:description" content="Practice curated organic chemistry questions from JEE & NEET with detailed solutions." />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org", "@type": "CollectionPage",
                    "name": "Organic Chemistry Practice Questions",
                    "description": "Curated organic chemistry questions from JEE and NEET exams with detailed solutions.",
                    "url": "https://www.prepaired.site/questions/organic",
                    "provider": { "@type": "Organization", "name": "prepAIred", "url": "https://www.prepaired.site" },
                    "numberOfItems": questions.length, "isAccessibleForFree": true
                })}</script>
            </Helmet>

            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none grid-bg-light dark:grid-bg-dark opacity-40"></div>
                <div className="flex-1 overflow-y-auto p-3 md:p-10 relative z-10">
                    <div className="mx-auto max-w-6xl flex flex-col gap-8 pb-20">

                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            <Link to="/question-set" className="hover:text-primary transition-colors">Question Sets</Link>
                            <span className="material-symbols-outlined text-[12px] md:text-[14px]">chevron_right</span>
                            <span className="text-text-light dark:text-text-dark font-medium">Organic Questions</span>
                        </nav>

                        {/* Header */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary text-xs md:text-sm font-bold mb-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[18px] md:text-[20px]">eco</span>
                                <span>Free Access</span>
                            </div>
                            <h1 className="text-text-light dark:text-text-dark text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                                Organic Chemistry Questions
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm md:text-base font-normal leading-normal max-w-2xl mt-1 md:mt-2">
                                Curated questions from JEE & NEET covering haloalkanes, haloarenes, and reaction mechanisms — each with a detailed solution.
                            </p>
                        </div>

                        {/* Question Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {questions.map((entry, index) => {
                                const preview = stripLatex(entry.question.text).slice(0, 100);
                                return (
                                    <Link
                                        key={entry.slug}
                                        to={`/question/${entry.slug}`}
                                        className="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgb(19,91,236,0.08)] hover:border-primary/30 transition-all duration-300 p-3.5 sm:p-5"
                                    >
                                        {/* Question number badge */}
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                                                    Q{index + 1}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {entry.examSource && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                        {entry.examSource}
                                                    </span>
                                                )}
                                                {entry.year && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                        {entry.year}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Question preview */}
                                        <p className="text-xs sm:text-sm text-text-light dark:text-text-dark leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1">
                                            {preview || 'Image-based question — click to view'}
                                            {preview.length >= 100 ? '...' : ''}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
                                            {entry.tag1 ? (
                                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[60%]">
                                                    {entry.tag1}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                    Chemistry
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                                                Solve
                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrganicQuestionList;
