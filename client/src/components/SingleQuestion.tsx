import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MCQOptions, SolutionDisplay, RenderMath } from './question';

interface Question {
    uuid: string;
    text: string;
    image: string | null;
    options: any[];
    correctAnswer: string;
    solution?: { text: string; image: string | null };
    tags?: any;
    subject?: string;
}

const SingleQuestion: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const res = await fetch('/data/jee_2026_pyqs.json');
                if (!res.ok) throw new Error('Failed to load PYQ data');
                const data: Question[] = await res.json();
                const q = data.find(item => item.uuid === uuid);
                if (q) {
                    setQuestion(q);
                } else {
                    setQuestion(null);
                }
            } catch (err) {
                console.error(err);
                setQuestion(null);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();

        // Reset state on uuid change
        setSelectedOption(null);
        setShowSolution(false);
    }, [uuid]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-text-secondary-light">Loading question...</p>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <span className="material-symbols-outlined text-6xl text-text-secondary-light mb-4">search_off</span>
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Question Not Found</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">This PYQ doesn't exist or may have been removed.</p>
                <button onClick={() => navigate('/pyq-2026')} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Browse PYQs
                </button>
            </div>
        );
    }

    const { tag1, tag2 } = question.tags || {};
    const subjectName = question.subject || 'Practice';
    const plainTextQuestion = question.text
        .replace(/\$\$[\s\S]+?\$\$/g, '[equation]')
        .replace(/\$[\s\S]+?\$/g, '[formula]')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textbf\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}\\^_]/g, '')
        .replace(/\n/g, ' ')
        .trim();
    const shortText = plainTextQuestion.substring(0, 150) + (plainTextQuestion.length > 150 ? '...' : '');
    const seoTitle = `JEE Main 2026 PYQ: ${subjectName}${tag1 ? ` - ${tag1}` : ''} | prepAIred`;
    const seoDescription = `JEE Main 2026 Previous Year Question (${subjectName})${tag1 ? ` from ${tag1}` : ''}. ${shortText} Practice with detailed solution on prepAIred.`;
    const canonicalUrl = `https://www.prepaired.site/pyq/${uuid}`;

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={`JEE Main 2026 PYQ, JEE 2026 previous year questions, ${subjectName}, JEE Main solutions, prepAIred`} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:site_name" content="prepAIred" />
                <meta property="og:image" content="https://www.prepaired.site/og-image.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />

                {/* JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Quiz",
                        "name": seoTitle,
                        "description": seoDescription,
                        "url": canonicalUrl,
                        "dateCreated": "2026-01-01T00:00:00Z",
                        "educationalLevel": "Higher Secondary",
                        "about": { "@type": "Thing", "name": subjectName },
                        "provider": { "@type": "EducationalOrganization", "name": "prepAIred", "url": "https://www.prepaired.site/" },
                        "isAccessibleForFree": true,
                        "inLanguage": "en"
                    })}
                </script>
            </Helmet>

            <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark relative overflow-hidden p-3 md:p-8">
                <div className="mx-auto max-w-4xl w-full flex flex-col gap-4">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark overflow-x-auto whitespace-nowrap mb-2">
                        <Link to="/pyq-2026" className="hover:text-primary transition-colors shrink-0">Previous Year Questions</Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px]">chevron_right</span>
                        <span className="text-text-light dark:text-text-dark font-medium shrink-0">Question {uuid}</span>
                    </nav>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark p-5 md:p-8">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {tag1 && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{tag1}</span>}
                            {tag2 && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] md:text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Chapter Code: {tag2}</span>}
                        </div>

                        {/* Question Text */}
                        <div className="text-lg md:text-xl font-medium leading-relaxed text-text-light dark:text-text-dark mb-6 whitespace-pre-wrap break-words">
                            <RenderMath text={question.text} />
                        </div>

                        {question.image && (
                            <div className="mb-6 flex justify-center">
                                <img src={question.image} alt="Question" className="max-w-full rounded-lg" />
                            </div>
                        )}

                        {/* Options */}
                        <MCQOptions
                            options={question.options}
                            selectedId={selectedOption}
                            onSelect={(id) => { if (!showSolution) setSelectedOption(id); }}
                            disabled={showSolution}
                            showResult={showSolution}
                            correctAnswerId={question.correctAnswer}
                            layout="grid"
                        />

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={() => setShowSolution(!showSolution)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${showSolution ? 'bg-background-light dark:bg-white/5 text-text-secondary-light border border-border-light border-solid' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{showSolution ? 'visibility_off' : 'check'}</span>
                                {showSolution ? 'Hide Solution' : 'Check Answer'}
                            </button>
                        </div>

                        {/* Solution */}
                        {showSolution && question.solution && (
                            <div className="mt-6">
                                <SolutionDisplay
                                    text={question.solution.text}
                                    image={question.solution.image}
                                    visible={true}
                                />
                            </div>
                        )}

                        {!question.solution && showSolution && (
                            <div className="mt-6 p-4 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
                                Detailed solution coming soon!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SingleQuestion;
