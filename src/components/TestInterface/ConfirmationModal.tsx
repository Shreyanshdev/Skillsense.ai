import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaFlag, FaCircle } from 'react-icons/fa'; // Added more icons
import Markdown from 'react-markdown'; // For rendering question text
import { Question, Round, TestData, QuestionType } from '@/types/index'; 

// Define QuestionStatus type for clarity
type QuestionStatus = 'attempted' | 'non-attempted' | 'skipped' | 'flagged';


interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    theme: 'light' | 'dark'; // Accept theme prop
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    userAnswers: { [key: string]: any }; // User's current answers
    testData: TestData | null; // Full test data to get question details
    getQuestionStatus: (questionId: string) => QuestionStatus; // Function to get question status
    flaggedQuestions: string[]; // List of flagged questions


}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    theme,
    title,
    message,
    confirmText,
    cancelText,
    userAnswers,
    testData,
    getQuestionStatus,
    flaggedQuestions,
}) => {
    // Animation variants for the modal backdrop
    const backdropVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

    // Animation variants for the modal itself
    const modalVariants:Variants = {
        hidden: { opacity: 0, y: -50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: 50, scale: 0.9 },
    };

    // Styling based on theme
    const modalBgClass = theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900';
    const buttonBaseClass = `px-6 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`;
    const confirmButtonClass = `${buttonBaseClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`;
    const cancelButtonClass = `${buttonBaseClass} bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-400 ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-gray-500 focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`;

    const handleCancelSubmit = () => {
        onClose();
    };

    const handleConfirmSubmit = () => {
        onConfirm();
    };

    // Prepare data for review
    const allQuestions = testData?.rounds.flatMap(round => round.questions) || [];

    const getStatusIcon = (status: QuestionStatus) => {
        switch (status) {
            case 'flagged': return <FaFlag className="text-yellow-500" />;
            case 'attempted': return <FaCheckCircle className="text-green-500" />;
            case 'skipped': return <FaTimesCircle className="text-red-500" />;
            case 'non-attempted': return <FaCircle className="text-gray-400" />;
            default: return <FaQuestionCircle className="text-gray-500" />;
        }
    };

    const getStatusText = (status: QuestionStatus) => {
        switch (status) {
            case 'flagged': return 'Flagged';
            case 'attempted': return 'Attempted';
            case 'skipped': return 'Skipped';
            case 'non-attempted': return 'Not Attempted';
            default: return 'Unknown';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto" // Added overflow-y-auto
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className={`rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${modalBgClass}`} // Increased max-w, added max-h and overflow
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <FaQuestionCircle size={40} className="text-sky-500" />
                            <h3 className="text-2xl font-bold text-center">{title}</h3>
                            <p className={`text-base text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {message}
                            </p>
                        </div>

                        {/* Review Section */}
                        <div className={`space-y-4 mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                            <h4 className="text-xl font-semibold mb-3 text-center">Your Answers Summary</h4>
                            {allQuestions.length === 0 ? (
                                <p className="text-center text-gray-500">No questions to review.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allQuestions.map((q, index) => {
                                        const status = getQuestionStatus(q.id);
                                        const userAnswer = userAnswers[q.id];
                                        const isAttempted = status === 'attempted' || status === 'flagged'; // If flagged, it's considered looked at

                                        return (
                                            <div key={q.id} className={`p-3 rounded-md border ${
                                                theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">Question {index + 1}</span>
                                                    <div className="flex items-center gap-1 text-xs">
                                                        {getStatusIcon(status)}
                                                        <span className={`${
                                                            status === 'attempted' ? 'text-green-500' :
                                                            status === 'skipped' ? 'text-red-500' :
                                                            status === 'flagged' ? 'text-yellow-500' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {getStatusText(status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className={`text-sm mb-2 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <Markdown>{q.questionText}</Markdown>
                                                </p>
                                                <div className={`text-xs p-2 rounded ${
                                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                } whitespace-pre-wrap overflow-auto max-h-20`}> {/* Added max-h-20 */}
                                                    {isAttempted && userAnswer !== null && userAnswer !== undefined && userAnswer !== 'SKIPPED'
                                                        ? (typeof userAnswer === 'string' && userAnswer.trim() === '' ? '*Empty Answer*' : userAnswer)
                                                        : '*No Answer / Skipped*'
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center space-x-6">
                            <button onClick={handleCancelSubmit} className={cancelButtonClass}>
                                {cancelText}
                            </button>
                            <button onClick={handleConfirmSubmit} className={confirmButtonClass}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
