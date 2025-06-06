// src/app/test-interface/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaClock, FaFlag, FaSpinner } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { TestData, TestState, Question } from '@/types/index';
import { v4 as uuidv4 } from 'uuid'; // Import types from your testSlice

// Import ALL necessary types and actions from your testSlice
import testSlice, {
  setTestLoading,
  setTestError,
  setUserAnswer,           // <-- NEW: Import this
  setFlaggedQuestion,       // <-- NEW: Import this
  unsetFlaggedQuestion,     // <-- NEW: Import this
  setCurrentQuestionIndex,
  clearTestState,  // <-- NEW: Import this
} from '@/redux/slices/testSlice';


// Lazy load components
const MCQComponent = dynamic(() => import('@/components/TestInterface/MCQComponent'));
const TheoryComponent = dynamic(() => import('@/components/TestInterface/TheoryComponent'));
const CodingComponent = dynamic(() => import('@/components/TestInterface/CodingComponent'));
const NavigationSidebar = dynamic(() => import('@/components/TestInterface/NavigationSidebar'));
const GAComponent = dynamic(() => import('@/components/TestInterface/GAComponent'));
const ConfirmationModal = dynamic(() => import('@/components/TestInterface/ConfirmationModal'));


// IMPORTANT: Ensure these interfaces match your testSlice.ts and backend response
// It's generally better to import these directly from a central types file or your testSlice.ts
// For now, I'm defining them here based on your testSlice for clarity.
// If your TestSlice's `TestData` type is different from `TestDataWithRounds`, adjust here.
interface TestDataWithRounds extends TestData { // Assuming TestData from slice is the base, and you're adding methods or computed props
  // TestData from testSlice already includes id, rounds, totalDurationMinutes
  title: string; // If your backend also sends a title (not in current TestData from slice)
}

// Define QuestionStatus type for clarity
type QuestionStatus = 'attempted' | 'non-attempted' | 'skipped' | 'flagged';


const TestInterfacePage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  // Directly use the TestState type from your slice
  const testState: TestState = useSelector((state: RootState) => state.test);
  const dispatch = useDispatch();
  const router = useRouter();

  // Destructure relevant state directly from Redux for easier access
  const { testData, userAnswers, flaggedQuestions, loading, error, currentQuestionIndex: reduxCurrentQuestionIndex } = testState;


  // Local component states (ONLY for UI elements not directly managed by Redux)
  // [IMPORTANT]: userAnswers and flaggedQuestions are NO LONGER local states here.
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0); // Track current round
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // REMOVED: Now from Redux: reduxCurrentQuestionIndex


  // Use -1 for uninitialized timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(-1);
  const [initialTime, setInitialTime] = useState<number>(-1); // Store initial time for progress bar
  const [userId, setUserId] = useState<string | null>(null);

  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open sidebar by default
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // --- Initialize userId from localStorage ---
  useEffect(() => {
    let currentUserId = localStorage.getItem('appUserId');
    if (!currentUserId) {
      currentUserId = uuidv4();
      localStorage.setItem('appUserId', currentUserId);
    }
    setUserId(currentUserId);
  }, []);


  // Initialize timer when testData loads (and timer not initialized)
  useEffect(() => {
    // Only initialize if testData is present, rounds exist, and timer hasn't started (-1)
    if (
      testData &&
      testData.rounds && testData.rounds.length > 0 &&
      !loading &&
      !error &&
      timeRemaining === -1 &&
      !isTestSubmitted
    ) {
      console.log('Initializing timer based on test data with rounds.');
      console.log('Test Data with Rounds received:', testData);

      const calculatedTime = testData.totalDurationMinutes * 60;
      setTimeRemaining(calculatedTime);
      setInitialTime(calculatedTime); // Store initial time
      
      // userAnswers initialization is now handled by Redux initialState and `setUserAnswer` as user types.
      // Do NOT re-initialize userAnswers locally or in Redux here if you want it to persist through component re-renders.
      // It starts as {} in Redux.
    } else if (
      !testData &&
      !loading &&
      !error &&
      !isTestSubmitted &&
      timeRemaining === -1 // Prevent redirect if timer was already running (e.g., on refresh)
    ) {
      // No test data - likely user refreshed or navigated directly - redirect
      console.warn('No test data found. Redirecting to evaluation form.');
      router.replace('/evaluation');
    }
  }, [testData, loading, error, timeRemaining, isTestSubmitted, router]);

  // Timer countdown effect
  useEffect(() => {
    if (
      timeRemaining <= 0 ||
      loading ||
      !testData ||
      isTestSubmitted ||
      timeRemaining === -1
    ) {
      if (timeRemaining < 0 && timeRemaining !== -1) setTimeRemaining(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, loading, testData, isTestSubmitted]);

  const handleSubmitTest = useCallback(async () => {
    // Use Redux `loading` state to prevent double submission
    // Also ensure userId is available
    if (isTestSubmitted || loading || !testData || !userId) {
      if (!userId) toast.error("User ID not available. Cannot submit.");
      return;
    }

    setIsTestSubmitted(true); // Local flag to prevent immediate re-submission attempts
    dispatch(setTestLoading(true));
    dispatch(setTestError(null));

    console.log('Submitting test...');

    try {
      if (!testData || !testData.id) {
        console.error("Test data is null/undefined or testData.id is missing:", testData);
        toast.error("Test data not found. Cannot submit.");
        return;
      }

      const submissionPayload = {
        testId: testData.id,
        userAnswers: userAnswers,
        flaggedQuestions: flaggedQuestions,
        userId: userId, // <-- NEW: Include userId in the payload
      };

      console.log('TestInterfacePage: Data being sent to /api/submit-test-for-review:', submissionPayload);

      const response = await fetch('/api/submit-test-for-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Grading failed.' }));
        throw new Error(errorData.error || 'Grading failed.');
      }

      const results = await response.json();
      toast.success('Test submitted successfully!');

      // NEW: Clear Redux test state after successful submission
      dispatch(clearTestState());

      // Navigate to the review page using the reviewSessionId returned from the backend
      router.push(`/review-test/${results.reviewSessionId}`);
    } catch (err: any) {
      console.error('Error submitting test:', err);
      dispatch(setTestError(`Submission failed: ${err.message}`));
      setIsTestSubmitted(false); // Allow resubmission if failed
      toast.error(err.message || 'Submission failed');
    } finally {
      dispatch(setTestLoading(false));
    }
  }, [isTestSubmitted, loading, testData, userAnswers, flaggedQuestions, userId, dispatch, router]); // Added userId to dependencies

  // Auto-submit when time is up
  // Auto-submit when time is up
  useEffect(() => {
    if (timeRemaining === 0 && !isTestSubmitted && testData && !loading) {
      console.log('Time is up! Auto-submitting...');
      handleSubmitTest();
    }
  }, [timeRemaining, isTestSubmitted, testData, loading, handleSubmitTest]);

  // Derived data: Get current round and question
  const currentRound = useMemo(
    () => testData?.rounds[currentRoundIndex],
    [testData, currentRoundIndex]
  );

  const currentQuestion = useMemo(
    () => currentRound?.questions[reduxCurrentQuestionIndex], // Use reduxCurrentQuestionIndex
    [currentRound, reduxCurrentQuestionIndex]
  );

  const totalQuestionsInCurrentRound = useMemo(() => currentRound?.questions.length || 0, [currentRound]);
  const totalRounds = useMemo(() => testData?.rounds.length || 0, [testData]);
  const totalQuestionsAcrossAllRounds = useMemo(() =>
      testData?.rounds.reduce((count, round) => count + round.questions.length, 0) || 0,
      [testData]
  );


  // Question progress (based on index within the current round)
  const questionProgressPercentage = useMemo(() => {
    return totalQuestionsInCurrentRound > 0 ? ((reduxCurrentQuestionIndex + 1) / totalQuestionsInCurrentRound) * 100 : 0;
  }, [reduxCurrentQuestionIndex, totalQuestionsInCurrentRound]);

  // Time progress (based on remaining time)
  const timeProgressPercentage = useMemo(() => {
      if (initialTime <= 0 || timeRemaining < 0) return 0;
      // Calculate percentage of time elapsed
      return ((initialTime - timeRemaining) / initialTime) * 100;
  }, [timeRemaining, initialTime]);


  // Calculate question status (attempted, non-attempted, skipped, flagged)
  const getQuestionStatus = useCallback((questionId: string): QuestionStatus => {
      const answer = userAnswers[questionId]; // <-- FROM REDUX
      if (flaggedQuestions.includes(questionId)) { // <-- FROM REDUX
          return 'flagged';
      } else if (answer === 'SKIPPED') {
          return 'skipped';
      } else if (answer !== null && answer !== undefined && answer !== '') {
          const question = testData?.rounds.flatMap(r => r.questions).find(q => q.id === questionId);
          if (typeof answer === 'string' && answer.trim() === '' && (question?.type === 'theoretical' || question?.type === 'coding-challenge')) {
               return 'non-attempted';
          }
          return 'attempted';
      } else {
          return 'non-attempted';
      }
  }, [userAnswers, flaggedQuestions, testData?.rounds]); // Dependencies from Redux state


  // Count attempted questions across all rounds
   const attemptedQuestionCount = useMemo(() => {
       if (!testData?.rounds) return 0;
       return testData.rounds.flatMap(r => r.questions).filter(q => {
           const status = getQuestionStatus(q.id);
           return status === 'attempted' || status === 'skipped' || status === 'flagged';
       }).length;
   }, [testData?.rounds, getQuestionStatus]);


  // Format timer as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  // Navigation handlers
  const handleNavigation = useCallback(
    (direction: 'next' | 'prev') => {
      if (!testData) return;

      const currentRoundQuestions = testData.rounds[currentRoundIndex].questions;
      const totalQuestionsInCurrent = currentRoundQuestions.length;
      const totalRoundsCount = testData.rounds.length;

      if (direction === 'next') {
        if (reduxCurrentQuestionIndex < totalQuestionsInCurrent - 1) {
          dispatch(setCurrentQuestionIndex(reduxCurrentQuestionIndex + 1)); // Dispatch to Redux
        } else if (currentRoundIndex < totalRoundsCount - 1) {
          setCurrentRoundIndex(prev => prev + 1); // Local state for round index
          dispatch(setCurrentQuestionIndex(0)); // Dispatch to Redux
        } else {
          console.log("Reached end of test.");
        }
      } else { // direction === 'prev'
        if (reduxCurrentQuestionIndex > 0) {
          dispatch(setCurrentQuestionIndex(reduxCurrentQuestionIndex - 1)); // Dispatch to Redux
        } else if (currentRoundIndex > 0) {
          const prevRoundQuestions = testData.rounds[currentRoundIndex - 1].questions;
          setCurrentRoundIndex(prev => prev - 1); // Local state for round index
          dispatch(setCurrentQuestionIndex(prevRoundQuestions.length - 1)); // Dispatch to Redux
        } else {
          console.log("Reached beginning of test.");
        }
      }
    },
    [currentRoundIndex, reduxCurrentQuestionIndex, testData, dispatch]
  );

  // Update user answer - now dispatches to Redux
  const onAnswerChange = useCallback(
    (id: string, answer: any) => {
      dispatch(setUserAnswer({ questionId: id, answer: answer })); // Dispatch Redux action
      console.log(`Dispatched Redux setUserAnswer for ${id}: ${answer}`); // For debugging
    },
    [dispatch]
  );

  // Toggle flag status for a question - now dispatches to Redux
  const toggleFlagQuestion = useCallback((questionId: string) => {
      if (flaggedQuestions.includes(questionId)) { // Use flaggedQuestions from Redux
          dispatch(unsetFlaggedQuestion(questionId)); // Dispatch Redux action
          console.log(`Dispatched Redux unsetFlaggedQuestion for ${questionId}`);
      } else {
          dispatch(setFlaggedQuestion(questionId)); // Dispatch Redux action
          console.log(`Dispatched Redux setFlaggedQuestion for ${questionId}`);
      }
  }, [dispatch, flaggedQuestions]); // Dependency on flaggedQuestions from Redux

  const handleSkip = () => {
    if (currentQuestion) {
      onAnswerChange(currentQuestion.id, 'SKIPPED');
      handleNavigation('next');
    }
  };

  // Handle sidebar question selection (now takes roundIndex and questionIndex)
  const handleSidebarQuestionSelect = useCallback((roundIndex: number, questionIndex: number) => {
    setCurrentRoundIndex(roundIndex); // Local state for round index
    dispatch(setCurrentQuestionIndex(questionIndex)); // Dispatch to Redux
    // Keep sidebar open
  }, [dispatch]);

  // Handle exit without evaluation
  const handleExitWithoutEvaluation = useCallback(() => {
      // Assuming you have an action to clear test data in Redux
      // dispatch(clearTestData()); // Example action (if you want to clear redux state on exit)
      router.replace('/evaluation');
  }, [router]);


  // Determine if it's the last question of the last round
  const isLastQuestionOfLastRound = useMemo(() => {
      if (!testData || totalRounds === 0) return false;
      const isLastRound = currentRoundIndex === totalRounds - 1;
      const isLastQuestion = reduxCurrentQuestionIndex === totalQuestionsInCurrentRound - 1; // Use reduxCurrentQuestionIndex
      return isLastRound && isLastQuestion;
  }, [currentRoundIndex, reduxCurrentQuestionIndex, totalRounds, totalQuestionsInCurrentRound, testData]);


  // Show loading or error state (using Redux loading/error)
  if (loading && !testData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <span className="ml-4 text-lg">Loading test...</span>
          </div>
      );
  }

   if (error && !testData) {
       return (
           <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
               <span className="text-lg">Error loading test: {error}</span>
           </div>
       );
   }

  // If no test data after loading, redirect happened in useEffect
  if (!testData && !loading && !error) {
      return null;
  }

   // Ensure testData and rounds exist before rendering the main UI
   if (!testData || !testData.rounds || testData.rounds.length === 0) {
       console.error("Test data or rounds are missing after loading.");
       return (
           <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
               <span className="text-lg">Invalid test data structure.</span>
           </div>
       );
   }


  return (
    <div
      className={`min-h-screen font-roboto ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      } flex`}
    >
        <NavigationSidebar
            isOpen={isSidebarOpen}
            rounds={testData.rounds}
            currentRoundIndex={currentRoundIndex}
            currentQuestionIndex={reduxCurrentQuestionIndex} // Use reduxCurrentQuestionIndex
            onQuestionSelect={handleSidebarQuestionSelect}
            onClose={() => setIsSidebarOpen(false)}
            theme={theme}
            userAnswers={userAnswers} // <-- FROM REDUX
            flaggedQuestions={flaggedQuestions} // <-- FROM REDUX
            onExitWithoutEvaluation={handleExitWithoutEvaluation}
            getQuestionStatus={getQuestionStatus}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
        />

        {!isSidebarOpen && (
            <button
                onClick={() => setIsSidebarOpen(true)}
                className={`fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                aria-label="Open navigation sidebar"
            >
                <FaArrowRight />
            </button>
        )}

      <header className={`fixed top-0 right-0 z-40 flex items-center justify-between px-8 py-3 ${
          theme === 'dark' ? 'bg-gray-900/70' : 'bg-white/70'
      } backdrop-blur-sm shadow-md transition-all duration-300 ${isSidebarOpen ? 'left-80' : 'left-0'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FaClock className="text-lg" />
            <span className="font-medium">{formatTime(timeRemaining === -1 ? 0 : timeRemaining)}</span>
          </div>
           <div className="w-40 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${timeProgressPercentage}%` }}
                  transition={{ duration: 1 }}
                />
            </div>
           <div className="w-40 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sky-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${questionProgressPercentage}%` }}
                  transition={{ duration: 0.4 }}
                />
            </div>
            <span className="text-sm font-medium">
                {attemptedQuestionCount} / {totalQuestionsAcrossAllRounds} Answered
            </span>
            {totalRounds > 0 && (
                <span className="text-sm font-medium ml-4">
                    Round {currentRoundIndex + 1} of {totalRounds}: {currentRound?.name}
                </span>
            )}
        </div>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiMoon /> : <FiSun />}
        </button>
      </header>

      <main className={`flex-1 max-w-7xl mx-auto pt-24 pb-32 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'mx-auto'}`}>
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentQuestion.type === 'multiple-choice' ? (
                  <MCQComponent
                    question={currentQuestion as Extract<Question, { type: 'multiple-choice' }>}
                    userAnswer={userAnswers[currentQuestion.id]} // <-- FROM REDUX
                    onAnswerChange={onAnswerChange} // <-- DISPATCHES TO REDUX
                    theme={theme}
                    isFlagged={flaggedQuestions.includes(currentQuestion.id)} // <-- FROM REDUX
                    onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)} // <-- DISPATCHES TO REDUX
                  />
                ) : currentQuestion.type === 'general-aptitude' ? (
                  <GAComponent
                    question={currentQuestion as Extract<Question, { type: 'general-aptitude' }>}
                    userAnswer={userAnswers[currentQuestion.id]} // <-- FROM REDUX
                    onAnswerChange={onAnswerChange} // <-- DISPATCHES TO REDUX
                    theme={theme}
                    isFlagged={flaggedQuestions.includes(currentQuestion.id)} // <-- FROM REDUX
                    onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)} // <-- DISPATCHES TO REDUX
                  />
                ) : currentQuestion.type === 'theoretical' ? (
                  <TheoryComponent
                    question={currentQuestion as Extract<Question , { type: 'theoretical' }>}
                    userAnswer={userAnswers[currentQuestion.id]} // <-- FROM REDUX
                    onAnswerChange={onAnswerChange} // <-- DISPATCHES TO REDUX
                    theme={theme}
                    isFlagged={flaggedQuestions.includes(currentQuestion.id)} // <-- FROM REDUX
                    onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)} // <-- DISPATCHES TO REDUX
                  />
                ) : currentQuestion.type === 'coding-challenge' ? (
                  <CodingComponent
                    question={currentQuestion as any}
                    userAnswer={userAnswers[currentQuestion.id]} // <-- FROM REDUX
                    onAnswerChange={onAnswerChange} // <-- DISPATCHES TO REDUX
                    theme={theme}
                    isFlagged={flaggedQuestions.includes(currentQuestion.id)} // <-- FROM REDUX
                    onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)} // <-- DISPATCHES TO REDUX
                  />
                ) : (
                  <div className="text-center text-lg mt-10">Unsupported question type: {currentQuestion.type}</div>
                )}
              </motion.div>
            ) : (
                <div className="text-center text-lg mt-20">
                    No question available in this round.
                </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${
          theme === 'dark' ? 'bg-gray-900/70' : 'bg-white/70'
      } backdrop-blur-lg rounded-xl shadow-xl px-6 py-3 flex gap-4 transition-all duration-300 ${isSidebarOpen ? 'ml-40' : 'ml-0'}`}>
        <motion.button
          onClick={() => handleNavigation('prev')}
          disabled={currentRoundIndex === 0 && reduxCurrentQuestionIndex === 0} // Use reduxCurrentQuestionIndex
          className={`p-3 rounded-lg transition-colors ${
            theme === 'dark' ? 'text-gray-300 hover:bg-gray-800 disabled:opacity-50' : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous question"
        >
          <FaArrowLeft />
        </motion.button>

        {currentQuestion && (
            <motion.button
                onClick={() => toggleFlagQuestion(currentQuestion.id)} // <-- DISPATCHES TO REDUX
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    flaggedQuestions.includes(currentQuestion.id) // <-- FROM REDUX
                        ? 'bg-yellow-500/30 text-yellow-400 hover:bg-yellow-500/40'
                        : (theme === 'dark'
                            ? 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/40'
                            : 'bg-gray-100/50 text-gray-700 hover:bg-gray-100/60')
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={flaggedQuestions.includes(currentQuestion.id) ? 'Unflag question' : 'Flag question'}
            >
                <FaFlag />
                {flaggedQuestions.includes(currentQuestion.id) ? 'Unflag' : 'Flag'}
            </motion.button>
        )}

        <motion.button
          onClick={handleSkip}
          disabled={!currentQuestion || isLastQuestionOfLastRound}
          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Skip question"
        >
          Skip
        </motion.button>

        <motion.button
          onClick={() =>
            isLastQuestionOfLastRound
              ? setShowSubmitModal(true)
              : handleNavigation('next')
          }
          disabled={!currentQuestion && !isLastQuestionOfLastRound}
          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
           aria-label={isLastQuestionOfLastRound ? 'Submit test' : 'Next question'}
        >
          {isLastQuestionOfLastRound ? 'Submit' : <FaArrowRight />}
        </motion.button>
      </div>

        <AnimatePresence>
            {showSubmitModal && (
            <ConfirmationModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={handleSubmitTest}
                theme={theme}
                title="Confirm Submission"
                message="Are you sure you want to submit the test? You will not be able to change your answers after submitting."
                confirmText="Yes, Submit"
                cancelText="No, Cancel"
                userAnswers={userAnswers} // <-- FROM REDUX
                testData={testData as TestDataWithRounds || null}// <-- FROM REDUX
                getQuestionStatus={getQuestionStatus}
                flaggedQuestions={flaggedQuestions} // <-- FROM REDUX
            />
            )}
        </AnimatePresence>
    </div>
  );
};

export default TestInterfacePage;