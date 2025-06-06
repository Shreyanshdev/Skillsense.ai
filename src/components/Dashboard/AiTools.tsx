// src/components/Dashboard/AiTools.tsx

'use client';

import React from 'react';
import { AiToolCard } from './AiToolCard';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Ensure your icon paths are correct and these images exist in your public directory
const aiToolsList = [
  {
    name: 'AI Career Q&A Chat',
    desc: 'Chat with an AI agent to get instant answers about career paths, interview tips, and industry trends.',
    icon: '/chatbot.png',
    buttonText: 'Let\'s Chat',
    path: '/ai-chat',
  },
  {
    name: 'AI Resume Analyzer',
    desc: 'Get a comprehensive analysis of your resume, identifying strengths, weaknesses, and optimization opportunities.',
    icon: '/resume.png',
    buttonText: 'Analyze Now',
    path: '/ai-resume-analyzer',
  },
  {
    name: 'Career Roadmap Generator',
    desc: 'Generate a personalized step-by-step roadmap tailored to your career goals and skill gaps.',
    icon: '/roadmap.png',
    buttonText: 'Generate Now',
    path: '/career-roadmap-generator',
  },
  {
    name: 'Cover Letter Generator',
    desc: 'Craft compelling, personalized cover letters in minutes, optimized for specific job applications.',
    icon: '/cover.png',
    buttonText: 'Create Now',
    path: '/cover-letter-generator',
  },
];

export const AiTools = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <div className={`p-6 rounded-2xl shadow-xl transition-colors duration-300
                    ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='font-bold text-2xl mb-2'
      >
        Available AI Tools
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
      >
        Start building and shaping your career with powerful AI assistance.
      </motion.p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {aiToolsList.map((tool, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }} // Staggered animation
          >
            <AiToolCard tool={tool} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};