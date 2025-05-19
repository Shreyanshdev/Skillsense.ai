// app/components/Footer.tsx
'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Update the path if needed
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }} // Slight delay for content to load
      className={`py-8 border-t ${
        theme === 'dark'
          ? 'bg-gray-900/80 border-gray-800'
          : 'bg-white/80 border-gray-200'
      } backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          &copy; {new Date().getFullYear()} SkillSense.AI. All rights reserved.
        </p>
        <motion.div
          className="flex items-center justify-center mt-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Crafted with
          </span>
          <FaHeart className="mx-1.5 text-sky-500 animate-pulse" />
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            by Your Team
          </span>
        </motion.div>
      </div>
    </motion.footer>
  );
}