'use client';
import React from 'react';
import { WelcomeBanner } from '@/components/Dashboard/WelcomeBanner';
import AppLayout from '@/components/Layout/AppLayout';
import { AiTools } from '@/components/Dashboard/AiTools';
import { History } from '@/components/Dashboard/History';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';

function AiTool() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Theme-based background colors for the page
  const pageBgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBgClass}`}>
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8 space-y-8 max-w-7xl" // Added max-w-7xl for consistent width
        >
          {/* WelcomeBanner (assuming it adapts to theme internally or is generic) */}
          <WelcomeBanner />
          <AiTools />
          <History />
        </motion.div>
      </AppLayout>
    </div>
  );
}

export default AiTool;