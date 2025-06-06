// src/components/AIChat/emptyState.tsx
'use client'; // Ensure this is present if using hooks

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

  const headingColorClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const cardBgClass = theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200';
  const cardTextColorClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl w-full text-center p-6 rounded-lg" // Added padding and rounded corners to the overall div
    >
        <h2 className={`font-bold text-xl sm:text-2xl mb-8 ${headingColorClass}`}>
            Ask anything to your AI Career Agent
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Responsive grid for questions */}
            {questionList.map((question, index) => (
                <motion.div
                    key={index}
                    onClick={() => selectedQuestion(question)}
                    whileHover={{ scale: 1.02, boxShadow: theme === 'dark' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : '0 4px 15px rgba(0,0,0,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                        p-4 rounded-xl cursor-pointer text-left
                        transition-all duration-200 ease-in-out
                        ${cardBgClass}
                    `}
                >
                    <p className={`${cardTextColorClass} font-medium`}>{question}</p>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );
}

export default EmptyState;