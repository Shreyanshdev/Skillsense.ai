'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Import RootState
import AIOrb from './OrbitalHeroSection'; // Ensure this path is correct
import { Sparkles, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';


interface HeroSectionProps {
  onGetStarted: () => void;
}
const NoSSR_Bubbles = dynamic(() => import('./Bubbles'), { ssr: false });

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const theme = useSelector((state: RootState) => state.theme.theme); // Get theme from Redux
  const isDark = theme === 'dark';
  const heroRef = useRef<HTMLElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set isLoaded to true after the component mounts to trigger content animations
    setIsLoaded(true);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden min-h-screen  items-center justify-center">
      
      <NoSSR_Bubbles isDark={isDark} />

      {/* Main content - ensure it's above the background with z-10 */}
      <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40 relative z-10">
        {/* Left side - Text content */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl font-bold tracking-tight sm:text-6xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {/* AI IN EDUCATION banner */}
            <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <p className="text-sky-400 font-medium text-sm tracking-wider uppercase animate-fade-in-right">
                AI IN EDUCATION
              </p>
              <div className="w-12 h-px bg-gradient-to-r from-sky-400 to-transparent animate-line-grow"></div>
            </div>

            {/* Main title */}
            Supercharge Your Career with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 animate-spin">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`mt-6 text-base leading-8 ${ // Corrected font size to 'text-base' for readability
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            SkillSense.AI analyzes your resume, skills, and goals to create a personalized career roadmap that gets you hired faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            {/* Get Started Button */}
            <motion.button
              onClick={onGetStarted}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileTap={{ scale: 0.96 }}
              className={`relative flex items-center gap-x-2 rounded-full px-6 py-3 text-sm font-semibold
                overflow-hidden bg-transparent border border-white/20 backdrop-blur-md transition-all 
               duration-200 group cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-700' : ' text-gray-900 hover:bg-gray-100'} `}
            >
              {/* Animated bubble background that triggers on full button hover */}
              <motion.div
                variants={{
                  rest: { width: '3rem' },
                  hover: { width: '100%' },
                }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-blue-600 opacity-100 rounded-full z-0"
              />

              {/* Foreground content */}
              <span className="relative z-10 flex items-center gap-x-2">
                <Zap className="w-3 h-3 text-sky-300 animate-pulse" />
                Get Started
                <FiArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right side - AI Orb */}
        <div className={`flex justify-center mt-20 lg:justify-end transition-all duration-1500 delay-300 ${
          isLoaded ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
        }`}>
          <AIOrb />
        </div>
      </div>
      
      {/* Features Section - Renders below the Hero content but within the same section */}
      
    </section>
  );
};

export default HeroSection;