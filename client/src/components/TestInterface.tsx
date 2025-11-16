import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTestData } from '../utils/testData';
import { Test } from '../data';
import { InlineMath } from 'react-katex';
import { supabase } from '../utils/supabaseClient';

type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'notVisited';

const TestInterface: React.FC = () => {
  const [testData, setTestData] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  function renderMixedMath(text: string) {
    const parts = text.split(/(\$[^$]*\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return <InlineMath key={i}>{math}</InlineMath>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  const handleSubmit = useCallback(async () => {
    if (testData) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const submission = {
          test_id: testData.testId,
          answers: answers,
          user_id: user.id,
        };

        const { error } = await supabase.from('submissions').insert([submission]);

        if (error) {
          console.error('Error submitting test:', error);
        } else {
          console.log('Test submitted successfully!');
        }
      } else {
        console.error('User not logged in');
      }
    }
  }, [answers, testData]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    const initializeTest = async () => {
      const data = fetchTestData();
      const adaptedTestData: Test = {
        id: data.testId,
        testId: data.testId,
        title: data.title,
        description: `${data.duration / 60} minutes | ${data.totalMarks} Marks`,
        duration: data.duration,
        totalMarks: data.totalMarks,
        totalQuestions: data.questions.length,
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
        sections: data.sections,
        questions: data.questions,
      };
      setTestData(adaptedTestData);
      setQuestionStatuses(Array(data.questions.length).fill('notVisited'));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not logged in. Cannot fetch test start time.");
        return;
      }

      const { data: studentTestData, error } = await supabase
        .from('student_tests')
        .select('started_at')
        .eq('user_id', user.id)
        .eq('test_id', data.testId)
        .single();

      let testStartTime: string;
      if (error || !studentTestData) {
        console.error('Error fetching test start time, creating a new entry:', error);
        const { data: newStudentTest, error: insertError } = await supabase
          .from('student_tests')
          .insert({ test_id: data.testId, user_id: user.id })
          .select('started_at')
          .single();

        if (insertError || !newStudentTest) {
          console.error('Failed to create a new student test entry.', insertError);
          testStartTime = new Date().toISOString();
        } else {
          testStartTime = newStudentTest.started_at;
        }
      } else {
        testStartTime = studentTestData.started_at;
      }

      const testDuration = data.duration;
      const timer = setInterval(() => {
        const now = new Date();
        const startTime = new Date(testStartTime);
        const elapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const newTimeLeft = testDuration - elapsedTime;

        if (newTimeLeft <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
          handleSubmitRef.current();
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 1000);

      const savedAnswers = localStorage.getItem(`test-answers-${data.testId}`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }

      return () => {
        clearInterval(timer);
      };
    };

    initializeTest();
  }, []);

  useEffect(() => {
    if (testData) {
      localStorage.setItem(`test-answers-${testData.testId}`, JSON.stringify(answers));
    }
  }, [answers, testData]);

  const handleNext = () => {
    if (testData && testData.questions && currentQuestionIndex < testData.questions.length - 1) {
      const newQuestionStatuses = [...questionStatuses];
      if (questionStatuses[currentQuestionIndex] === 'notVisited') {
        newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
        setQuestionStatuses(newQuestionStatuses);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (currentQuestion) {
      setAnswers({ ...answers, [currentQuestion.id]: optionId });
      setSelectedOption(optionId);
      const newQuestionStatuses = [...questionStatuses];
      newQuestionStatuses[currentQuestionIndex] = 'answered';
      setQuestionStatuses(newQuestionStatuses);
    }
  };

  const handleMarkForReview = () => {
    const newQuestionStatuses = [...questionStatuses];
    if (currentQuestion && questionStatuses[currentQuestionIndex] !== 'markedForReview') {
      newQuestionStatuses[currentQuestionIndex] = 'markedForReview';
    } else if (currentQuestion) {
      newQuestionStatuses[currentQuestionIndex] = answers[currentQuestion.id] ? 'answered' : 'notAnswered';
    }
    setQuestionStatuses(newQuestionStatuses);
  };

  const handlePaletteClick = (index: number) => {
    const newQuestionStatuses = [...questionStatuses];
    if (questionStatuses[currentQuestionIndex] === 'notVisited') {
      newQuestionStatuses[currentQuestionIndex] = 'notAnswered';
      setQuestionStatuses(newQuestionStatuses);
    }
    setCurrentQuestionIndex(index);
  };

  const currentQuestion = testData?.questions && testData.questions[currentQuestionIndex];

  const filteredQuestions = testData?.questions?.map((q, i) => ({ ...q, originalIndex: i }))
    .filter(q => testData.sections && q.section === testData.sections[currentSectionIndex].name) || [];

  useEffect(() => {
    if (currentQuestion) {
      setSelectedOption(answers[currentQuestion.id] || null);
    }
  }, [currentQuestion, answers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-xl shadow-card-light dark:shadow-card-dark flex flex-col">
        <div className="flex-grow">
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
              <p className="text-base text-text-light dark:text-text-dark leading-relaxed mb-8">
                {renderMixedMath(currentQuestion.text)}
              </p>
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full flex items-center text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === option.id
                        ? 'border-primary dark:border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full mr-4 border-2 ${
                        selectedOption === option.id
                          ? 'text-white bg-primary border-primary'
                          : 'text-primary border-primary'
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <span className="text-text-light dark:text-text-dark">
                      {renderMixedMath(option.text)}
                    </span>
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
      <aside className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-card-light dark:shadow-card-dark">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Time Left:</h3>
          <span className="text-lg font-semibold text-text-light dark:text-text-dark">
            {timeLeft !== null && `${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}`}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Question Palette</h3>
        <div className="flex items-center justify-center space-x-2 mb-4">
          {testData?.sections?.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSectionIndex(index)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                currentSectionIndex === index
                  ? 'bg-primary text-white'
                  : 'bg-background-light dark:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark'
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
              className={`w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors ${
                questionStatuses[question.originalIndex] === 'answered'
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
            <div className="w-5 h-5 rounded-md bg-green-500/20 border border-green-500"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500"></div>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500"></div>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark"></div>
            <span>Not Visited</span>
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">Submit Test</button>
      </aside>
    </div>
  );
};

export default TestInterface;
