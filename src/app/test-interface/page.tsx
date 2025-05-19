// src/app/test-interface/page.tsx
// This is the main page component for the technical assessment test interface.
// It fetches the test data, manages test state, handles navigation,
// and renders specific components for different question types.

'use client'; // This is a client component

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // Import useCallback and useRef
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaSpinner, FaTimesCircle, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust path as needed

// Import the new question type components
import MCQComponent from '@/components/TestInterface/MCQComponent';
import TheoryComponent from '@/components/TestInterface/TheoryComponent';
// We will create CodingComponent later
// import CodingComponent from '@/components/TestInterface/CodingComponent';

// Define interfaces for the test data structure (should match your backend output)
interface Question {
    id: string;
    type: 'multiple-choice' | 'coding-challenge' | 'theoretical';
    questionText: string;
    options: string[] | null; // For multiple-choice
    correctAnswer: any; // The correct answer (structure depends on type)
    difficulty: 'easy' | 'medium' | 'hard';
    relatedSkills: string[];
}

interface ExtractedInfo {
    inferredRole: string | null;
    inferredExperienceYears: number | null;
    extractedSkills: string[];
    summary: string;
}

interface TestData {
    extractedInfo: ExtractedInfo;
    testQuestions: Question[];
}

// Define the main Test Interface Page component
const TestInterfacePage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme); // Get theme from Redux

    // --- State Management ---
    const [testData, setTestData] = useState<TestData | null>(null); // Stores the fetched test data
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for fetching data
    const [error, setError] = useState<string | null>(null); // Error state for fetching
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); // Index of the currently displayed question
    // Stores user's answers. Using a Map for easy access by question ID.
    // Map<questionId, answer>
    const [userAnswers, setUserAnswers] = useState<Map<string, any>>(new Map());
    const [timeRemaining, setTimeRemaining] = useState<number>(0); // Timer state in seconds
    const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false); // State to track if test is submitted

    // --- Answer Handling ---
    // This function is passed down to question components
    const handleAnswerChange = useCallback((questionId: string, answer: any) => {
        setUserAnswers(prevAnswers => {
            const newAnswers = new Map(prevAnswers);
            newAnswers.set(questionId, answer);
            console.log(`Answer for ${questionId} updated:`, answer); // Log answer changes
            return newAnswers;
        });
    }, []); // useCallback with empty dependency array means this function is created once

    // --- Test Submission ---
    // Moved handleSubmitTest declaration BEFORE the useEffect that uses it
    const handleSubmitTest = useCallback(async () => {
        // Prevent submitting if already submitted or loading
        if (isTestSubmitted || isLoading) return;

        setIsTestSubmitted(true); // Prevent further interaction
        setIsLoading(true); // Show loading state for submission
        setError(null);

        console.log("Submitting test...");
        console.log("User Answers:", userAnswers);
        console.log("Test Data (for context):", testData); // Include test data for grading context

        // --- Send Answers to Backend for Grading ---
        // You need to implement the /api/grade-test endpoint
        try {
            const response = await fetch('/api/grade-test', { // Replace with your grading endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // It's generally better to send only necessary info for grading
                    // like question IDs and user answers, and let the backend
                    // retrieve correct answers from its database/storage using IDs.
                    // For simplicity here, we'll send question IDs and user answers.
                    userAnswers: Array.from(userAnswers.entries()).reduce((obj: { [key: string]: any }, [key, value]) => {
                        obj[key] = value;
                        return obj;
                    }, {}), // Convert Map to a simple object for JSON
                    // Optionally send test ID if your backend needs it to look up correct answers
                    // testId: testData?.id // Assuming testData has an ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Grading failed.' }));
                throw new Error(errorData.error || 'Grading failed.');
            }

            const results = await response.json();
            console.log("Grading results received:", results);

            // --- Handle Successful Submission & Display Results ---
            // You would typically navigate the user to a results page
            // or update the UI state to show the results component here.
            alert("Test Submitted! Check console for results."); // Placeholder
            // Example navigation to a results page (requires Next.js router)
            // import { useRouter } from 'next/navigation';
            // const router = useRouter();
            // router.push({ pathname: '/results', query: { results: JSON.stringify(results) } }); // Pass results via query param (can be large)
            // OR store results in Redux/Context and navigate

        } catch (err: any) {
            console.error("Error submitting test:", err);
            setError(`Submission failed: ${err.message}`);
            setIsTestSubmitted(false); // Allow resubmission if needed, or handle differently
        } finally {
            setIsLoading(false); // Hide loading state
        }
    }, [isTestSubmitted, isLoading, userAnswers, testData]); // Dependencies for useCallback


    // --- Fetch Test Data ---
    useEffect(() => {
        const fetchTestData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // --- REPLACE WITH ACTUAL FETCH FROM YOUR /api/generate-test ENDPOINT ---
                // This fetch should get the test data generated after the form submission.
                // How you get the test data here depends on your flow after form submission.
                // You might pass a test ID in the URL, use session storage, or fetch
                // based on a user identifier if the test was saved on the backend.
                // For this example, we'll simulate fetching the dummy data again.

                console.log("Fetching test data from /api/generate-test...");
                // Simulate fetching from the backend
                 const response = await fetch('/api/generate-test', {
                     method: 'POST', // Assuming generate-test is a POST endpoint
                     headers: { 'Content-Type': 'application/json' },
                     // You might need to send minimal data here if the backend
                     // relies on session or user ID to retrieve the test.
                     // Or, if you're re-triggering generation for testing,
                     // you'd send the form data again (less efficient).
                     // For now, sending an empty body or minimal data might work
                     // if your backend dummy data doesn't rely on specific input.
                     // If your backend requires the full form data, you'll need
                     // to store it temporarily after the first form submission
                     // and retrieve it here.
                     body: JSON.stringify({}) // Sending empty body for simulation
                 });

                 if (!response.ok) {
                     const errorData = await response.json().catch(() => ({ error: 'Failed to fetch test data.' }));
                     throw new Error(errorData.error || 'Failed to fetch test data.');
                 }

                 const fetchedData: TestData = await response.json();
                 console.log("Test data fetched:", fetchedData);


                setTestData(fetchedData);
                // Initialize timer based on the duration from the fetched test data or form submission
                // Assuming the backend provides duration or you calculate it based on questions
                // For now, let's use a fixed duration for the dummy data
                const durationInMinutes = 30; // Example fixed duration
                setTimeRemaining(durationInMinutes * 60); // Convert minutes to seconds

            } catch (err: any) {
                console.error("Failed to fetch test data:", err);
                setError('Failed to load test data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestData();

    }, []); // Empty dependency array means this effect runs only once on mount


    // --- Timer Logic ---
    useEffect(() => {
        // Stop the timer if time is up, still loading, no test data, or test is submitted
        if (timeRemaining <= 0 || isLoading || !testData || isTestSubmitted) {
            // Ensure timer doesn't go below zero
             if (timeRemaining < 0) setTimeRemaining(0);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prevTime => prevTime - 1);
        }, 1000); // Update every second

        // Cleanup function to clear the interval when the component unmounts or dependencies change
        return () => clearInterval(timer);

    }, [timeRemaining, isLoading, testData, isTestSubmitted, handleSubmitTest]); // Include handleSubmitTest in dependencies


    // --- Navigation Handlers ---
    const handleNextQuestion = () => {
        if (testData && currentQuestionIndex < testData.testQuestions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };


    // --- Render Logic ---
    const currentQuestion = testData?.testQuestions[currentQuestionIndex];
    const totalQuestions = testData?.testQuestions.length || 0;
    const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    // Format time remaining for display (MM:SS)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    // Animation variants for question transition
    const questionVariants = {
        enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 100 : -100 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -100 : 100 }),
    };

    // Determine animation direction based on index change
    const direction = useRef(0);
    useEffect(() => {
        // Update direction when currentQuestionIndex changes
        const prevIndex = currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0;
         direction.current = currentQuestionIndex > prevIndex ? 1 : -1;
    }, [currentQuestionIndex]);


    // --- Styling Helper Classes (Defined here for simplicity, should be centralized) ---
    // These are basic definitions; theme specifics are applied directly in JSX classes above.

    const inputBaseClass = `p-3 rounded-md border focus:outline-none focus:ring-2 ${
        theme === 'dark'
          ? 'bg-gray-700/50 border-gray-600 focus:border-sky-500 focus:ring-sky-500 text-gray-200 placeholder-gray-400'
          : 'bg-gray-50/50 border-gray-300 focus:border-sky-500 focus:ring-sky-500 text-gray-800 placeholder-gray-400'
      }`;

    const primaryButtonClass = `px-7 py-3.5 text-lg sm:text-xl rounded-full font-semibold flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-gray-100'
      } bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-sky-500/40 dark:hover:shadow-blue-500/40 hover:scale-105 active:scale-95 active:ring-2 active:ring-sky-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:active:scale-100 disabled:active:ring-0 cursor-pointer`;

    const secondaryButtonClass = `px-5 py-2.5 text-sm sm:text-base rounded-full font-medium flex items-center ${
        theme === 'dark'
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 active:bg-gray-500'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 active:bg-gray-400'
      } hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 cursor-pointer`;


    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
            <div className="max-w-3xl mx-auto">
                {/* Loading State */}
                {isLoading && !testData && (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <FaSpinner className="animate-spin text-sky-500 text-6xl mb-4" />
                        <p className="text-xl font-semibold">Loading Test...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className={`flex flex-col items-center justify-center min-h-[400px] text-red-500`}>
                        <FaTimesCircle className="text-6xl mb-4" />
                        <p className="text-xl font-semibold mb-2">Error Loading Test</p>
                        <p className="text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Test Interface (Rendered when testData is available and not submitted) */}
                {!isLoading && testData && !isTestSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 sm:p-8 space-y-6`}
                    >
                        {/* Header: Timer and Progress */}
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            {/* Timer */}
                            <div className={`text-lg font-mono ${timeRemaining <= 60 ? 'text-red-500 animate-pulse' : (theme === 'dark' ? 'text-sky-300' : 'text-sky-600')}`}>
                                <FaClock className="inline-block mr-2" /> {formatTime(timeRemaining)}
                            </div>
                            {/* Progress */}
                            <div className="text-sm font-medium">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </div>
                        </div>

                        {/* Progress Bar (Beautiful Tailwind Styling) */}
                        <div className="w-full h-3 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            ></motion.div>
                        </div>

                        {/* Question Area */}
                        <AnimatePresence mode="wait" custom={direction.current}>
                            <motion.div
                                key={currentQuestion?.id || 'loading'} // Use question ID as key for transitions
                                custom={direction.current} // Pass direction.current
                                variants={questionVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="min-h-[250px] flex flex-col" // Added flex-col for layout within question area
                            >
                                {currentQuestion ? (
                                    <div className="space-y-4 flex-grow"> {/* flex-grow to push navigation down */}
                                        {/* Question Text */}
                                        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                            {currentQuestion.questionText}
                                            {/* Placeholder for Speaker Icon */}
                                             <button className={`ml-3 p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`} aria-label="Listen to question">
                                                 {/* Replace with actual speaker icon */} 🔊
                                             </button>
                                        </h3>

                                        {/* --- Render Question Type Components --- */}
                                        {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
                                            <MCQComponent
                                                question={{
                                                    id: currentQuestion?.id || '',
                                                    questionText: currentQuestion?.questionText || '',
                                                    options: currentQuestion?.options || [],
                                                }}
                                                userAnswer={userAnswers.get(currentQuestion.id)}
                                                onAnswerChange={handleAnswerChange}
                                            />
                                        ) : currentQuestion.type === 'theoretical' ? (
                                            <TheoryComponent
                                                question={currentQuestion}
                                                userAnswer={userAnswers.get(currentQuestion.id)}
                                                onAnswerChange={handleAnswerChange}
                                                inputBaseClass={inputBaseClass} // Pass styling prop
                                            />
                                        ) : currentQuestion.type === 'coding-challenge' ? (
                                            // --- Coding Component Placeholder ---
                                            <div className={`p-4 rounded-md space-y-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                                                <p className="italic text-sm mb-2">Question Type: Coding Challenge</p>
                                                {/* Placeholder for Code Editor Component */}
                                                <div className={`w-full h-64 border rounded-md flex items-center justify-center ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-300 bg-gray-200 text-gray-600'}`}>
                                                    Code Editor goes here (integrate external library)
                                                </div>
                                                {/* Placeholder for Run/Submit Code buttons and output */}
                                                <div className="flex justify-end gap-4">
                                                     <button className={`${secondaryButtonClass} disabled:opacity-50`} disabled>Run Code (Placeholder)</button>
                                                     <button className={`${primaryButtonClass} disabled:opacity-50`} disabled>Submit Code (Placeholder)</button>
                                                </div>
                                            </div>
                                            // --- End Coding Component Placeholder ---
                                        ) : (
                                            // Fallback for unknown question types
                                            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                                                 <p className="text-red-500">Unknown question type: {currentQuestion.type}</p>
                                            </div>
                                        )}
                                        {/* --- END Render Question Type Components --- */}

                                    </div>
                                ) : (
                                     // Fallback if currentQuestion is somehow null after loading
                                     <div className="text-center text-gray-500">No question data available.</div>
                                )}
                            </motion.div>
                        </AnimatePresence>


                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6 pt-4 border-t">
                            <motion.button
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`${secondaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                                whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
                                whileTap={{ scale: currentQuestionIndex === 0 ? 1 : 0.95 }}
                            >
                                <FaArrowLeft className="mr-2" /> Previous
                            </motion.button>

                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <motion.button
                                    onClick={handleNextQuestion}
                                    className={`${secondaryButtonClass}`} // Use secondary style for Next
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Next <FaArrowRight className="ml-2" />
                                </motion.button>
                            ) : (
                                // Submit Button on the last question
                                <motion.button
                                    onClick={handleSubmitTest}
                                    disabled={isLoading || isTestSubmitted} // Disable while submitting
                                    className={`${primaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoading ? <><FaSpinner className="animate-spin mr-2" /> Submitting...</> : 'Submit Test'}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Test Submitted State (Placeholder) */}
                {isTestSubmitted && !isLoading && !error && (
                     <div className="flex flex-col items-center justify-center min-h-[400px]">
                         <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                         <p className="text-xl font-semibold">Test Submitted!</p>
                         <p className="text-gray-500 mt-2">Processing results...</p>
                         {/* You would typically navigate to the results page here */}
                     </div>
                )}

            </div>
        </div>
    );
};

export default TestInterfacePage;


// --- Styling Helper Classes (Defined here for simplicity, should be centralized) ---
// These are basic definitions; theme specifics are applied directly in JSX classes above.

const inputBaseClass = "p-3 rounded-md border focus:outline-none focus:ring-2";
const primaryButtonClass = "px-7 py-3.5 text-lg sm:text-xl rounded-full font-semibold flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
const secondaryButtonClass = "px-5 py-2.5 text-sm sm:text-base rounded-full font-medium flex items-center transition-all duration-200";

// Note: The full theme-specific classes for buttons and inputs are applied directly in the JSX above
// using template literals and the 'theme' variable from useSelector.
