// src/components/Dashboard/AiTools.tsx

'use client';

import React from 'react';
import { AiToolCard } from './AiToolCard';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
    path: '/ai-roadmap-generator',
  },
  {
    name: 'Cover Letter Generator',
    desc: 'Craft compelling, personalized cover letters in minutes, optimized for specific job applications.',
    icon: '/cover.png',
    buttonText: 'Create Now',
    path: '/cover-letter-generator',
  },
];

// Animation variants for staggered grid items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger cards' appearance
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    },
  },
};

export const AiTools = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Theme-based colors for the section container
  const sectionBgClass = isDark ? 'bg-gray-800/60' : 'bg-white/60'; // More glassmorphic
  const sectionBorderClass = isDark ? 'border-gray-700/50' : 'border-gray-200/50'; // Subtle border
  const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const sectionShadowClass = 'shadow-2xl backdrop-blur-md'; // Increased shadow and added backdrop-blur

  return (
    <motion.div
      initial="hidden"
      whileInView="visible" // Animate when section comes into view
      viewport={{ once: true, amount: 0.2 }} // Only animate once, when 20% visible
      className={`p-6 rounded-2xl ${sectionShadowClass} transition-colors duration-300 ${sectionBgClass} border ${sectionBorderClass}`}
    >
      <motion.h2
        variants={itemVariants} // Use itemVariants for titles
        className={`font-bold text-2xl mb-2 ${textColorPrimary}`}
      >
        Available AI Tools
      </motion.h2>
      <motion.p
        variants={itemVariants} // Use itemVariants for paragraphs
        className={`text-lg mb-6 ${textColorSecondary}`}
      >
        Start building and shaping your career with powerful AI assistance.
      </motion.p>

      <motion.div
        variants={containerVariants} // Apply container variants for staggered children
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      >
        {aiToolsList.map((tool, index) => (
          <motion.div
            key={index}
            variants={itemVariants} // Each card uses itemVariants for its animation
          >
            <AiToolCard tool={tool} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};