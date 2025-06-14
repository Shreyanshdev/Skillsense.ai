// src/components/shared/FuturisticCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface FuturisticCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string; // For additional styling
  delay?: number; // For staggered entry animation
  whileHoverScale?: number; // Optional scale on hover
}

const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  title,
  className,
  delay = 0,
  whileHoverScale = 1.02,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const cardClasses = `
    relative p-6 rounded-2xl overflow-hidden
    border
    ${theme === 'dark'
      ? 'bg-gray-800/30 border-gray-700'
      : 'bg-white/30 border-gray-200'}
    backdrop-filter backdrop-blur-lg
    shadow-lg
    transition-all duration-300 ease-in-out
    ${className || ''}
  `;

  // Enhanced hover effect for a more futuristic feel
  const hoverVariants = {
    initial: {
      scale: 1,
      y: 0,
      boxShadow: theme === 'dark'
        ? '0 10px 20px rgba(0,0,0,0.3)'
        : '0 10px 20px rgba(0,0,0,0.1)',
      rotateX: 0,
      rotateY: 0,
    },
    hover: {
      scale: whileHoverScale,
      y: -5,
      // More pronounced and colored shadow for a "glowing" effect
      boxShadow: theme === 'dark'
        ? '0 15px 30px rgba(0,0,0,0.4), 0 0 25px rgba(135,206,235,0.6)' // Sky blue glow
        : '0 15px 30px rgba(0,0,0,0.15), 0 0 20px rgba(100,149,237,0.4)', // Cornflower blue glow
      rotateX: 2, // Subtle tilt
      rotateY: -2, // Subtle tilt
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    tap: {
      scale: 0.98,
      y: 0,
      boxShadow: theme === 'dark' ? '0 5px 10px rgba(0,0,0,0.2)' : '0 5px 10px rgba(0,0,0,0.08)',
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, type: 'spring', stiffness: 100, damping: 15 }}
      variants={hoverVariants} // Use variants for cleaner hover state management
      whileHover="hover"
      whileTap="tap"
    >
      {/* Optional subtle background pattern within the card for extra flair */}
      {/* Changed to a more subtle, animated pulse for a "raindrop" or "energy" feel */}
      <motion.div
        className={`absolute inset-0 z-0 opacity-5`}
        animate={{
          background: [
            theme === 'dark' ? 'radial-gradient(circle at 10% 10%, rgba(30,144,255,0.1), transparent 70%)' : 'radial-gradient(circle at 10% 10%, rgba(173,216,230,0.2), transparent 70%)',
            theme === 'dark' ? 'radial-gradient(circle at 90% 90%, rgba(30,144,255,0.1), transparent 70%)' : 'radial-gradient(circle at 90% 90%, rgba(173,216,230,0.2), transparent 70%)',
            theme === 'dark' ? 'radial-gradient(circle at 50% 50%, rgba(30,144,255,0.1), transparent 70%)' : 'radial-gradient(circle at 50% 50%, rgba(173,216,230,0.2), transparent 70%)',
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">
        {title && (
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </motion.div>
  );
};

export default FuturisticCard;