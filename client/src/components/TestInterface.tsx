import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTestData } from '../utils/testData';
// keep the original import if other code relies on it, but we won't assume its shape here
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import katex from 'katex'
import 'katex/dist/katex.min.css';


/** Local types that match what this component expects from fetchTestData() */
type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'notVisited';

interface LocalOption {
  id: string;
  text: string;
  image?: string | null;
}

interface LocalQuestion {
  id: string;
  text: string;
  image?: string | null;
  options: LocalOption[];
  section?: string;
}

interface LocalSection {
  name: string;
}

interface LocalTest {
  // fields your component expects
  id: string;
  testId: string;
  title: string;
  description?: string;
  duration: number; // seconds
  totalMarks?: number;
  totalQuestions?: number;
  markingScheme?: string;
  instructions?: string[];
  sections: LocalSection[];
  questions: LocalQuestion[];
}

interface TestInterfaceProps {
  test: Test;
  onSubmitSuccess: () => void;
}
const escapeLatex = (s: string) => s.replace(/\\/g, "\\");

const TestInterface: React.FC<TestInterfaceProps> = ({ test, onSubmitSuccess }) => {
  const [testData, setTestData] = useState<LocalTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  // derived current question (typed)
  const currentQuestion = testData?.questions && testData.questions[currentQuestionIndex];


  function renderMixedMath(text: string) {
    const parts = text.split(/\$([^$]+)\$/g);

    return (
      <>
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            try {
              const html = katex.renderToString(part, {
                throwOnError: false,
                output: 'html', // Only HTML, no MathML
                displayMode: false
              });
              return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            } catch (e) {
              console.error('KaTeX error:', e);
              return <span key={i}>{part}</span>;
            }
          }
          return part ? <span key={i}>{part}</span> : null;
        })}
      </>
    );
  }

  const handleSubmit = useCallback(async () => {
    if (!testData) return;

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      const { data } = await supabase.auth.getUser();
      const user = (data as any)?.user;

      if (!user) {
        console.error('User not logged in');
        isSubmittingRef.current = false; // allow retry if needed
        return;
      }

      const submission = {
        test_id: testData.testId,
        answers: answers,
        user_id: user.id,
        started_at: new Date().toISOString()
      };

      const { error } = await supabase.from('student_tests').insert([submission]);
      if (error) {
        console.error('Error submitting test:', error);
        // keep isSubmittingRef.current = false so user can retry if desired
        isSubmittingRef.current = false;
      } else {
        try {
          localStorage.removeItem(`test-answers-${testData.testId}`);
        } catch (e) {
          console.warn('Could not remove answers from localStorage', e);
        }
        try {
          onSubmitSuccess();
        } catch (e) {
          console.warn('onSubmitSuccess threw:', e);
        }

        // navigate away — don't reset isSubmittingRef, not necessary after navigation
        navigate('/test-submitted');
      }
    } catch (e) {
      console.error('Submission failed', e);
      isSubmittingRef.current = false;
    }
  }, [answers, testData, onSubmitSuccess, navigate]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const initializeTest = async () => {
      // fetchTestData might be async or sync — await to be safe
      if (!test || !test.url) return;
      const data = await fetchTestData(test.url);

      // Build object matching LocalTest
      const adaptedTestData: LocalTest = {
        id: data.testId,
        testId: data.testId,
        title: data.title,
        description: `${Math.floor((data.duration ?? 0) / 60)} minutes | ${data.totalMarks ?? 0} Marks`,
        duration: Number(data.duration ?? 0), // ensure numeric
        totalMarks: data.totalMarks ?? 0,
        totalQuestions: (data.questions ?? []).length,
        markingScheme: `Varies`,
        instructions: [
          'The test contains multiple-choice questions with a single correct answer.',
          'Each correct answer will be awarded marks as per the question.',
          'There is no negative marking for incorrect answers.',
          'Unanswered questions will receive 0 marks.',
          'You can navigate between questions and sections at any time during the test.',
          'Ensure you have a stable internet connection throughout the duration of the test.',
          'Do not close the browser window or refresh the page, as it may result in loss of progress.',
          'The test will automatically submit once the timer runs out.',
        ],
        sections: (data.sections ?? []) as LocalSection[],
        questions: (data.questions ?? []).map((q: any) => ({
          id: q.id,
          text: q.text,
          image: (q.image && q.image !== 0 && q.image !== "0") ? String(q.image) : null,
          options: (q.options ?? []).map((o: any) => ({
            id: o.id,
            text: o.text,
            image: (o.image && o.image !== 0 && o.image !== "0") ? String(o.image) : null,
          })),
          section: q.section
        })),
      };

      setTestData(adaptedTestData);

      // initialize question statuses length-correctly
      const qCount = adaptedTestData.questions?.length ?? 0;
      setQuestionStatuses(Array(qCount).fill('notVisited' as QuestionStatus));

      // auth
      const { data: authData } = await supabase.auth.getUser();
      const user = (authData as any)?.user;
      if (!user) {
        console.error('User not logged in. Cannot fetch test start time.');
      }

      // fetch or create student_tests row to get started_at
      let testStartTimeISO: string | null = null;
      try {
        if (user) {
          const { data: studentTestData, error } = await supabase
            .from('student_tests')
            .select('started_at')
            .eq('user_id', user.id)
            .eq('test_id', data.testId)
            .single();

          if (error || !studentTestData) {
            // insert a new record
            const { data: newStudentTest, error: insertError } = await supabase
              .from('student_tests')
              .insert({ test_id: data.testId, user_id: user.id })
              .select('started_at')
              .single();

            if (insertError || !newStudentTest) {
              console.error('Failed to create a new student test entry.', insertError);
              testStartTimeISO = new Date().toISOString();
            } else {
              testStartTimeISO = (newStudentTest as any).started_at ?? new Date().toISOString();
            }
          } else {
            testStartTimeISO = (studentTestData as any).started_at ?? new Date().toISOString();
          }
        } else {
          testStartTimeISO = new Date().toISOString();
        }
      } catch (e) {
        console.error('Error while fetching/creating student_tests entry', e);
        testStartTimeISO = new Date().toISOString();
      }

      const testDuration = Number(data.duration ?? 0); // seconds

      // start timer
      const now = new Date();
      const startTime = new Date(testStartTimeISO!);
      const elapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      let newTimeLeft = testDuration - elapsedTime;

      // set immediate state
      if (newTimeLeft <= 0) {
        setTimeLeft(0);
        // handle immediate expiry explicitly
        if (!isSubmittingRef.current) {
          // optionally show a confirmation before auto-submitting, or call submit immediately:
          handleSubmitRef.current();
        }
      } else {
        setTimeLeft(newTimeLeft);

        timer = setInterval(() => {
          newTimeLeft -= 1;
          if (newTimeLeft <= 0) {
            setTimeLeft(0);
            clearInterval(timer!);
            if (!isSubmittingRef.current) handleSubmitRef.current();
          } else {
            setTimeLeft(newTimeLeft);
          }
        }, 1000);
      }

      // load saved answers
      try {
        const saved = localStorage.getItem(`test-answers-${data.testId}`);
        if (saved) setAnswers(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not read saved answers from localStorage', e);
      }
    };

    // call initializer
    initializeTest();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!testData) return;
    try {
      localStorage.setItem(`test-answers-${testData.testId}`, JSON.stringify(answers));
    } catch (e) {
      console.warn('Could not save answers to localStorage', e);
    }
  }, [answers, testData]);

  const handleNext = () => {
    if (testData && testData.questions && currentQuestionIndex < testData.questions.length - 1) {
      const newQuestionStatuses = [...questionStatuses];
      if (newQuestionStatuses[currentQuestionIndex] === 'notVisited') {
        newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
        setQuestionStatuses(newQuestionStatuses);
      }
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    setSelectedOption(optionId);
    const newQuestionStatuses = [...questionStatuses];
    newQuestionStatuses[currentQuestionIndex] = 'answered';
    setQuestionStatuses(newQuestionStatuses);
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const newQuestionStatuses = [...questionStatuses];
    if (newQuestionStatuses[currentQuestionIndex] !== 'markedForReview') {
      newQuestionStatuses[currentQuestionIndex] = 'markedForReview';
    } else {
      newQuestionStatuses[currentQuestionIndex] = answers[currentQuestion.id] ? 'answered' : 'notAnswered';
    }
    setQuestionStatuses(newQuestionStatuses);
  };

  const handlePaletteClick = (index: number) => {
    const newQuestionStatuses = [...questionStatuses];
    if (newQuestionStatuses[currentQuestionIndex] === 'notVisited') {
      newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
      setQuestionStatuses(newQuestionStatuses);
    }
    setCurrentQuestionIndex(index);
  };

  const filteredQuestions: (LocalQuestion & { originalIndex: number })[] =
    testData?.questions
      ?.map((q, i) => ({ ...q, originalIndex: i }))
      .filter((q) => testData?.sections && q.section === testData.sections[currentSectionIndex]?.name) ?? [];

  useEffect(() => {
    if (currentQuestion) {
      setSelectedOption(answers[currentQuestion.id] || null);
    }
  }, [currentQuestion, answers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
      {/* Left/main column: allow internal scrolling / shrinking by using flex + min-h-0 */}
      <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-xl shadow-card-light dark:shadow-card-dark flex flex-col min-h-0 lg:h-[84vh]">
        <div className="flex-grow overflow-y-auto min-h-0">
          {currentQuestion && (
            <>
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
                  Question {currentQuestionIndex + 1} of {testData?.questions?.length}
                </h2>
                <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark px-3 py-1 rounded-full">
                  {currentQuestion.section}
                </span>
              </div>
              <p className="text-base text-text-light dark:text-text-dark leading-relaxed mb-8 break-words whitespace-pre-wrap">
                {renderMixedMath(currentQuestion.text)}
              </p>
              {currentQuestion.image && (
                <div className="mb-8">
                  <img
                    src={currentQuestion.image}
                    alt="Question Illustration"
                    className="max-w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                </div>
              )}
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full flex items-start text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedOption === option.id
                      ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
                      }`}
                  >
                    <span
                      className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${selectedOption === option.id ? 'text-white bg-primary border-primary' : 'text-primary border-primary'
                        }`}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <div className="flex flex-col w-full gap-3">
                      <span className="text-text-light dark:text-text-dark">{renderMixedMath(option.text)}</span>
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Option ${option.id} Illustration`}
                          className="max-w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50"
          >
            <span className="material-icons-outlined">arrow_back</span>
            Previous
          </button>

          <button
            onClick={handleMarkForReview}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
          >
            <span className="material-icons-outlined">
              {questionStatuses[currentQuestionIndex] === 'markedForReview' ? 'bookmark' : 'bookmark_border'}
            </span>
            Mark for Review
          </button>

          <button
            onClick={handleNext}
            disabled={!testData || !testData.questions || currentQuestionIndex === testData.questions.length - 1}
            className="flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Next
            <span className="material-icons-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Right/palette aside */}
      <div className="flex flex-col gap-4">
        <aside
          // make the aside sticky at the top on large screens, keep it from growing the row,
          // and allow internal vertical scroll when contents exceed max height.
          className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark lg:sticky lg:top-6 lg:self-start max-h-[72vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Time Left:</h3>
            <span className="text-lg font-semibold text-text-light dark:text-text-dark">
              {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}` : '--:--'}
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Question Palette</h3>
          <div className="flex items-center justify-center space-x-2 mb-4">
            {testData?.sections?.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSectionIndex(index)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${currentSectionIndex === index ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark'
                  }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {filteredQuestions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => handlePaletteClick(question.originalIndex)}
                className={`w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors ${questionStatuses[question.originalIndex] === 'answered'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500'
                  : questionStatuses[question.originalIndex] === 'notAnswered'
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
                    : questionStatuses[question.originalIndex] === 'markedForReview'
                      ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500'
                      : 'bg-background-light dark:bg-background-dark hover:border-primary dark:hover:text-primary border border-border-light dark:border-border-dark'
                  } ${currentQuestionIndex === question.originalIndex ? 'ring-2 ring-primary' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-green-500/20 border border-green-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500" />
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark" />
              <span>Not Visited</span>
            </div>
          </div>
        </aside>
        <div className="lg:self-stretch">
          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Submit Test
          </button>
        </div>
      </div>

    </div>
  );
};

export default TestInterface;
