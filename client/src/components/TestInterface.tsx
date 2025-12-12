import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTestData } from '../utils/testData';
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import katex from 'katex'
import 'katex/dist/katex.min.css';

type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'notVisited';

interface LocalOption {
  id: string;
  text: string;
  image?: string | null;
}

interface LocalQuestion {
  id: string;
  uuid: string;
  text: string;
  image?: string | null;
  options: LocalOption[];
  section?: string;
}

interface LocalSection {
  name: string;
}

interface LocalTest {
  id: string;
  testId: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks?: number;
  totalQuestions?: number;
  markingScheme?: string;
  instructions?: string[];
  sections: LocalSection[];
  questions: LocalQuestion[];
  exam?: 'Normal' | 'JEE' | 'NEET';
}

interface TestInterfaceProps {
  test: Test;
  onSubmitSuccess: () => void;
  exam?: 'Normal' | 'JEE' | 'NEET';
}

const escapeLatex = (s: string) => s.replace(/\\/g, "\\");

const TestInterface: React.FC<TestInterfaceProps> = ({ test, onSubmitSuccess, exam }) => {
  const [testData, setTestData] = useState<LocalTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericalAnswer, setNumericalAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [studentTestId, setStudentTestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializationRef = useRef(false); // Use ref instead of state to prevent re-renders

  const currentQuestion = testData?.questions && testData.questions[currentQuestionIndex];

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  function renderMixedMath(text: string) {
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            try {
              const html = katex.renderToString(part.slice(2, -2), {
                throwOnError: false,
                output: 'html',
                displayMode: true
              });
              return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            } catch (e) {
              console.error('KaTeX error:', e);
              return <span key={i}>{part}</span>;
            }
          } else if (part.startsWith('$') && part.endsWith('$')) {
            try {
              const html = katex.renderToString(part.slice(1, -1), {
                throwOnError: false,
                output: 'html',
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

  // Use ref to always have latest answers and testData
  const answersRef = useRef(answers);
  const testDataRef = useRef(testData);
  const studentTestIdRef = useRef(studentTestId);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    testDataRef.current = testData;
  }, [testData]);

  useEffect(() => {
    studentTestIdRef.current = studentTestId;
  }, [studentTestId]);

  const handleSubmit = useCallback(async () => {
    // Use refs to get current values
    const currentTestData = testDataRef.current;
    const currentAnswers = answersRef.current;
    const currentStudentTestId = studentTestIdRef.current;

    console.log('handleSubmit called with:', {
      testData: currentTestData?.testId,
      answersCount: Object.keys(currentAnswers).length,
      studentTestId: currentStudentTestId
    });

    if (!currentTestData) {
      console.error('No test data available');
      return;
    }

    if (isSubmittingRef.current) {
      console.log('Submission already in progress, skipping...');
      return;
    }
    
    isSubmittingRef.current = true;
    console.log('Starting submission...');

    // Clear timer immediately to prevent any further submissions
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const { data } = await supabase.auth.getUser();
      const user = (data as any)?.user;

      if (!user) {
        console.error('User not logged in');
        isSubmittingRef.current = false;
        return;
      }

      const submissionData = {
        answers: currentAnswers,
        submitted_at: new Date().toISOString()
      };

      console.log('Submitting data:', submissionData);

      let error;
      let finalSubmissionId = currentStudentTestId;
      let shouldCalculateScore = true;

      if (currentStudentTestId) {
          console.log('Updating existing record:', currentStudentTestId);
          const { data: updateResult, error: updateError } = await supabase
              .from('student_tests')
              .update(submissionData)
              .eq('id', currentStudentTestId)
              .select('result_url');
          
          console.log('Update result:', updateResult);

          if (updateResult && updateResult.length > 0 && updateResult[0].result_url) {
            console.log('Result already exists, skipping calculation.');
            shouldCalculateScore = false;
          }

          error = updateError;
      } else {
          // Fallback to insert if for some reason ID is missing (should not happen in normal flow)
          console.log('No student test ID, creating new entry (fallback)');
          const { data: insertData, error: insertError } = await supabase.from('student_tests').insert([{
              test_id: currentTestData.testId,
              user_id: user.id,
              answers: currentAnswers,
              started_at: new Date().toISOString(),
              submitted_at: new Date().toISOString()
          }])
          .select('id')
          .single();

          if (insertData) {
            finalSubmissionId = insertData.id;
            // Update state so subsequent retries use this ID (prevent duplicate inserts)
            setStudentTestId(insertData.id);
          }
          error = insertError;
      }

      if (error || !finalSubmissionId) {
        console.error('Error submitting test:', error);
        isSubmittingRef.current = false;
      } else {
        console.log('Submission DB update successful!');

        if (shouldCalculateScore) {
          console.log('Triggering grade calculation...');
          // Trigger Score Calculation
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            await fetch(`https://prepaired-backend.onrender.com/api/v1/scores/${finalSubmissionId}/calculate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            });
          } catch (error) {
            console.error('Failed to trigger score calculation', error);
            // Proceed to navigation even if triggering calculation fails
          }
        } else {
          console.log('Skipping grade calculation as result already exists.');
        }

        console.log('Submission and grading successful!');
        try {
          localStorage.removeItem(`test-answers-${currentTestData.testId}`);
        } catch (e) {
          console.warn('Could not remove answers from localStorage', e);
        }
        try {
          onSubmitSuccess();
        } catch (e) {
          console.warn('onSubmitSuccess threw:', e);
        }

        navigate('/test-submitted', { state: { submissionId: finalSubmissionId } });
      }
    } catch (e) {
      console.error('Submission failed', e);
      isSubmittingRef.current = false;
    }
  }, [onSubmitSuccess, navigate]); // Only depend on stable functions

  useEffect(() => {
    // Prevent re-initialization using ref (survives re-renders and strict mode)
    if (initializationRef.current) {
      console.log('Initialization already done, skipping...');
      return;
    }

    const initializeTest = async () => {
      if (!test || !test.url) return;
      
      // Mark as initializing immediately
      initializationRef.current = true;
      console.log('Initializing test...');
      
      const data = await fetchTestData(test.url);

      const adaptedTestData: LocalTest = {
        id: data.testId,
        testId: data.testId,
        title: data.title,
        description: `${Math.floor((data.duration ?? 0) / 60)} minutes | ${data.totalMarks ?? 0} Marks`,
        duration: Number(data.duration ?? 0),
        totalMarks: data.totalMarks ?? 0,
        totalQuestions: (data.questions ?? []).length,
        markingScheme: test.markingScheme,
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
          uuid: q.uuid,
          text: q.text,
          image: (q.image && q.image !== 0 && q.image !== "0") ? String(q.image) : null,
          options: (q.options ?? []).map((o: any) => ({
            id: o.id,
            text: o.text,
            image: (o.image && o.image !== 0 && o.image !== "0") ? String(o.image) : null,
          })),
          section: q.section
        })),
        exam: exam
      };

      setTestData(adaptedTestData);

      const qCount = adaptedTestData.questions?.length ?? 0;
      setQuestionStatuses(Array(qCount).fill('notVisited' as QuestionStatus));

      const { data: authData } = await supabase.auth.getUser();
      const user = (authData as any)?.user;
      if (!user) {
        console.error('User not logged in. Cannot fetch test start time.');
        return;
      }

      let testStartTimeISO: string | null = null;
      try {
        // First, try to find existing entry that hasn't been submitted
        const { data: existingTests, error: fetchError } = await supabase
          .from('student_tests')
          .select('id, started_at, answers, submitted_at')
          .eq('user_id', user.id)
          .eq('test_id', data.testId)
          .is('submitted_at', null) // Only get tests that haven't been submitted
          .order('started_at', { ascending: false })
          .limit(1);

        if (fetchError) {
          console.error('Error fetching student test:', fetchError);
        }

        const existingTest = existingTests && existingTests.length > 0 ? existingTests[0] : null;

        if (existingTest) {
          console.log('Found existing unsubmitted student test entry:', (existingTest as any).id);
          testStartTimeISO = (existingTest as any).started_at ?? new Date().toISOString();
          setStudentTestId((existingTest as any).id);
          // Load answers from DB if available
          if ((existingTest as any).answers) {
               setAnswers((existingTest as any).answers);
          }
        } else {
          console.log('Creating new student test entry...');
          const { data: newStudentTest, error: insertError } = await supabase
            .from('student_tests')
            .insert({ 
              test_id: data.testId, 
              user_id: user.id,
              started_at: new Date().toISOString()
            })
            .select('id, started_at')
            .single();

          if (insertError) {
            console.error('Failed to create a new student test entry.', insertError);
            testStartTimeISO = new Date().toISOString();
          } else if (newStudentTest) {
            testStartTimeISO = (newStudentTest as any).started_at ?? new Date().toISOString();
            setStudentTestId((newStudentTest as any).id);
            console.log('Created new student test with ID:', (newStudentTest as any).id);
          } else {
            testStartTimeISO = new Date().toISOString();
          }
        }
      } catch (e) {
        console.error('Error while fetching/creating student_tests entry', e);
        testStartTimeISO = new Date().toISOString();
      }

      const testDuration = Number(data.duration ?? 0);
      const now = new Date();
      const startTime = new Date(testStartTimeISO!);
      const elapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      let remainingTime = testDuration - elapsedTime;

      if (remainingTime <= 0) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(remainingTime);

      // Start the timer only once
      console.log('Starting timer with', remainingTime, 'seconds remaining');
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Load saved answers from localStorage (fallback)
      // Only use if we didn't already load from DB
      if (!studentTestId || !answers || Object.keys(answers).length === 0) {
        try {
          const saved = localStorage.getItem(`test-answers-${data.testId}`);
          if (saved) {
            const savedAnswers = JSON.parse(saved);
            setAnswers(savedAnswers);
          }
        } catch (e) {
          console.warn('Could not read saved answers from localStorage', e);
        }
      }
    };

    initializeTest();

    return () => {
      // Don't reset initializationRef on cleanup - we want it to persist
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [test?.url, test?.markingScheme, exam]); // Dependencies are stable

  // Separate effect to handle submission when time runs out
  useEffect(() => {
    if (timeLeft === 0 && testData && !isSubmittingRef.current) {
      console.log('Time expired, auto-submitting...');
      handleSubmit();
    }
  }, [timeLeft, testData, handleSubmit]);

  useEffect(() => {
    if (!testData || !studentTestId) return;
    
    // Save to LocalStorage
    try {
      localStorage.setItem(`test-answers-${testData.testId}`, JSON.stringify(answers));
    } catch (e) {
      console.warn('Could not save answers to localStorage', e);
    }

    // Save to Database (debounced to avoid too many requests)
    const timeoutId = setTimeout(() => {
      supabase
        .from('student_tests')
        .update({ answers: answers })
        .eq('id', studentTestId)
        .then(({ error }) => {
            if (error) console.error('Error auto-saving answers to DB:', error);
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [answers, testData, studentTestId]);

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

    // Check if already selected (toggle behavior)
    if (answers[currentQuestion.uuid] === optionId) {
        // Unmark
        setAnswers((prev) => {
            const newAnswers = { ...prev };
            delete newAnswers[currentQuestion.uuid];
            return newAnswers;
        });
        setSelectedOption(null);

        const newQuestionStatuses = [...questionStatuses];
        newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
        setQuestionStatuses(newQuestionStatuses);
    } else {
        // Mark
        setAnswers((prev) => ({ ...prev, [currentQuestion.uuid]: optionId }));
        setSelectedOption(optionId);
        const newQuestionStatuses = [...questionStatuses];
        newQuestionStatuses[currentQuestionIndex] = 'answered';
        setQuestionStatuses(newQuestionStatuses);
    }
  };

  const handleNumericalChange = (value: string) => {
    if (!currentQuestion) return;

    const regex = /^-?\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      setNumericalAnswer(value);

      const isValidNumber = !isNaN(parseFloat(value)) && isFinite(Number(value));
      if (isValidNumber || value === '') {
          setAnswers((prev) => ({ ...prev, [currentQuestion.uuid]: value }));
      }

      const newQuestionStatuses = [...questionStatuses];
      if (value.length > 0) {
        newQuestionStatuses[currentQuestionIndex] = 'answered';
      } else {
        newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
      }
      setQuestionStatuses(newQuestionStatuses);
    }
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const newQuestionStatuses = [...questionStatuses];
    if (newQuestionStatuses[currentQuestionIndex] !== 'markedForReview') {
      newQuestionStatuses[currentQuestionIndex] = 'markedForReview';
    } else {
      newQuestionStatuses[currentQuestionIndex] = answers[currentQuestion.uuid] ? 'answered' : 'notAnswered';
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
      const savedAnswer = answers[currentQuestion.uuid];
      setSelectedOption(savedAnswer || null);
      setNumericalAnswer(savedAnswer || '');
    }
  }, [currentQuestion, answers]);

  // Sync Question Palette section with current question
  useEffect(() => {
    if (!testData?.questions || !testData?.sections) return;

    const currentQ = testData.questions[currentQuestionIndex];
    if (!currentQ) return;

    const sectionName = currentQ.section;
    const sectionIndex = testData.sections.findIndex(s => s.name === sectionName);

    if (sectionIndex !== -1 && sectionIndex !== currentSectionIndex) {
      setCurrentSectionIndex(sectionIndex);
    }
  }, [currentQuestionIndex, testData, currentSectionIndex]);

  const sectionIndices = React.useMemo(() => {
    if (!testData?.sections || !testData?.questions) return {};

    const indices: Record<string, number> = {};
    let count = 0;

    testData.sections.forEach(section => {
      indices[section.name] = count;
      const questionsInSection = testData.questions.filter(q => q.section === section.name);
      count += questionsInSection.length;
    });

    return indices;
  }, [testData]);

  const handleSectionSwitch = (index: number) => {
    if (!testData?.sections) return;

    const sectionName = testData.sections[index]?.name;
    if (sectionName && sectionIndices[sectionName] !== undefined) {
      setCurrentSectionIndex(index);
      setCurrentQuestionIndex(sectionIndices[sectionName]);
    }
  };

  const isNumericalQuestion = () => {
    // Primary check: No options
    if (currentQuestion && (!currentQuestion.options || currentQuestion.options.length === 0)) {
        return true;
    }

    // Fallback: Legacy JEE index check
    if (testData?.exam !== 'JEE' || !currentQuestion || !currentQuestion.section) return false;

    const sectionStartIndex = sectionIndices[currentQuestion.section];

    if (sectionStartIndex === undefined) return false;

    const indexWithinSection = currentQuestionIndex - sectionStartIndex;

    return indexWithinSection >= 20;
  };

  const handleKeypadClick = (key: string) => {
    if (!currentQuestion) return;

    let newValue = numericalAnswer;

    if (key === 'backspace') {
      newValue = newValue.slice(0, -1);
    } else if (key === '.') {
      if (!newValue.includes('.')) {
        newValue += '.';
      }
    } else {
      // It's a digit
      newValue += key;
    }

    setNumericalAnswer(newValue);

    const isValidNumber = !isNaN(parseFloat(newValue)) && isFinite(Number(newValue));
    if (isValidNumber || newValue === '') {
        setAnswers((prev) => ({ ...prev, [currentQuestion.uuid]: newValue }));
    }

    const newQuestionStatuses = [...questionStatuses];
    if (newValue.length > 0) {
      newQuestionStatuses[currentQuestionIndex] = 'answered';
    } else {
      newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
    }
    setQuestionStatuses(newQuestionStatuses);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
      <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-xl shadow-card-light dark:shadow-card-dark flex flex-col min-h-0 lg:h-[84vh]">
        <div className="flex-grow overflow-y-auto min-h-0 no-scrollbar p-1">
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
              {isNumericalQuestion() ? (
                <div className="space-y-4">
                  <label htmlFor="numerical-input" className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Enter Numerical Answer:
                  </label>
                  <input
                    type="text"
                    id="numerical-input"
                    value={numericalAnswer}
                    readOnly
                    onPaste={(e) => e.preventDefault()}
                    placeholder="Enter your answer using the keypad"
                    className="w-full p-4 rounded-lg border-2 border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all cursor-default"
                  />

                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeypadClick(key)}
                        className={`
                          flex items-center justify-center p-4 rounded-lg shadow-sm text-lg font-bold transition-all duration-100
                          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                          hover:bg-blue-50 dark:hover:bg-gray-700
                          active:bg-blue-600 active:text-white dark:active:bg-blue-600
                          text-text-light dark:text-text-dark
                          ${key === 'backspace' ? 'text-red-500' : ''}
                        `}
                      >
                        {key === 'backspace' ? '⌫' : key}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                    Use the keypad to enter your answer.
                  </p>
                </div>
              ) : (
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
              )}
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

      <div className="flex flex-col gap-4">
        <aside className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark lg:sticky lg:top-6 lg:self-start max-h-[72vh] overflow-y-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmittingRef.current}
            className="w-full mb-6 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit Test
          </button>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Time Left:</h3>
            <span className="text-lg font-semibold text-text-light dark:text-text-dark">
              {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Question Palette</h3>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {testData?.sections?.map((section, index) => (
              <button
                key={index}
                onClick={() => handleSectionSwitch(index)}
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-background-dark/70 backdrop-blur-sm transition-opacity"></div>
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark p-6 text-left align-middle shadow-2xl transition-all border border-border-light dark:border-border-dark">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 rounded-full bg-primary/10 p-4 text-primary">
                <span className="material-icons-outlined text-4xl">assignment_turned_in</span>
              </div>
              <h3 className="text-xl font-bold leading-6 text-text-light dark:text-text-dark mb-2">
                Submit Test
              </h3>
              <div className="mb-8">
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">
                  Are you sure you want to submit the test?
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-transparent px-5 py-3 text-base font-medium text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleSubmit();
                }}
                className="flex-1 rounded-lg border border-transparent bg-primary px-5 py-3 text-base font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-opacity shadow-lg shadow-primary/20"
                type="button"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;