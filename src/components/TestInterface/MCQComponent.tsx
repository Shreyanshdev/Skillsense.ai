'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FaMicrophone, FaRegCircle, FaRegCheckCircle, FaFlag, FaVolumeUp } from 'react-icons/fa'; // Added FaFlag, FaVolumeUp
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'; // Assuming this hook is correctly implemented
import { toast } from 'react-hot-toast';

interface MCQComponentProps {
  question: {
    id: string;
    questionText: string;
    options: string[];
  };
  userAnswer: string | null;
  onAnswerChange: (questionId: string, answer: string) => void;
  theme: 'light' | 'dark';
  isFlagged: boolean; 
  onToggleFlag: () => void;
}

const MCQComponent: React.FC<MCQComponentProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  theme, 
  isFlagged, 
  onToggleFlag, 
}) => {
  // Assuming useSpeechRecognition hook is available and functional
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [autoScroll, setAutoScroll] = useState(true); // State seems unused, can be removed if not needed elsewhere

  // Handle speech input - refined to be more specific
  useEffect(() => {
    if (transcript && isListening) { // Process transcript only when listening is active
      const matchedOption = question.options.find(option =>
        // Basic matching: check if transcript contains a significant part of an option (case-insensitive)
        // A more advanced implementation might use fuzzy matching or keyword extraction
        transcript.toLowerCase().includes(option.toLowerCase()) ||
        option.toLowerCase().includes(transcript.toLowerCase())
      );

      if (matchedOption) {
        onAnswerChange(question.id, matchedOption);
        toast.success(`Selected: ${matchedOption} via voice`);
        stopListening(); // Stop listening after a successful match
      } else if (transcript.trim() !== '') { // Provide feedback even if no match
        // No explicit toast.error here to avoid repeated notifications if no match is found
        // Consider adding a debounced or less frequent error toast if desired
      }
    }
     // Clear transcript after processing or if listening stops
     // This depends on how your useSpeechRecognition hook manages transcript state
     // If the hook clears transcript on stop, this might not be necessary here.
  }, [transcript, isListening, question, onAnswerChange, stopListening]);


  // Speech recognition availability check
  const isSpeechSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

   // Text-to-Speech functionality (using Web Speech API)
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech before starting a new one
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language
      // Optional: Add event listeners for start/end
      // utterance.onstart = () => console.log('Speaking started');
      // utterance.onend = () => console.log('Speaking ended');
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser.');
    }
  };


  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Refined option animation variants
  const optionVariants = {
    rest: { scale: 1, y: 0, borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0' }, // Default border color
    hover: { scale: 1.02, y: -2, borderColor: theme === 'dark' ? '#6366f1' : '#3b82f6' }, // Hover border color
    selected: { scale: 1.03, y: -1, borderColor: theme === 'dark' ? '#0ea5e9' : '#2563eb', backgroundColor: theme === 'dark' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(59, 130, 246, 0.1)' } // Selected background and border
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className={`flex items-center justify-between p-4 rounded-xl ${
        theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700/50'
          : 'bg-white/90 border border-gray-200'
      }`}>
        <div className="flex items-start gap-4 flex-1"> {/* Use flex-1 to allow question text to take space */}
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {question.questionText}
            </h3>
             {/* Text-to-Speech Button */}
            <motion.button
                onClick={() => handleSpeak(question.questionText)}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${ // flex-shrink-0 to prevent shrinking
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Listen to question"
            >
                <FaVolumeUp className="text-lg" />
            </motion.button>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0"> {/* Flex-shrink-0 for buttons */}
             {/* Flag Button */}
            <motion.button
                onClick={onToggleFlag}
                className={`p-2 rounded-full transition-colors ${
                    isFlagged
                        ? 'text-yellow-400 hover:bg-yellow-500/20' // Style for flagged
                        : (theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700' // Style for not flagged (dark)
                            : 'text-gray-600 hover:bg-gray-100') // Style for not flagged (light)
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isFlagged ? 'Unflag question' : 'Flag question'}
            >
                <FaFlag className="text-lg" />
            </motion.button>

            {isSpeechSupported && (
              <motion.button
                onClick={() => isListening ? stopListening() : startListening()}
                className={`p-3 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'text-sky-400 hover:bg-gray-700'
                    : 'text-blue-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Voice input"
              >
                <FaMicrophone className={`text-xl ${isListening ? 'animate-pulse' : ''}`} />
              </motion.button>
            )}
        </div>
      </div>

      <div className={`space-y-3 p-6 rounded-xl ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30'
          : 'bg-white/90 border border-gray-200'
      }`}>
        <AnimatePresence>
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full text-left p-4 rounded-lg flex items-center border transition-all ${
                // Dynamic classes based on selection and theme
                userAnswer === option
                  ? (theme === 'dark'
                    ? 'bg-sky-600/30 border-sky-500/50'
                    : 'bg-blue-50 border-blue-200')
                  : (theme === 'dark'
                    ? 'bg-transparent hover:bg-gray-700/30 border-gray-600/30 hover:border-gray-500/30'
                    : 'bg-transparent hover:bg-gray-50 border-gray-200 hover:border-gray-300')
              }`}
              variants={optionVariants}
              initial="rest"
              animate={userAnswer === option ? "selected" : "rest"} // Animate to "selected" state
              whileHover="hover"
              whileTap="selected"
              onClick={() => onAnswerChange(question.id, option)}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`mr-4 transition-colors ${
                userAnswer === option
                  ? (theme === 'dark' ? 'text-sky-400' : 'text-blue-600')
                  : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
              }`}>
                {userAnswer === option ? (
                  <FaRegCheckCircle className="text-xl" />
                ) : (
                  <FaRegCircle className="text-xl" />
                )}
              </div>
              <span className={`text-lg ${
                theme === 'dark'
                  ? userAnswer === option ? 'text-gray-50' : 'text-gray-300'
                  : userAnswer === option ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {option}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {isSpeechSupported && transcript && isListening && ( // Only show transcript when listening
          <div className={`mt-4 p-3 rounded-md text-sm ${
            theme === 'dark'
              ? 'bg-gray-700/30 text-gray-400'
              : 'bg-gray-100 text-gray-600'
          }`}>
            Listening: &quot;{transcript}&quot;
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MCQComponent;