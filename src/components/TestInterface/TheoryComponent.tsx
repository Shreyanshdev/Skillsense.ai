'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaRegStopCircle, FaRegSave, FaExpand, FaFlag, FaVolumeUp } from 'react-icons/fa'; // Added FaFlag, FaVolumeUp
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'; // Assuming this hook is correctly implemented
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Markdown from 'react-markdown';

interface TheoryComponentProps {
  question: {
    id: string;
    type: 'theoretical';
    questionText: string;
    maxLength?: number;
  };
  userAnswer: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  theme: 'light' | 'dark'; // Added theme prop
  isFlagged: boolean; // Added isFlagged prop
  onToggleFlag: () => void; // Added onToggleFlag prop
}

const TheoryComponent: React.FC<TheoryComponentProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  theme, // Destructure theme
  isFlagged, // Destructure isFlagged
  onToggleFlag, // Destructure onToggleFlag
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Keep editing by default
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const isSpeechSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window; // Check for speech support
  const [localAnswer, setLocalAnswer] = useState(userAnswer);

  // Sync local state with parent
  useEffect(() => {
    setLocalAnswer(userAnswer);
  }, [userAnswer]);

  // Handle speech recognition results - append transcript
  useEffect(() => {
    if (transcript && isListening) { // Process transcript only when listening is active
      setLocalAnswer(prev => {
        // Append transcript, adding a space if there's existing content
        const updated = (prev && prev.length > 0 ? prev + ' ' : '') + transcript;
        // Debounce saving to parent state
        // onAnswerChange(question.id, updated); // Moved debounce logic below
        return updated;
      });
      // Optionally stop listening after a pause in speech
      // This would require logic within the useSpeechRecognition hook
    }
  }, [transcript, isListening]); // Removed question.id and onAnswerChange to avoid re-running effect on every answer change

  // Auto-save with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only save if the local answer is different from the parent answer
      // This prevents unnecessary updates and potential infinite loops
      if (localAnswer !== userAnswer) {
         onAnswerChange(question.id, localAnswer);
         console.log(`Auto-saved answer for ${question.id}`);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeout); // Cleanup timeout on effect re-run or component unmount
  }, [localAnswer, question.id, onAnswerChange, userAnswer]); // Include userAnswer in dependencies

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = question.maxLength ? e.target.value.slice(0, question.maxLength) : e.target.value;
    setLocalAnswer(value);
    // onAnswerChange(question.id, value); // Direct save without debounce - removed
  };

  const toggleSpeech = () => {
    if (isListening) {
      stopListening();
      toast.success('Speech recognition stopped');
    } else {
      if (isSpeechSupported) {
         startListening();
         toast.info('Speak now...');
      } else {
         toast.info('Speech recognition not supported in this browser.');
      }
    }
  };

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
      toast.info('Text-to-speech not supported in this browser.');
    }
  };


  // Simple markdown styles - ensure they are theme-aware
  const markdownStyles = useMemo(() => ({
    h1: `text-2xl font-bold my-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`,
    h2: `text-xl font-bold my-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`,
    p: `my-2 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`,
    a: 'text-blue-500 hover:underline',
    ul: 'list-disc pl-5 my-2',
    ol: 'list-decimal pl-5 my-2',
    li: 'my-1',
    blockquote: `border-l-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} pl-4 my-2 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`,
    code: `${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} rounded px-1 font-mono text-sm`,
    pre: `${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} p-3 rounded my-2 overflow-x-auto`
  }), [theme]); // Recreate styles if theme changes


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30'
          : 'bg-white/90 border border-gray-200'
      }`}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4"> {/* Use items-start and gap */}
          <h3 className={`text-xl font-semibold flex-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}> {/* flex-1 to allow text wrapping */}
            {question.questionText}
          </h3>
          <div className="flex items-center gap-3 flex-shrink-0"> {/* flex-shrink-0 for buttons */}
             {/* Text-to-Speech Button */}
            <motion.button
                onClick={() => handleSpeak(question.questionText)}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Listen to question"
            >
                <FaVolumeUp className="text-lg" />
            </motion.button>

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

            {/* Expand Button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isExpanded ? 'Collapse answer box' : 'Expand answer box'}
            >
              <FaExpand className="text-lg" />
            </motion.button>
          </div>
        </div>

        <div className="relative group">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.textarea
                key="editor"
                initial={{ opacity: 0, height: isExpanded ? 200 : 100 }} // Initial height based on expanded state
                animate={{ opacity: 1, height: isExpanded ? 300 : 150 }} // Adjusted animated height
                exit={{ opacity: 0, height: isExpanded ? 200 : 100 }} // Adjusted exit height
                transition={{ duration: 0.3 }}
                className={`w-full rounded-lg p-4 text-lg focus:ring-2 transition-all resize-none ${ // Added resize-none
                  theme === 'dark'
                    ? 'bg-gray-800/30 border-gray-700/50 focus:border-sky-500 focus:ring-sky-500/30 text-gray-200'
                    : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/30 text-gray-800'
                }`}
                value={localAnswer ? localAnswer : ''}
                onChange={handleTextChange}
                placeholder="Type your answer or use voice input..."
                rows={isExpanded ? 12 : 6} // Adjusted rows based on expanded state
              />
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg max-w-none overflow-y-auto ${ // Added overflow-y-auto
                  theme === 'dark'
                    ? 'bg-gray-800/30 text-gray-200 prose-invert' // Added prose-invert for dark mode markdown
                    : 'bg-gray-50 text-gray-800'
                }`}
                 style={{ height: isExpanded ? 300 : 150 }} // Explicit height for preview
              >
                <Markdown components={{
                  h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                  h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                  p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                  a: ({node, ...props}) => <a className={markdownStyles.a} {...props} />,
                  ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                  ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                  li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                  code: ({node, ...props}) => <code className={markdownStyles.code} {...props} />,
                  pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                }}>
                  {localAnswer || '*No answer provided*'}
                </Markdown>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Count */}
          {question.maxLength && (
              <div className={`absolute bottom-4 right-4 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {localAnswer.length}/{question.maxLength}
              </div>
            )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSpeechSupported && (
              <motion.button
                onClick={toggleSpeech}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isListening
                    ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40'
                    : (theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600')
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? (
                  <>
                    <FaRegStopCircle className="text-xl" />
                    <span className="text-sm">Stop Listening</span>
                  </>
                ) : (
                  <>
                    <FaMicrophone className="text-xl" />
                    <span className="text-sm">Voice Input</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isEditing ? 'Preview answer' : 'Edit answer'}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </motion.button>
          </div>
        </div>

        {isSpeechSupported && transcript && isListening && ( // Only show transcript when listening
          <div className={`p-3 rounded-lg text-sm ${
            theme === 'dark'
              ? 'bg-gray-700/30 text-gray-400'
              : 'bg-gray-100 text-gray-600'
          }`}>
            Listening: "{transcript}"
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TheoryComponent;
