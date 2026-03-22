import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTestData } from '../utils/testData';
import { Test } from '../data';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import ImageWithProgress from './ImageWithProgress';
import { RenderMath } from './question';
import ReportFlag from './ReportFlag';

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
  ntaMode?: boolean;
}

// escapeLatex removed - was unused

const TestInterface: React.FC<TestInterfaceProps> = ({ test, onSubmitSuccess, exam, ntaMode = false }) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [candidateName, setCandidateName] = useState<string>('Candidate');
  const [candidatePhoto, setCandidatePhoto] = useState<string | null>(null);
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

  // Format time as MM:SS for NTA mode
  const formatTimeMinutes = (seconds: number): string => {
    const totalMinutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(totalMinutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // renderMixedMath now uses shared RenderMath component
  const renderMixedMath = (text: string) => <RenderMath text={text} />;

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

    if (!currentTestData) {
      console.error('No test data available');
      return;
    }

    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

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

      let error;
      let finalSubmissionId = currentStudentTestId;

      if (currentStudentTestId) {
        const { error: updateError } = await supabase
          .from('student_tests')
          .update(submissionData)
          .eq('id', currentStudentTestId)
          .select();

        error = updateError;
      } else {
        // Fallback to insert if for some reason ID is missing (should not happen in normal flow)
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
        setIsSubmitting(false);
      } else {
        // Trigger Score Calculation (fire-and-forget, don't block navigation)
        supabase.auth.getSession().then(({ data: sessionData }) => {
          const token = sessionData?.session?.access_token;
          fetch(`https://prepaired-backend.onrender.com/api/v1/scores/${finalSubmissionId}/calculate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          }).catch(error => {
            console.error('Failed to trigger score calculation', error);
          });
        }).catch(error => {
          console.error('Failed to get session for score calculation', error);
        });

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
      setIsSubmitting(false);
    }
  }, [onSubmitSuccess, navigate]); // Only depend on stable functions

  useEffect(() => {
    // Prevent re-initialization using ref (survives re-renders and strict mode)
    if (initializationRef.current) {
      return;
    }

    const initializeTest = async () => {
      if (!test || !test.url) {
        setIsLoading(false);
        return;
      }

      // Mark as initializing immediately
      initializationRef.current = true;
      setIsLoading(true);
      setInitError(null);

      try {
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

        // Set candidate display name and photo for NTA header
        const displayName =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split('@')[0] ||
          'Candidate';
        setCandidateName(displayName);
        const photoUrl =
          user?.user_metadata?.avatar_url ||
          user?.user_metadata?.picture ||
          null;
        setCandidatePhoto(photoUrl);

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
            testStartTimeISO = (existingTest as any).started_at ?? new Date().toISOString();
            setStudentTestId((existingTest as any).id);
            // Load answers from DB if available
            if ((existingTest as any).answers) {
              setAnswers((existingTest as any).answers);
            }
          } else {
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

        setIsLoading(false);
      } catch (error: any) {
        console.error('Failed to initialize test:', error);
        setInitError(error?.message || 'Failed to load test. Please try again.');
        setIsLoading(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.url, test?.markingScheme, exam]); // Dependencies are stable

  // Separate effect to handle submission when time runs out
  useEffect(() => {
    if (timeLeft === 0 && testData && !isSubmittingRef.current) {
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

  // handleNumericalChange removed - was unused (using handleKeypadClick instead)

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

    if (sectionIndex !== -1) {
      setCurrentSectionIndex(prevIndex => {
        if (prevIndex !== sectionIndex) {
          return sectionIndex;
        }
        return prevIndex;
      });
    }
  }, [currentQuestionIndex, testData]);

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

  // NTA action handlers
  const handleClear = () => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.uuid];
    setAnswers(newAnswers);
    setSelectedOption(null);
    setNumericalAnswer('');
    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestionIndex] = 'notAnswered';
    setQuestionStatuses(newStatuses);
  };

  const handleNTASaveAndNext = () => {
    if (currentQuestion) {
      const newStatuses = [...questionStatuses];
      if (newStatuses[currentQuestionIndex] === 'notVisited') {
        newStatuses[currentQuestionIndex] = answers[currentQuestion.uuid] ? 'answered' : 'notAnswered';
        setQuestionStatuses(newStatuses);
      }
    }
    handleNext();
  };

  const handleNTASaveAndMarkForReview = () => {
    if (currentQuestion) {
      const newStatuses = [...questionStatuses];
      newStatuses[currentQuestionIndex] = 'markedForReview';
      setQuestionStatuses(newStatuses);
    }
    handleNext();
  };

  const handleNTAMarkForReviewAndNext = () => {
    if (currentQuestion) {
      const newStatuses = [...questionStatuses];
      newStatuses[currentQuestionIndex] = 'markedForReview';
      setQuestionStatuses(newStatuses);
    }
    handleNext();
  };

  // Show loading state during initialization
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading test...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg max-w-md text-center">
          <span className="material-icons-outlined text-5xl text-red-500">error_outline</span>
          <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Failed to Load Test</h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── NTA MODE UI ────────────────────────────────────────────────────────────
  if (ntaMode && testData) {
    const ntaStatusCounts = {
      notVisited: questionStatuses.filter(s => s === 'notVisited').length,
      notAnswered: questionStatuses.filter(s => s === 'notAnswered').length,
      answered: questionStatuses.filter(s => s === 'answered').length,
      markedOnly: questionStatuses.filter((s, i) => s === 'markedForReview' && !answers[testData.questions[i]?.uuid]).length,
      markedAnswered: questionStatuses.filter((s, i) => s === 'markedForReview' && !!answers[testData.questions[i]?.uuid]).length,
    };

    const getNTAShapeStyle = (index: number): React.CSSProperties => {
      const status = questionStatuses[index];
      if (status === 'notVisited') return { backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px' };
      if (status === 'notAnswered') return { backgroundColor: '#d93025', clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' };
      if (status === 'answered') return { backgroundColor: '#2e8b57', clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' };
      if (status === 'markedForReview') return { backgroundColor: '#3f51b5', borderRadius: '50%' };
      return { backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px' };
    };

    return (
      <div style={{ fontFamily: 'Inter, sans-serif', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>

        {/* ── NTA Header ── */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '64px', height: '64px', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', flexShrink: 0, overflow: 'hidden' }}>
              {candidatePhoto
                ? <img src={candidatePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#94a3b8' }}>person</span>
              }
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#64748b', width: '112px' }}>Candidate Name</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>: {candidateName}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#64748b', width: '112px' }}>Exam Name</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>: {test.title}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <span style={{ color: '#64748b', width: '112px' }}>Remaining Time</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>:
                  <span style={{ background: '#2563eb', color: 'white', padding: '1px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '4px' }}>
                    {timeLeft !== null ? formatTimeMinutes(timeLeft) : '--:--'}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <select style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: '13px', borderRadius: '4px', padding: '4px 16px', outline: 'none', minWidth: '150px' }}>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </header>

        {/* ── Main area ── */}
        <main style={{ paddingTop: '88px', paddingBottom: '64px', display: 'flex', height: '100vh', overflow: 'hidden' }}>

          {/* Left: Question workspace */}
          <section style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflowY: 'hidden', borderRight: '1px solid #e2e8f0' }}>

            {/* Question header */}
            <div style={{ padding: '12px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
                Question {currentQuestionIndex + 1}:
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {testData.sections.length > 1 && (
                  <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                    {currentQuestion?.section}
                  </span>
                )}
                {currentQuestion && <ReportFlag questionId={currentQuestion.uuid || currentQuestion.id} />}
              </div>
            </div>

            {/* Section tabs */}
            {testData.sections.length > 1 && (
              <div style={{ padding: '8px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px', flexShrink: 0 }}>
                {testData.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSectionSwitch(idx)}
                    style={{
                      padding: '2px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: currentSectionIndex === idx ? '#2563eb' : '#f1f5f9',
                      color: currentSectionIndex === idx ? 'white' : '#475569',
                    }}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            )}

            {/* Question body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              {currentQuestion && (
                <>
                  <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#1e293b', marginBottom: '24px' }} className="math-text-scope">
                    {renderMixedMath(currentQuestion.text)}
                  </div>

                  {currentQuestion.image && (
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                      <ImageWithProgress
                        src={currentQuestion.image}
                        alt="Question Illustration"
                        className="max-w-full max-h-[35vh] w-auto h-auto rounded"
                      />
                    </div>
                  )}

                  {isNumericalQuestion() ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Enter Numerical Answer:</label>
                      <input
                        type="text"
                        value={numericalAnswer}
                        readOnly
                        placeholder="Use keypad below"
                        style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '4px', fontSize: '16px', color: '#1e293b', background: 'white', cursor: 'default', outline: 'none', width: '240px' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '240px' }}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map(key => (
                          <button
                            key={key}
                            onClick={() => handleKeypadClick(key)}
                            style={{
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: 700,
                              background: 'white',
                              cursor: 'pointer',
                              color: key === 'backspace' ? '#dc2626' : '#1e293b',
                            }}
                          >
                            {key === 'backspace' ? '⌫' : key}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentQuestion.options.map((option) => (
                        <label
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 14px',
                            border: `1.5px solid ${selectedOption === option.id ? '#2563eb' : '#e2e8f0'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: selectedOption === option.id ? '#eff6ff' : 'white',
                          }}
                        >
                          <input
                            type="radio"
                            name={`nta-q-${currentQuestion.id}`}
                            checked={selectedOption === option.id}
                            onChange={() => handleSelectOption(option.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }} className="math-text-scope">
                            <span style={{ fontSize: '15px', color: '#1e293b' }}>{renderMixedMath(option.text)}</span>
                            {option.image && (
                              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <ImageWithProgress
                                  src={option.image}
                                  alt={`Option ${option.id}`}
                                  className="max-w-full max-h-48 w-auto h-auto rounded"
                                />
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* NTA Action buttons */}
            <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleNTASaveAndNext}
                style={{ background: '#2e8b57', color: 'white', padding: '8px 16px', borderRadius: '2px', border: 'none', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
              >
                SAVE &amp; NEXT
              </button>
              <button
                onClick={handleClear}
                style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '2px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
              >
                CLEAR
              </button>
              <button
                onClick={handleNTASaveAndMarkForReview}
                style={{ background: '#d19a66', color: 'white', padding: '8px 16px', borderRadius: '2px', border: 'none', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
              >
                SAVE &amp; MARK FOR REVIEW
              </button>
              <button
                onClick={handleNTAMarkForReviewAndNext}
                style={{ background: '#1e88e5', color: 'white', padding: '8px 16px', borderRadius: '2px', border: 'none', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
              >
                MARK FOR REVIEW &amp; NEXT
              </button>
            </div>
          </section>

          {/* Right: Question Palette */}
          <aside style={{ width: '288px', background: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

            {/* Legend */}
            <div style={{ margin: '8px', padding: '12px', border: '2px dashed #cbd5e1', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 4px' }}>
                {/* Not Visited */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', flexShrink: 0 }}>
                    {ntaStatusCounts.notVisited}
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>Not Visited</span>
                </div>
                {/* Not Answered */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', backgroundColor: '#d93025', clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)', flexShrink: 0 }}>
                    {ntaStatusCounts.notAnswered}
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>Not Answered</span>
                </div>
                {/* Answered */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', backgroundColor: '#2e8b57', clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)', flexShrink: 0 }}>
                    {ntaStatusCounts.answered}
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>Answered</span>
                </div>
                {/* Marked for Review */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', backgroundColor: '#3f51b5', borderRadius: '50%', flexShrink: 0 }}>
                    {ntaStatusCounts.markedOnly}
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>Marked for Review</span>
                </div>
                {/* Answered & Marked */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                  <div style={{ width: '28px', height: '28px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', backgroundColor: '#3f51b5', borderRadius: '50%', flexShrink: 0 }}>
                    {ntaStatusCounts.markedAnswered}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#2e8b57', borderRadius: '50%', border: '1px solid white' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3 }}>Answered &amp; Marked for Review (will be considered for evaluation)</span>
                </div>
              </div>
            </div>

            {/* Section tabs in palette */}
            {testData.sections.length > 1 && (
              <div style={{ padding: '4px 12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {testData.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSectionSwitch(idx)}
                    style={{
                      padding: '1px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: currentSectionIndex === idx ? '#2563eb' : '#f1f5f9',
                      color: currentSectionIndex === idx ? 'white' : '#475569',
                    }}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            )}

            {/* Question grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {filteredQuestions.map((question, idx) => {
                  const origIdx = question.originalIndex;
                  const status = questionStatuses[origIdx];
                  const hasAns = !!answers[question.uuid];
                  const isMarkedAnswered = status === 'markedForReview' && hasAns;
                  const shapeStyle = getNTAShapeStyle(origIdx);

                  return (
                    <div
                      key={question.id}
                      onClick={() => handlePaletteClick(origIdx)}
                      style={{
                        width: '100%',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: status === 'notVisited' ? '#475569' : 'white',
                        cursor: 'pointer',
                        position: 'relative',
                        outline: origIdx === currentQuestionIndex ? '2px solid #2563eb' : 'none',
                        outlineOffset: '1px',
                        ...shapeStyle
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                      {isMarkedAnswered && (
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#2e8b57', borderRadius: '50%', border: '1px solid white' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>
        </main>

        {/* ── NTA Footer ── */}
        <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, height: '64px', background: '#f1f5f9', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              style={{ color: '#475569', fontWeight: 700, fontSize: '11px', padding: '6px 24px', border: '1px solid #94a3b8', borderRadius: '2px', background: 'white', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
            >
              &lt;&lt; BACK
            </button>
            <button
              onClick={handleNext}
              disabled={!testData.questions || currentQuestionIndex === testData.questions.length - 1}
              style={{ color: '#475569', fontWeight: 700, fontSize: '11px', padding: '6px 24px', border: '1px solid #94a3b8', borderRadius: '2px', background: 'white', cursor: (!testData.questions || currentQuestionIndex === testData.questions.length - 1) ? 'not-allowed' : 'pointer', opacity: (!testData.questions || currentQuestionIndex === testData.questions.length - 1) ? 0.4 : 1 }}
            >
              NEXT &gt;&gt;
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmittingRef.current}
            style={{ background: '#2e8b57', color: 'white', padding: '8px 32px', borderRadius: '2px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', opacity: isSubmittingRef.current ? 0.5 : 1 }}
          >
            SUBMIT
          </button>
        </footer>

        {/* ── Submit confirmation modal ── */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '16px', borderRadius: '50%', background: '#dbeafe', padding: '16px' }}>
                  <span className="material-icons-outlined" style={{ fontSize: '36px', color: '#2563eb' }}>assignment_turned_in</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Submit Test</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Are you sure you want to submit the test?</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', fontWeight: 500, color: '#1e293b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setIsModalOpen(false); isSubmittingRef.current = false; handleSubmit(); }}
                  style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Submitting overlay ── */}
        {isSubmitting && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '16px', borderRadius: '50%', background: '#dbeafe', padding: '16px' }}>
                  <span className="material-icons-outlined" style={{ fontSize: '36px', color: '#2563eb', animation: 'spin 1s linear infinite' }}>autorenew</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Submitting Test...</h3>
                <p style={{ color: '#64748b' }}>Please wait. Do not close the browser.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // ── END NTA MODE UI ────────────────────────────────────────────────────────

  // Shared question palette content used in both desktop sidebar and mobile drawer
  const questionPaletteContent = (
    <>
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
            onClick={() => {
              handlePaletteClick(question.originalIndex);
              setIsMobilePaletteOpen(false);
            }}
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
          <span className="text-text-light dark:text-text-dark">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500" />
          <span className="text-text-light dark:text-text-dark">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500" />
          <span className="text-text-light dark:text-text-dark">Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark" />
          <span className="text-text-light dark:text-text-dark">Not Visited</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 min-h-0">
      {/* Mobile fixed top bar: timer + submit + palette toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[80] flex items-center justify-between bg-surface-light dark:bg-surface-dark px-3 py-2 shadow-card-light dark:shadow-card-dark">
        <div className="flex items-center gap-2">
          <span className="material-icons-outlined text-primary text-xl">timer</span>
          <span className="text-sm font-semibold text-text-light dark:text-text-dark">
            {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobilePaletteOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
          >
            <span className="material-icons-outlined text-lg">grid_view</span>
            Q{currentQuestionIndex + 1}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmittingRef.current}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-primary text-white disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Question area — pt-12 on mobile to clear fixed top bar, pb-16 to clear fixed bottom nav */}
      <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-3 pt-12 pb-16 sm:p-6 md:p-8 lg:pt-8 lg:pb-8 rounded-xl shadow-card-light dark:shadow-card-dark flex flex-col min-h-0 flex-1 lg:h-full">
        <div className="flex-grow overflow-y-auto min-h-0 no-scrollbar p-1">
          {currentQuestion && (
            <>
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark">
                  Question {currentQuestionIndex + 1} of {testData?.questions?.length}
                </h2>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark px-2 sm:px-3 py-1 rounded-full">
                    {currentQuestion.section}
                  </span>
                  <ReportFlag questionId={currentQuestion.uuid || currentQuestion.id} />
                </div>
              </div>
              <p className="math-text-scope text-base sm:text-xl text-text-light dark:text-text-dark leading-relaxed mb-5 sm:mb-8 break-words whitespace-pre-wrap">
                {renderMixedMath(currentQuestion.text)}
              </p>
              {currentQuestion.image && (
                <div className="mt-2 mb-8 w-full flex justify-center">
                  <ImageWithProgress
                    src={currentQuestion.image}
                    alt="Question Illustration"
                    className="max-w-full md:max-w-xl max-h-[35vh] w-auto h-auto rounded-lg"
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
                <div className="space-y-3 sm:space-y-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full flex items-center text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${selectedOption === option.id
                        ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
                        }`}
                    >
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center font-bold text-sm sm:text-base rounded-full mr-3 sm:mr-4 border-2 ${selectedOption === option.id ? 'text-white bg-primary border-primary' : 'text-primary border-primary'
                          }`}
                      >
                        {option.id.toUpperCase()}
                      </span>
                      <div className="flex flex-col flex-1 min-w-0 gap-2 sm:gap-3">
                        <span className="text-base sm:text-xl text-text-light dark:text-text-dark break-words">{renderMixedMath(option.text)}</span>
                        {option.image && (
                          <div className="mt-1 sm:mt-2 flex justify-center">
                            <ImageWithProgress
                              src={option.image}
                              alt={`Option ${option.id} Illustration`}
                              className="max-w-full max-h-32 sm:max-h-40 w-auto h-auto inline-block rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop navigation buttons (inline) */}
        <div className="hidden lg:flex mt-8 pt-6 border-t border-border-light dark:border-border-dark items-center justify-between flex-shrink-0">
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

      {/* Mobile fixed bottom navigation bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark px-3 py-2 flex items-center justify-between safe-bottom">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg font-medium text-xs text-text-secondary-light dark:text-text-secondary-dark active:bg-background-light dark:active:bg-background-dark transition-colors disabled:opacity-40"
        >
          <span className="material-icons-outlined text-xl">arrow_back</span>
          Previous
        </button>

        <button
          onClick={handleMarkForReview}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${questionStatuses[currentQuestionIndex] === 'markedForReview' ? 'text-orange-500 bg-orange-500/10' : 'text-orange-500 active:bg-orange-500/10'}`}
        >
          <span className="material-icons-outlined text-xl">
            {questionStatuses[currentQuestionIndex] === 'markedForReview' ? 'bookmark' : 'bookmark_border'}
          </span>
          Review
        </button>

        <button
          onClick={handleNext}
          disabled={!testData || !testData.questions || currentQuestionIndex === testData.questions.length - 1}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg font-medium text-xs text-primary active:bg-primary/10 transition-colors disabled:opacity-40"
        >
          <span className="material-icons-outlined text-xl">arrow_forward</span>
          Next
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col gap-4 h-full">
        <aside className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark h-full overflow-y-auto flex flex-col">
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

          {questionPaletteContent}
        </aside>
      </div>

      {/* Mobile question palette drawer */}
      {isMobilePaletteOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] flex flex-col justify-end">
          <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm" onClick={() => setIsMobilePaletteOpen(false)} />
          <div className="relative bg-surface-light dark:bg-surface-dark rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto shadow-2xl border-t border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Questions</h3>
              <button
                onClick={() => setIsMobilePaletteOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-background-light dark:bg-background-dark"
              >
                <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark">close</span>
              </button>
            </div>
            {questionPaletteContent}
          </div>
        </div>
      )}

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
                  // Reset the submission ref to ensure a fresh attempt
                  isSubmittingRef.current = false;
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

      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-background-dark/70 backdrop-blur-sm transition-opacity"></div>
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark p-6 text-left align-middle shadow-2xl transition-all border border-border-light dark:border-border-dark">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 rounded-full bg-primary/10 p-4 text-primary">
                <span className="material-icons-outlined text-4xl animate-spin">autorenew</span>
              </div>
              <h3 className="text-xl font-bold leading-6 text-text-light dark:text-text-dark mb-2">
                Submitting Test...
              </h3>
              <div className="mb-4">
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">
                  Do not refresh/close your browser and please wait while we are submitting your test.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;