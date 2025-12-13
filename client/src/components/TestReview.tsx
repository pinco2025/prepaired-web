import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Test, Question } from '../data';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Interfaces
interface AttemptComparison {
    question_uuid: string;
    question_id: string;
    section: string;
    user_response: string | null;
    correct_response: string;
    status: 'Correct' | 'Incorrect' | 'Unattempted';
}

interface Solution {
    id: string;
    solution_text: string;
    solution_image_url: string;
    tags: Record<string, string>;
}

const TestReview: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();

    const [testData, setTestData] = useState<Test | null>(null);
    const [userAnswers, setUserAnswers] = useState<AttemptComparison[]>([]);
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isSolutionVisible, setIsSolutionVisible] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
             if (!submissionId) {
        setError('Submission ID is missing.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch submission data to get result_url and test_id
        const { data: submissionData, error: submissionError } = await supabase
          .from('student_tests')
          .select('result_url, test_id')
          .eq('id', submissionId)
          .single();

        if (submissionError) throw new Error(`Failed to fetch submission: ${submissionError.message}`);
        if (!submissionData) throw new Error('Submission not found.');

        const { result_url, test_id } = submissionData;

        // 2. Fetch test metadata to get the test url and solution_url
        const { data: testMeta, error: testMetaError } = await supabase
          .from('tests')
          .select('url, solution_url')
          .eq('testID', test_id)
          .single();

        if (testMetaError) throw new Error(`Failed to fetch test metadata: ${testMetaError.message}`);
        if (!testMeta) throw new Error('Test metadata not found.');

        const { url: testUrl, solution_url } = testMeta;

        // 3. Fetch all data concurrently
        const [resultResponse, solutionResponse, testResponse] = await Promise.all([
          fetch(result_url),
          fetch(solution_url),
          fetch(testUrl)
        ]);

        if (!resultResponse.ok) throw new Error(`Failed to fetch result data from ${result_url}`);
        if (!solutionResponse.ok) throw new Error(`Failed to fetch solution data from ${solution_url}`);
        if (!testResponse.ok) throw new Error(`Failed to fetch test content from ${testUrl}`);

        const resultJson = await resultResponse.json();
        const solutionJson = await solutionResponse.json();
        const testJson = await testResponse.json();

        setUserAnswers(resultJson.attempt_comparison || []);
        setSolutions(solutionJson.questions || []);
        setTestData(testJson as Test);
        setAllQuestions(testJson.questions || []);


      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
        };
        fetchData();
    }, [submissionId]);

    const sections = useMemo(() => testData?.sections?.map(s => s.name) || [], [testData]);
    const questionsBySection = useMemo(() => {
        return sections.map(sectionName =>
            allQuestions.filter(q => q.section === sectionName)
        );
    }, [sections, allQuestions]);

    const handleQuestionSelect = (questionIndex: number) => {
        const question = questionsBySection[currentSectionIndex][questionIndex];
        const globalIndex = allQuestions.findIndex(q => q.id === question.id);
        setCurrentQuestionIndex(globalIndex);
    };

    const handleSectionSelect = (sectionIndex: number) => {
        setCurrentSectionIndex(sectionIndex);
        const firstQuestionInSection = allQuestions.find(q => q.section === sections[sectionIndex]);
        if (firstQuestionInSection) {
            const globalIndex = allQuestions.findIndex(q => q.id === firstQuestionInSection.id);
            setCurrentQuestionIndex(globalIndex);
        }
    };

    const currentQuestion = allQuestions[currentQuestionIndex];
    const currentAnswer = userAnswers.find(a => a.question_id === currentQuestion?.id);
    const currentSolution = solutions.find(s => s.id === currentQuestion?.id);

    const renderHtml = (htmlString: string) => {
        const parts = htmlString.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true }) }} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }) }} />;
            }
            return <span key={i}>{part}</span>;
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading review...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    if (!testData || !currentQuestion || !currentAnswer) return <div className="flex justify-center items-center h-screen">Data not available.</div>;

    const getOptionStyle = (optionId: string) => {
        const isCorrect = optionId === currentAnswer.correct_response;
        const isUserChoice = optionId === currentAnswer.user_response;

        if (isCorrect) {
            return "border-2 border-success-light bg-success-light/10 dark:bg-success-dark/10";
        }
        if (isUserChoice && !isCorrect) {
            return "border-2 border-error-light bg-error-light/10 dark:bg-error-dark/10";
        }
        return "border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-gray-800";
    };

    const getPaletteStyle = (questionId: string) => {
        const answer = userAnswers.find(a => a.question_id === questionId);
        if (!answer) return "bg-gray-200 dark:bg-gray-700";
        switch (answer.status) {
            case 'Correct': return "bg-success-light text-white";
            case 'Incorrect': return "bg-error-light text-white";
            case 'Unattempted': return "bg-gray-200 dark:bg-gray-700";
            default: return "bg-gray-200 dark:bg-gray-700";
        }
    };

    const stats = userAnswers.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);


    return (
        <div className="min-h-screen flex flex-col relative bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark antialiased">
            <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10"></div>
            <header className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border-light dark:border-border-dark shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img alt="prepAIred logo" className="h-8 w-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdzj_WfIjmmM52JXz4zKQrlQgJkA4UmPvuySjzEbq9Bsdj31RsY7ncfFrEi-fD-BWSo0ZTpLvMe7hOv0DP_1JXMQbL8BW_EgaawiBsr0daDGG68D4iJN_47bGlm98RGzILkKm4sgrjxbv04CENGDP2nGSO6OWmZ8vg5Q9-vdcYbpfJrfN1QRe-Abx_bYN4iP1dZnaJMNe-Jycl4XN4_crPSiEv3ULZH5fzZGU9CbUHu7gVaJ3NCZ4o0LRozC1uo6aoEl7HLrY5k_En" />
                            <span className="text-xl font-bold">prep<span className="text-primary">AI</span>red</span>
                        </div>
                        <button onClick={() => navigate(`/results/${submissionId}`)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            <span className="text-sm font-medium">Back to Result</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left Column */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border border-border-light dark:border-border-dark flex flex-col overflow-hidden">
                            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 bg-background-light/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-primary">Question {allQuestions.findIndex(q => q.id === currentQuestion.id) + 1}</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-text-secondary-light/10 text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium uppercase tracking-wide">{currentQuestion.section}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Placeholder button */}
                                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:text-primary" title="Report Issue">flag</span>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 space-y-8">
                                <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed font-medium">
                                    {renderHtml(currentQuestion.text)}
                                </div>
                                <div className="space-y-3">
                                    {currentQuestion.options.map(option => (
                                        <div key={option.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all relative overflow-hidden ${getOptionStyle(option.id)}`}>
                                            {currentAnswer.correct_response === option.id && (
                                                 <div className="absolute right-0 top-0 w-8 h-8 bg-success-light flex items-center justify-center rounded-bl-xl">
                                                    <span className="material-symbols-outlined text-white text-[18px]">check</span>
                                                 </div>
                                            )}
                                            <div className="w-8 h-8 rounded-full border-2 border-border-light dark:border-border-dark flex items-center justify-center text-sm font-bold">{option.id.toUpperCase()}</div>
                                            <div className="flex-grow">{renderHtml(option.text)}</div>
                                            {currentAnswer.user_response === option.id && (
                                                <div className={`text-xs font-bold uppercase tracking-wider ${currentAnswer.status === 'Correct' ? 'text-success-dark' : 'text-error-dark'}`}>
                                                    Your Answer
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {currentSolution && (
                                <div className="border-t border-border-light dark:border-border-dark bg-background-light/30 dark:bg-background-dark/30">
                                    <div className="p-6 md:p-8">
                                        <button onClick={() => setIsSolutionVisible(!isSolutionVisible)} className="flex items-center gap-2 text-primary font-semibold mb-4 hover:opacity-80 transition-opacity">
                                            <span className="material-symbols-outlined">{isSolutionVisible ? 'expand_less' : 'expand_more'}</span>
                                            {isSolutionVisible ? 'Hide' : 'Show'} Solution
                                        </button>
                                        {isSolutionVisible && (
                                            <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-5 border border-border-light dark:border-border-dark shadow-sm">
                                                <h4 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide mb-3">Explanation</h4>
                                                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                                    {renderHtml(currentSolution.solution_text)}
                                                </div>
                                                {currentSolution.solution_image_url && <img src={currentSolution.solution_image_url} alt="Solution" className="mt-4 rounded-lg"/>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-light dark:bg-surface-dark border disabled:opacity-50">
                                <span className="material-symbols-outlined">arrow_back</span> Previous
                            </button>
                            <button onClick={() => setCurrentQuestionIndex(Math.min(allQuestions.length - 1, currentQuestionIndex + 1))} disabled={currentQuestionIndex === allQuestions.length - 1} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white shadow-lg disabled:opacity-50">
                                Next Question <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark border p-4 sticky top-24">
                            <h3 className="text-lg font-bold mb-4 px-2">Question Palette</h3>
                            <div className="flex border-b mb-4">
                                {sections.map((section, index) => (
                                    <button key={section} onClick={() => handleSectionSelect(index)} className={`flex-1 pb-2 text-sm font-medium ${currentSectionIndex === index ? 'text-primary border-b-2 border-primary' : 'text-text-secondary-light hover:text-text-light'}`}>
                                        {section.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-5 gap-3 mb-6 max-h-[60vh] overflow-y-auto p-1">
                                {questionsBySection[currentSectionIndex].map((q, index) => (
                                    <button key={q.id} onClick={() => handleQuestionSelect(index)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-opacity ${getPaletteStyle(q.id)} ${q.id === currentQuestion.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                        {allQuestions.findIndex(aq => aq.id === q.id) + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-success-light"></div>
                                    <span className="text-sm">Correct</span>
                                    <span className="ml-auto font-bold">{stats['Correct'] || 0}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-error-light"></div>
                                    <span className="text-sm">Incorrect</span>
                                    <span className="ml-auto font-bold">{stats['Incorrect'] || 0}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    <span className="text-sm">Not Attempted</span>
                                    <span className="ml-auto font-bold">{stats['Unattempted'] || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TestReview;
