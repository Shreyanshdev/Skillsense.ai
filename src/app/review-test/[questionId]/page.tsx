// app/review-test/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TestQuestion, ReviewedQuestion, AIAnalysisResult } from '@/types/index'; // Adjust path as needed
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ReviewPageProps {
  // If you want to use dynamic routes like /review-test/QID, you'd get params here:
  // params: { questionId: string };
}

const AnalyzeAndReviewPage: React.FC<ReviewPageProps> = () => {
  const router = useRouter();
  const [reviewedQuestions, setReviewedQuestions] = useState<ReviewedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load questions and user answers from local storage on mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem('generatedTestQuestions');
    const storedUserAnswers = localStorage.getItem('userAnswers');

    if (storedQuestions && storedUserAnswers) {
      const questions: TestQuestion[] = JSON.parse(storedQuestions);
      const userAnswersMap: Record<string, string> = JSON.parse(storedUserAnswers);

      const combinedData: ReviewedQuestion[] = questions.map(q => ({
        ...q,
        userAnswer: userAnswersMap[q.id] || '', // Get user's answer, default to empty string
        analysis: undefined, // Analysis will be fetched per question
      }));
      setReviewedQuestions(combinedData);

      // Optionally, if you're navigating to a specific question ID, find its index
      // const initialQuestionId = params.questionId;
      // if (initialQuestionId) {
      //   const initialIndex = combinedData.findIndex(q => q.id === initialQuestionId);
      //   if (initialIndex !== -1) {
      //     setCurrentQuestionIndex(initialIndex);
      //   }
      // }

    } else {
      // Redirect if no test data found (e.g., user landed directly here)
      router.push('/');
    }
  }, [router]); // Include router in dependency array

  const currentQuestion = useMemo(() => reviewedQuestions[currentQuestionIndex], [reviewedQuestions, currentQuestionIndex]);

  // Function to fetch AI analysis for the current question
  const fetchAnalysis = useCallback(async (questionToAnalyze: ReviewedQuestion) => {
    if (questionToAnalyze.analysis) return; // Don't re-fetch if already analyzed

    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questionToAnalyze.id,
          questionType: questionToAnalyze.type,
          questionText: questionToAnalyze.questionText,
          userAnswer: questionToAnalyze.userAnswer,
          correctAnswer: questionToAnalyze.correctAnswer,
          options: questionToAnalyze.options, // For MCQs
          // For coding questions, include test cases and their results
          testCases: questionToAnalyze.type === 'coding-challenge'
            ? questionToAnalyze.testCases?.map(tc => ({
                ...tc,
                // You'd need to store actual user output and passed status from test execution
                // For simplicity here, we're assuming dummy data or it's part of `userAnswer` processing.
                // In a real app, the execution of coding answers happens before this review step.
                // For now, we'll just send the original test cases to let AI reason about them.
                passed: true, // Dummy: replace with actual execution result
                userOutput: "Dummy output", // Dummy: replace
                errorMessage: null // Dummy: replace
              }))
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newAnalysis: AIAnalysisResult = data.assessment;

      setReviewedQuestions(prev =>
        prev.map(q =>
          q.id === questionToAnalyze.id ? { ...q, analysis: newAnalysis } : q
        )
      );
    } catch (error: any) {
      console.error('Error fetching AI analysis:', error);
      setAnalysisError(error.message || 'Failed to get AI analysis.');
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  // Fetch analysis for the current question whenever it changes
  useEffect(() => {
    if (currentQuestion && !currentQuestion.analysis && !loadingAnalysis) {
      fetchAnalysis(currentQuestion);
    }
  }, [currentQuestion, loadingAnalysis, fetchAnalysis]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < reviewedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions reviewed, redirect to summary
      router.push('/test-summary'); // New route for summary page
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading review data...</div>;
  }

  // Determine icon based on assessment result
  const getAssessmentIcon = (result?: string) => {
    if (!result) return null;
    switch (result) {
      case 'correct':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'partially_correct':
        return <FaInfoCircle className="text-yellow-500 text-3xl" />;
      case 'wrong':
        return <FaTimesCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const currentResult = currentQuestion.analysis?.assessmentResult;
  const icon = getAssessmentIcon(currentResult);
  const iconBgClass = currentResult === 'correct' ? 'bg-green-100' : currentResult === 'partially_correct' ? 'bg-yellow-100' : currentResult === 'wrong' ? 'bg-red-100' : 'bg-gray-100';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Review Your Test</h1>
        <p className="text-lg text-gray-600 mb-4 text-center">
          Question {currentQuestionIndex + 1} of {reviewedQuestions.length}
        </p>

        {/* Question Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Previous
          </button>
          <button
            onClick={handleNextQuestion}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            {currentQuestionIndex === reviewedQuestions.length - 1 ? 'Finish Review & See Summary' : 'Next Question'} <FaArrowRight className="ml-2" />
          </button>
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Question Display */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Question:</h2>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-gray-800 leading-relaxed">
            {currentQuestion.questionText}
          </div>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Options:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {currentQuestion.options.map((option, index) => (
                  <li key={index} className="p-2 my-1 bg-gray-50 rounded-md">
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User's Answer */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            Your Answer
            <span className={`ml-4 p-2 rounded-full ${iconBgClass}`}>
                {loadingAnalysis ? <span className="text-gray-500 animate-spin">⧖</span> : icon}
            </span>
          </h2>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-gray-800 leading-relaxed">
            {currentQuestion.type === 'coding-challenge' ? (
              <SyntaxHighlighter language="javascript" style={dracula} showLineNumbers>
                {currentQuestion.userAnswer || '// No code submitted'}
              </SyntaxHighlighter>
            ) : (
              currentQuestion.userAnswer || 'No answer submitted'
            )}
          </div>
        </div>

        {/* Correct Answer */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Correct Answer:</h2>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-gray-800 leading-relaxed">
            {currentQuestion.type === 'coding-challenge' ? (
              <SyntaxHighlighter language="javascript" style={dracula} showLineNumbers>
                {currentQuestion.correctAnswer || '// No reference solution provided'}
              </SyntaxHighlighter>
            ) : (
              currentQuestion.correctAnswer || 'Not available'
            )}
            {/* For MCQs, also highlight the correct option if options are present */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <p className="mt-2 font-medium">
                ({String.fromCharCode(65 + currentQuestion.options.indexOf(currentQuestion.correctAnswer as string))}) {currentQuestion.correctAnswer}
              </p>
            )}
          </div>
        </div>

        {/* AI Analysis and Explanation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">AI Feedback:</h2>
          {loadingAnalysis ? (
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
              Analyzing your answer...
            </div>
          ) : analysisError ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              Error: {analysisError}
            </div>
          ) : currentQuestion.analysis ? (
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-lg font-semibold mb-2">Assessment: <span className={
                currentQuestion.analysis.assessmentResult === 'correct' ? 'text-green-600' :
                currentQuestion.analysis.assessmentResult === 'partially_correct' ? 'text-yellow-600' :
                'text-red-600'
              }>{currentQuestion.analysis.assessmentResult.replace(/_/g, ' ')}</span></p>
              <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Detailed Explanation:</h3>
              <p className="text-gray-800 leading-relaxed">{currentQuestion.analysis.aiExplanation}</p>
              {currentQuestion.analysis.feedbackPoints && currentQuestion.analysis.feedbackPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700">Key Points:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {currentQuestion.analysis.feedbackPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
              AI analysis not available for this question yet.
            </div>
          )}
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            <FaArrowLeft className="mr-2" /> Previous
          </button>
          <button
            onClick={handleNextQuestion}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            {currentQuestionIndex === reviewedQuestions.length - 1 ? 'Finish Review & See Summary' : 'Next Question'} <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeAndReviewPage;