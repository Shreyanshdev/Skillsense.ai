'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';

const questionList = [
    'What are the skills do I need for a Data Scientist role?',
    'How do I switch my career from frontend to backend dev?',
    'Can you help me prepare for a technical interview?',
    'What are the trending jobs in AI in 2025?',
];

function EmptyState({ selectedQuestion }: { selectedQuestion: (question: string) => void }) {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Adjusted colors for Gemini-like sky-blue gradient theme
  const headingColorClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const cardBgGradientLight = 'bg-gradient-to-br from-blue-50 to-sky-100'; // Softer light gradient
  const cardBgGradientDark = 'bg-gradient-to-br from-blue-950 to-sky-900'; // Deeper dark gradient
  const cardBorderLight = 'border-blue-200';
  const cardBorderDark = 'border-sky-800';
  const cardTextColorLight = 'text-gray-800';
  const cardTextColorDark = 'text-gray-200';
  const cardHoverShadowLight = 'shadow-lg shadow-blue-200/50';
  const cardHoverShadowDark = 'shadow-lg shadow-sky-700/50';


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl w-full mx-auto text-center p-6" // Added mx-auto for centering
    >
        <h2 className={`font-bold text-xl sm:text-3xl mb-12 ${headingColorClass}`}>
            Ask anything to your <span className={isDark ? 'text-sky-400' : 'text-blue-600'}>AI Career Agent</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap for more breathing room */}
            {questionList.map((question, index) => (
                <motion.div
                    key={index}
                    onClick={() => selectedQuestion(question)}
                    whileHover={{
                      scale: 1.03, // Slightly increased hover scale
                      boxShadow: isDark ? cardHoverShadowDark : cardHoverShadowLight // Dynamic shadow based on theme
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                        p-5 rounded-xl cursor-pointer text-left flex items-center justify-center min-h-[100px] // Added min-h for consistent card size
                        transition-all duration-300 ease-in-out transform
                        ${isDark ? cardBgGradientDark : cardBgGradientLight}
                        ${isDark ? cardBorderDark : cardBorderLight} border
                        ${isDark ? cardTextColorDark : cardTextColorLight}
                        hover:brightness-110 // Subtle brightness on hover
                    `}
                >
                    <p className={`font-medium text-base sm:text-lg text-center`}>{question}</p>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );
}

export default EmptyState;