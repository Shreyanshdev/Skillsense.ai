"use client";
import AppLayout from '@/components/Layout/AppLayout';
import FeatureCardPage from '@/components/Profile/FeatureCard';
import TopContent from '@/components/Profile/TopContent';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import React from 'react';
import { useSelector } from 'react-redux';

interface PageProps {
  isDark: boolean;
}

export default function Page() {
  const theme = useSelector((state:RootState)=> state.theme.theme);
  const isDark = theme === 'dark';

  const sectionBgClass = isDark ? 'bg-gray-900/60' : 'bg-white/60'; // More glassmorphic
  const sectionBorderClass = isDark ? 'border-gray-700/50' : 'border-gray-200/50'; // Subtle border
  const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const sectionShadowClass = 'shadow-2xl backdrop-blur-md'; // Increased shadow and added backdrop-blur

  return (
    <AppLayout>
      
      <motion.div
      initial="hidden"
      whileInView="visible" // Animate when section comes into view
      viewport={{ once: true, amount: 0.2 }} // Only animate once, when 20% visible
      className={`p-6 ${sectionShadowClass} transition-colors duration-300 ${sectionBgClass} border ${sectionBorderClass}`}
    >
        <TopContent />
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Profile Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is where you can manage your profile settings, view your activity, and more.
          </p>
          {/* Additional profile content can be added here */}
          </div>
        <FeatureCardPage />
        
      </motion.div>
      
    </AppLayout>
  );
}
