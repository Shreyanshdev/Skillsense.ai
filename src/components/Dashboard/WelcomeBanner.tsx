'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const WelcomeBanner = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        w-full relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg
        ${isDark
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white'
          : 'bg-gradient-to-r from-white via-slate-100 to-slate-200 text-gray-800'}
      `}
    >
      {/* Blurred Background Orbs */}
      <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white opacity-10 blur-2xl" />
      <div className="absolute bottom-[-40px] left-[-40px] w-52 h-52 rounded-full bg-white opacity-10 blur-2xl" />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-3xl font-bold tracking-tight mb-3 leading-snug"
        >
          Empower Your Career with <span className="text-red-500">SkillSense</span>
        </motion.h2>

        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm sm:text-base md:text-sm max-w-2xl mx-auto leading-relaxed opacity-90"
        >
          Build your personalized roadmap, track your learning goals, generate AI-powered interviews, cover letters, and
          sharpen your skills daily — all in one dashboard.
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 flex justify-center"
        >
          <button
            className={`
              inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-sm sm:text-base
              transition-all duration-300 shadow-md
              ${isDark
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'}
            `}
          >
            Explore SkillSense
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
