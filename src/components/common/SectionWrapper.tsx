// src/components/common/SectionWrapper.tsx
// Reusable component to wrap form sections with consistent styling and animation

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux'; // Needed to access theme here
import { RootState } from '@/redux/store'; // Update path if needed

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean; // Prop to visually disable the section
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, icon, children, disabled = false }) => {
  const theme = useSelector((state: RootState) => state.theme.theme); // Access theme directly from Redux

  return (
    <motion.div
        // Enhanced initial/animate for a more noticeable entrance animation
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }} // Increased duration and delay slightly
        className={`space-y-4 ${disabled ? 'opacity-40 pointer-events-none' : ''}`} // Applied disabled styles
    >
        <h3 className={`text-xl sm:text-2xl font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            {icon} <span className="ml-2">{title}</span>
        </h3>
        {children}
    </motion.div>
  );
};

export default SectionWrapper;
