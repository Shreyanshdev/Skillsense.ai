// src/app/review-test/[reviewSessionId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ReviewSession, AIAnalysisResult } from '@/types/index'; // Import ReviewSession type
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaRegCircle, FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // For generating/retrieving userId

const ReviewTestPage: React.FC = () => {
    const { reviewSessionId } = useParams();
    const theme = useSelector((state: RootState) => state.theme.theme);

    const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingFeedback, setGeneratingFeedback] = useState(false);
    const [userId, setUserId] = useState<string | null>(null); // State to hold the user ID

    // Simple user ID management (for beginner context without full auth)
    useEffect(() => {
        let currentUserId = localStorage.getItem('appUserId');
        if (!currentUserId) {
            currentUserId = uuidv4();
            localStorage.setItem('appUserId', currentUserId);
        }
        setUserId(currentUserId);
    }, []);

    const fetchReviewSession = useCallback(async () => {
        if (!userId || !reviewSessionId) {
            // Wait for userId to be set
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/get-review-session?id=${reviewSessionId}&userId=${userId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch review session.' }));
                throw new Error(errorData.error || 'Failed to fetch review session.');
            }
            const data: ReviewSession = await response.json();

            // Mongoose returns Date objects directly, no need for .toDate()
            setReviewSession(data);
        } catch (err: any) {
            console.error("Error fetching review session:", err);
            setError(`Failed to load review: ${err.message}`);
            toast.error(`Failed to load review: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [reviewSessionId, userId]);

    useEffect(() => {
        // Only fetch if userId is available
        if (userId) {
            fetchReviewSession();
        }
    }, [fetchReviewSession, userId]);


    const handleGenerateFeedback = useCallback(async () => {
        if (!reviewSessionId || !reviewSession || generatingFeedback || !userId) return;

        setGeneratingFeedback(true);
        toast.info("Generating personalized feedback...");

        try {
            const response = await fetch('/api/generate-final-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewSessionId: String(reviewSessionId), userId: userId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to generate feedback.' }));
                throw new Error(errorData.error || 'Failed to generate feedback.');
            }

            const { finalFeedback } = await response.json();

            // Update the local state with the generated feedback
            setReviewSession(prev => {
                if (prev) {
                    return { ...prev, finalFeedback: finalFeedback, feedbackGeneratedTime: new Date() };
                }
                return prev;
            });
            toast.success("Feedback generated successfully!");

        } catch (err: any) {
            console.error("Error generating feedback:", err);
            toast.error(err.message || "Error generating feedback.");
        } finally {
            setGeneratingFeedback(false);
        }
    }, [reviewSessionId, reviewSession, generatingFeedback, userId]);


    if (loading || !userId) { // Also wait for userId to be set
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <span className="ml-4 text-lg">Loading review session...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-600'}`}>
                <span className="text-lg">{error}</span>
            </div>
        );
    }

    if (!reviewSession) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
                <span className="text-lg">No review session found.</span>
            </div>
        );
    }

    const renderAssessmentIcon = (assessmentResult: AIAnalysisResult['assessmentResult'] | undefined) => {
        switch (assessmentResult) {
            case 'correct': return <FaCheckCircle className="text-green-500" />;
            case 'partially_correct': return <FaRegCircle className="text-yellow-500" />;
            case 'wrong': return <FaTimesCircle className="text-red-500" />;
            default: return <FaQuestionCircle className="text-gray-400" />;
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} p-8`}>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Test Review</h1>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Submitted on: {reviewSession.submissionTime?.toLocaleString() || 'N/A'}
                </p>

                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Question Breakdown</h2>
                {reviewSession.reviewedQuestions.map((q, index) => (
                    <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`mb-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} shadow-md`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-bold">Question {index + 1}: {q.questionText}</span>
                            {renderAssessmentIcon(q.analysis?.assessmentResult)}
                            {reviewSession.flaggedQuestions.includes(q.id) && (
                                <span className="ml-auto px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                                    Flagged
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">Your Answer:</h3>
                            <div className="p-3 border rounded-md whitespace-pre-wrap">
                                {q.userAnswer === '' ? (
                                    <em className="text-gray-500 dark:text-gray-400">Not Attempted / Left Blank</em>
                                ) : q.userAnswer === 'SKIPPED' ? (
                                    <em className="text-gray-500 dark:text-gray-400">Skipped</em>
                                ) : (
                                    <Markdown>{q.userAnswer}</Markdown>
                                )}
                            </div>
                        </div>

                        {q.analysis && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-2">AI Analysis:</h3>
                                <div className="p-3 border rounded-md">
                                    <p className={`font-medium mb-2 ${
                                        q.analysis.assessmentResult === 'correct' ? 'text-green-500' :
                                        q.analysis.assessmentResult === 'partially_correct' ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                        Assessment: {q.analysis.assessmentResult.replace(/_/g, ' ')}
                                    </p>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <Markdown>
                                            {q.analysis.aiExplanation}
                                        </Markdown>
                                    </div>
                                    {q.analysis.feedbackPoints && q.analysis.feedbackPoints.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-base mb-1">Feedback Points:</h4>
                                            <ul className="list-disc list-inside text-sm">
                                                {q.analysis.feedbackPoints.map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <hr className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />
                    </motion.div>
                ))}

                <div className={`mt-10 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} shadow-md`}>
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Overall Feedback</h2>
                    {reviewSession.finalFeedback ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose dark:prose-invert max-w-none"
                        >
                            <Markdown>{reviewSession.finalFeedback}</Markdown>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Feedback generated on: {reviewSession.feedbackGeneratedTime?.toLocaleString() || 'N/A'}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="text-center">
                            <p className="mb-4">Generate a comprehensive feedback report based on your performance and profile.</p>
                            <button
                                onClick={handleGenerateFeedback}
                                disabled={generatingFeedback}
                                className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition-colors ${
                                    generatingFeedback ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {generatingFeedback ? (
                                    <>
                                        <FaSpinner className="animate-spin inline-block mr-2" /> Generating...
                                    </>
                                ) : (
                                    'Generate Final Feedback'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewTestPage;