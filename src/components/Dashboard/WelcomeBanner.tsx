// src/components/Dashboard/WelcomeBanner.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const WelcomeBanner = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        w-full // Ensures it uses full width of its parent
        p-6 sm:p-8 md:p-10 // Adjusted responsive padding for a more minimalistic feel
        rounded-3xl overflow-hidden relative shadow-lg
        ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-800 to-indigo-900'
            : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
        }
      `}
    >
      {/* Background elements (keep for dynamic feel, they are subtle) */}
      <div className={`absolute inset-0 opacity-20 ${theme === 'dark' ? 'bg-dots-dark' : 'bg-dots-light'}`} />
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white opacity-10 blur-xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white opacity-10 blur-xl" />

      <div className="relative z-10">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-bold text-2xl sm:text-3xl text-white mb-2" // Slightly reduced font size for minimalism
        >
          AI-Driven Career Guide
        </motion.h2>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white text-md sm:text-lg mb-6 max-w-3xl" // Adjusted font size slightly
        >
          Make smarter career decisions here – get tailored advice, real-time market insights, and personalized roadmaps.
        </motion.p>
        <motion.button
          onClick={() => { /* Add logic for button click, e.g., router.push('/onboarding') */ }}
          whileHover={{ scale: 1.05, boxShadow: theme === 'dark' ? '0 0 20px rgba(0, 179, 255, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-x-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg
            transition-all duration-300 ease-out cursor-pointer
            ${theme === 'dark'
              ? 'bg-gray-100 text-gray-900 hover:bg-white' // Light button, dark text for dark theme banner
              : 'bg-white text-violet-700 hover:bg-gray-100' // White button, violet text for light theme banner
            }
          `}
        >
          Let's Get Started <FiArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};