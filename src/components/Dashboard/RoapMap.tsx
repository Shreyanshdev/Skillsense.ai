// src/components/Dashboard/RoadmapGenerateDialog.tsx
'use client';

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, X, Map, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RoadmapGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateSuccess: (roadmapId: string) => void;
}

export const RoadmapGenerateDialog: React.FC<RoadmapGenerateDialogProps> = ({
  isOpen,
  onClose,
  onGenerateSuccess,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [userInput, setUserInput] = useState<string>('');
  // NEW STATE FOR TIME DURATION
  const [timeDuration, setTimeDuration] = useState<string>(''); // Default to empty string for 'No Preference'
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Theme-dependent dialog classes
  const textColorClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const subTextColorClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColorClass = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const dialogBgClass = isDark ? 'bg-gray-800/80' : 'bg-white/80';
  const primaryButtonGradient = 'bg-gradient-to-r from-sky-500 to-blue-600';
  const primaryButtonHover = 'hover:from-sky-600 hover:to-blue-700';
  const primaryButtonShadow = 'shadow-lg hover:shadow-blue-500/30';
  const defaultButtonBgClass = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300';
  const defaultButtonTextColorClass = isDark ? 'text-gray-200' : 'text-gray-700';
  const inputBgClass = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const inputBorderFocus = isDark ? 'focus:border-sky-500' : 'focus:border-blue-500';

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [userInput]);

  // Reset dialog state when it opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserInput('');
      setTimeDuration(''); // Reset time duration
      setLoading(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  const GenerateRoadmap = async () => {
    if (!userInput.trim()) {
      setErrorMessage('Please describe your career goals or current situation to generate a roadmap.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const roadmapId = uuidv4();

    try {
      const result = await axios.post('/api/ai-roadmap-agent', {
        roadmapId: roadmapId,
        userInput: userInput,
        // NEW: Include timeDuration in the payload
        timeDuration: timeDuration || 'no_preference', // Send 'no_preference' if not selected
      });
      console.log("Roadmap generated successfully:", result.data);
      toast.success('Roadmap generation initiated!');
      onGenerateSuccess(roadmapId);
      onClose();
    } catch (e: any) {
      console.error("Error generating roadmap:", e);
      setErrorMessage(e.response?.data?.error || 'Failed to generate roadmap. Please try again.');
      toast.error('Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (!loading) {
      onClose();
    }
  };

  const dropIn:Variants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: '0', opacity: 1, transition: { duration: 0.2, type: 'spring', damping: 25, stiffness: 500 } },
    exit: { y: '100vh', opacity: 0 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-black/70 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'}`}
        onClick={handleCloseDialog}
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          variants={dropIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative p-8 rounded-2xl shadow-xl w-11/12 max-w-lg ${dialogBgClass} border ${borderColorClass} ${textColorClass} backdrop-blur-lg`}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseDialog}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            aria-label="Close dialog"
            disabled={loading}
          >
            <X size={24} />
          </button>

          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${textColorClass}`}>
            <Map size={28} className="text-blue-500" /> Generate Career Roadmap
          </h2>
          <p className={`${subTextColorClass} mb-6`}>
            Describe your current career situation or desired goals, and our AI will craft a personalized roadmap for you. You can also specify a time duration.
          </p>

          {/* User Input Textarea */}
          <div className="mb-4">
            <label htmlFor="roadmap-input" className={`block text-sm font-medium mb-2 ${subTextColorClass}`}>
              Your Goals / Current Situation:
            </label>
            <textarea
              id="roadmap-input"
              ref={textAreaRef}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setUserInput(e.target.value);
                setErrorMessage('');
              }}
              placeholder="E.g., 'I want to become a Senior Frontend Developer specializing in React within 3 years, starting from a junior role.', or 'I'm a Data Analyst looking to transition into Machine Learning Engineering.'"
              rows={4}
              className={`w-full p-3 rounded-lg border-2 ${borderColorClass} ${inputBgClass} ${textColorClass} placeholder-${subTextColorClass} focus:outline-none ${inputBorderFocus} transition-all duration-200 resize-y min-h-[100px]`}
              disabled={loading}
            />
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errorMessage}
              </motion.p>
            )}
          </div>

          {/* NEW: Time Duration Selection */}
          <div className="mb-6">
            <label htmlFor="time-duration" className={`block text-sm font-medium mb-2 ${subTextColorClass}`}>
              Time Duration (Optional):
            </label>
            <select
              id="time-duration"
              value={timeDuration}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setTimeDuration(e.target.value)}
              className={`w-full p-3 rounded-lg border-2 ${borderColorClass} ${inputBgClass} ${textColorClass} focus:outline-none ${inputBorderFocus} transition-all duration-200`}
              disabled={loading}
            >
              <option value="">No Preference</option> {/* Optional value */}
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
              <option value="2_years">2 Years</option>
              <option value="3_years">3 Years</option>
              <option value="5_years">5 Years</option>
              <option value="10_years">10+ Years</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              onClick={handleCloseDialog}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${defaultButtonBgClass} ${defaultButtonTextColorClass}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              Cancel
            </motion.button>

            <motion.button
              onClick={GenerateRoadmap}
              className={`inline-flex items-center justify-center gap-x-2 px-6 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200
                         ${primaryButtonGradient} ${primaryButtonHover} ${primaryButtonShadow}
                         ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-103 active:scale-97'}`}
              whileHover={loading ? {} : { scale: 1.03 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              disabled={loading || !userInput.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Map size={20} /> Generate Roadmap
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};