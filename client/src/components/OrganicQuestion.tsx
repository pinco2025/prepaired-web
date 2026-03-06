import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import QuestionViewer from './question/QuestionViewer';
import { getQuestionBySlug, organicQuestions } from '../data/organicQuestions';
import { usePageTitle } from '../hooks/usePageTitle';

const OrganicQuestion: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const entry = useMemo(() => getQuestionBySlug(slug || ''), [slug]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [numericAnswer, setNumericAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);

    usePageTitle(entry ? entry.seoTitle : 'Question Not Found');

    const currentIndex = useMemo(() => organicQuestions.findIndex(q => q.slug === slug), [slug]);
    const prevEntry = currentIndex > 0 ? organicQuestions[currentIndex - 1] : null;
    const nextEntry = currentIndex < organicQuestions.length - 1 ? organicQuestions[currentIndex + 1] : null;

    React.useEffect(() => {
        setSelectedAnswer(null);
        setNumericAnswer('');
        setShowResult(false);
    }, [slug]);

    if (!entry) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark mb-4">search_off</span>
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Question Not Found</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">This question doesn't exist or may have been removed.</p>
                <button onClick={() => navigate('/questions/organic')} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Browse All Questions
                </button>
            </div>
        );
    }

    const { question, solution, seoTitle, seoDescription, seoKeywords, tag1, year, examSource } = entry;
    const handleCheckAnswer = () => setShowResult(true);
    const isCorrect = showResult && (
        selectedAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase() ||
        numericAnswer.trim() === question.correctAnswer?.trim()
    );

    const plainTextQuestion = question.text
        .replace(/\$\$[\s\S]+?\$\$/g, '[equation]')
        .replace(/\$[\s\S]+?\$/g, '[formula]')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '').trim();

    const jsonLd = {
        "@context": "https://schema.org", "@type": "Quiz", "name": seoTitle,
        "description": seoDescription,
        "educationalAlignment": { "@type": "AlignmentObject", "alignmentType": "educationalSubject", "targetName": "Chemistry" },
        "hasPart": [{ "@type": "Question", "name": plainTextQuestion, "acceptedAnswer": { "@type": "Answer", "text": `Option ${question.correctAnswer}` }, "eduQuestionType": "Multiple choice" }],
        "provider": { "@type": "Organization", "name": "prepAIred", "url": "https://www.prepaired.site" },
        "isAccessibleForFree": true, "inLanguage": "en"
    };
    const canonicalUrl = `https://www.prepaired.site/question/${entry.slug}`;

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={seoKeywords.join(', ')} />
                <link rel="canonical" href={canonicalUrl} />
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="prepAIred" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none grid-bg-light dark:grid-bg-dark opacity-40"></div>
                <div className="flex-1 overflow-y-auto p-3 md:p-10 relative z-10">
                    <div className="mx-auto max-w-4xl flex flex-col gap-4 md:gap-6 pb-20">

                        {/* Breadcrumb — scrollable on mobile */}
                        <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark overflow-x-auto whitespace-nowrap pb-1 -mb-1">
                            <Link to="/question-set" className="hover:text-primary transition-colors shrink-0">Question Sets</Link>
                            <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">chevron_right</span>
                            <Link to="/questions/organic" className="hover:text-primary transition-colors shrink-0">Organic Questions</Link>
                            <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">chevron_right</span>
                            <span className="text-text-light dark:text-text-dark font-medium shrink-0">Q{currentIndex + 1}</span>
                        </nav>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                            {examSource && <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{examSource}</span>}
                            {year && <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{year}</span>}
                            {tag1 && <span className="hidden sm:inline-flex items-center px-2 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{tag1}</span>}
                            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400">Free Access</span>
                        </div>

                        {/* Question Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-4 md:p-8">
                            <QuestionViewer
                                mode="practice" question={question} solution={solution}
                                selectedAnswer={selectedAnswer} numericAnswer={numericAnswer}
                                onAnswerChange={setSelectedAnswer} onNumericAnswerChange={setNumericAnswer}
                                showResult={showResult} isCorrect={isCorrect}
                                questionNumber={currentIndex + 1} totalQuestions={organicQuestions.length}
                                hideNavigation={true} optionsLayout="vertical"
                            />

                            {/* Check / Try Again */}
                            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {!showResult ? (
                                    <button onClick={handleCheckAnswer} disabled={!selectedAnswer && !numericAnswer.trim()}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-blue-500/20 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>Check Answer
                                    </button>
                                ) : (
                                    <button onClick={() => { setSelectedAnswer(null); setNumericAnswer(''); setShowResult(false); }}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl text-sm font-bold bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary/50 transition-all active:scale-[0.98]">
                                        <span className="material-symbols-outlined text-[18px]">refresh</span>Try Again
                                    </button>
                                )}
                                {showResult && (
                                    <div className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-center sm:text-left ${isCorrect
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px] shrink-0">{isCorrect ? 'check_circle' : 'cancel'}</span>
                                        {isCorrect ? 'Correct!' : `Incorrect — Answer: ${question.correctAnswer}`}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation — full-width stacked on mobile */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-2">
                            {prevEntry ? (
                                <Link to={`/question/${prevEntry.slug}`} className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/50 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>Previous
                                </Link>
                            ) : <div className="hidden sm:block" />}
                            {nextEntry ? (
                                <Link to={`/question/${nextEntry.slug}`} className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary shadow-md shadow-blue-500/20 hover:bg-primary-dark transition-all">
                                    Next Question<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            ) : (
                                <Link to="/questions/organic" className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary shadow-md shadow-blue-500/20 hover:bg-primary-dark transition-all">
                                    All Questions<span className="material-symbols-outlined text-[18px]">grid_view</span>
                                </Link>
                            )}
                        </div>

                        {/* SEO hidden content */}
                        <div className="sr-only" aria-hidden="false">
                            <h1>{seoTitle}</h1>
                            <p>{plainTextQuestion}</p>
                            <p>Source: {examSource} {year} {tag1}</p>
                            <p>Subject: Chemistry - Haloalkanes and Haloarenes</p>
                            <p>Answer: {question.correctAnswer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrganicQuestion;
