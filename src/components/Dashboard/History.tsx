// src/components/Dashboard/History.tsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi'; // For the button icon
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const History = () => {
  const [userHistory] = useState<any[]>([]); // Keep it as an empty array for now
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
        Previous History
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
      >
        What you've previously worked on can be found here.
      </motion.p>

      {userHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='flex flex-col items-center justify-center p-8 rounded-lg'
        >
          <Image
            src={'/idea.png'}
            alt={'idea bulb'}
            width={70}
            height={70}
            className='mx-auto my-5 opacity-80'
          />
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            You don't have any history yet!
          </h3>
          <p className={`text-base text-center mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Start exploring our AI tools to generate your first career insights.
          </p>
          <motion.button
            onClick={() => { /* Add navigation or action to start using tools */ }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-x-2 rounded-full
                       bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white
                       shadow-lg hover:shadow-sky-500/30 transition-all duration-300 ease-out cursor-pointer"
          >
            Start Working on Something <FiArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
      {/* TODO: Add actual history list rendering here when userHistory is not empty */}
    </div>
  );
};