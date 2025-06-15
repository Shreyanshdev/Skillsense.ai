'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaClock, FaPlus, FaChevronDown, FaCircle, FaCheckCircle, FaQuestionCircle, FaFlag, FaTimesCircle, FaAngleRight, FaAngleDown } from 'react-icons/fa'; // Added FaTimesCircle, FaAngleRight, FaAngleDown
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Define the Question interface based on your test data structure
interface Question {
    id: string;
    type: 'multiple-choice' | 'theoretical' | 'coding-challenge' | 'general-aptitude'; // Add other types if necessary
    questionText: string;
    // Add other question properties as needed
}

// Define the Round interface
interface Round {
    id: string;
    name: string; // e.g., "Round 1: Basic Concepts"
    type: 'multiple-choice' | 'theoretical' | 'coding-challenge' | 'general-aptitude'; // Type of questions in this round
    questions: Question[];
}

// Define the QuestionStatus type
type QuestionStatus = 'attempted' | 'non-attempted' | 'skipped' | 'flagged';


interface NavigationSidebarProps {
    isOpen: boolean;
    rounds: Round[]; // Now an array of rounds
    currentRoundIndex: number; // Current active round index
    currentQuestionIndex: number; // Current active question index within the round
    onQuestionSelect: (roundIndex: number, questionIndex: number) => void; // Updated signature
    onClose: () => void;
    theme: 'light' | 'dark'; // Added theme prop
    userAnswers: { [key: string]: any }; // Added userAnswers prop
    flaggedQuestions: string[]; // Added flaggedQuestions prop
    onExitWithoutEvaluation: () => void; // Added exit handler prop
    getQuestionStatus: (questionId: string) => QuestionStatus; // Added status getter prop
    timeRemaining: number; // Added timeRemaining prop
    formatTime: (seconds: number) => string; // Added formatTime prop
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
    isOpen,
    rounds, // Destructure rounds
    currentRoundIndex,
    currentQuestionIndex,
    onQuestionSelect, // Updated signature
    onClose,
    theme, // Destructure theme
    userAnswers, // Destructure userAnswers
    flaggedQuestions, // Destructure flaggedQuestions
    onExitWithoutEvaluation, // Destructure exit handler
    getQuestionStatus, // Destructure status getter
    timeRemaining, // Destructure timeRemaining
    formatTime, // Destructure formatTime
}) => {

    const [isGenerateDropdownOpen, setIsGenerateDropdownOpen] = useState(false);
    // State to manage which rounds are expanded in the sidebar
    const [expandedRounds, setExpandedRounds] = useState<string[]>([]);

    // Expand the current round by default when component mounts or current question changes
    useEffect(() => {
        if (rounds[currentRoundIndex] && !expandedRounds.includes(rounds[currentRoundIndex].id)) {
            setExpandedRounds(prev => [...prev, rounds[currentRoundIndex].id]);
        }
    }, [currentRoundIndex, rounds, expandedRounds]);


    const toggleGenerateDropdown = () => {
        setIsGenerateDropdownOpen(prev => !prev);
    };

    const handleGenerateOptionClick = (type: 'mcq' | 'theory' | 'coding' | 'mixed') => {
        toast.success(`Simulating generating a new ${type} question...`);
        setIsGenerateDropdownOpen(false);
        // In a real app, you would call a backend API here to generate the question
        // and then update the testState with the new question.
    };

    const toggleRoundExpansion = (roundId: string) => {
        setExpandedRounds(prev =>
            prev.includes(roundId) ? prev.filter(id => id !== roundId) : [...prev, roundId]
        );
    };


    // Determine styling for question buttons based on status and theme
    const getQuestionButtonClasses = (roundIdx: number, qIdx: number, status: QuestionStatus) => {
        const isCurrent = roundIdx === currentRoundIndex && qIdx === currentQuestionIndex;
        const baseClasses = `w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3 text-sm`; // Adjusted padding for nested questions

        let statusClasses = '';
        if (status === 'flagged') {
            statusClasses = theme === 'dark' ? 'bg-yellow-800/30 text-yellow-400 hover:bg-yellow-800/50' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
        } else if (status === 'attempted') {
             statusClasses = theme === 'dark' ? 'bg-green-800/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200';
        } else if (status === 'skipped') {
             statusClasses = theme === 'dark' ? 'bg-red-800/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200';
        } else { // non-attempted
             statusClasses = theme === 'dark' ? 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }

        const currentClasses = isCurrent
            ? (theme === 'dark' ? 'border border-sky-500' : 'border border-blue-500') // Add border for current
            : 'border border-transparent'; // Transparent border when not current

        return `${baseClasses} ${statusClasses} ${currentClasses}`;
    };

    // Get icon for question status
    const getStatusIcon = (status: QuestionStatus) => {
        switch (status) {
            case 'flagged': return <FaFlag className="text-sm" />;
            case 'attempted': return <FaCheckCircle className="text-sm" />;
            case 'skipped': return <FaTimesCircle className="text-sm" />; // Using FaTimesCircle for skipped
            case 'non-attempted': return <FaCircle className="text-sm" />; // Using FaCircle for non-attempted
            default: return <FaQuestionCircle className="text-sm" />; // Fallback
        }
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Changed positioning from right-0 to left-0
                    initial={{ x: '-100%' }} // Animate from left
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }} // Exit to left
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`fixed inset-y-0 left-0 w-80 shadow-xl p-6 z-50 flex flex-col ${ // Positioned left-0
                        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
                    }`}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Navigation</h3> {/* Changed title */}
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            aria-label="Close sidebar"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Clock Display */}
                    <div className={`flex items-center gap-2 mb-6 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                        <FaClock className="text-lg" />
                        <span className="font-medium text-lg">{formatTime(timeRemaining === -1 ? 0 : timeRemaining)}</span>
                    </div>

                    {/* Question Navigation List (now with rounds) */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-6"> {/* flex-1 to take available space, increased space-y */}
                        {rounds.map((round, roundIdx) => (
                            <div key={round.id} className="space-y-2">
                                <button
                                    onClick={() => toggleRoundExpansion(round.id)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between font-semibold transition-colors ${
                                        theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {expandedRounds.includes(round.id) ? <FaAngleDown /> : <FaAngleRight />}
                                        {round.name}
                                    </span>
                                    <span className="text-xs opacity-70">({round.questions.length} Qs)</span>
                                </button>
                                <AnimatePresence>
                                    {expandedRounds.includes(round.id) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-4 space-y-1 overflow-hidden" // Indent questions
                                        >
                                            {round.questions.map((q, qIdx) => {
                                                const status = getQuestionStatus(q.id);
                                                return (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => onQuestionSelect(roundIdx, qIdx)}
                                                        className={getQuestionButtonClasses(roundIdx, qIdx, status)}
                                                    >
                                                        {getStatusIcon(status)}
                                                        <span>Question {qIdx + 1}</span>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Generate More Questions */}
                    <div className="relative mb-4">
                        <button
                            onClick={toggleGenerateDropdown}
                            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${
                                theme === 'dark' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white shadow-md`}
                            aria-haspopup="true"
                            aria-expanded={isGenerateDropdownOpen}
                        >
                            <FaPlus />
                            Generate More Questions
                            <FaChevronDown className={`ml-2 transition-transform ${isGenerateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isGenerateDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute bottom-full mb-2 left-0 w-full rounded-md shadow-lg py-1 ${
                                        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    <button
                                        onClick={() => handleGenerateOptionClick('mcq')}
                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        MCQ
                                    </button>
                                    <button
                                        onClick={() => handleGenerateOptionClick('theory')}
                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Theory
                                    </button>
                                    <button
                                        onClick={() => handleGenerateOptionClick('coding')}
                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Coding
                                    </button>
                                     <button
                                        onClick={() => handleGenerateOptionClick('mixed')}
                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Mixed
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    {/* Exit Button */}
                    <motion.button
                        onClick={onExitWithoutEvaluation}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${
                            theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                        } text-white shadow-md`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="Exit without evaluation"
                    >
                        Exit without Evaluation
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NavigationSidebar;
