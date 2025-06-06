// src/components/TestInterface/ConfirmationModal.tsx
// A reusable modal component for confirming actions.

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface ConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  theme: string; // 'light' or 'dark'
  title: string; // NEW: Title for the modal
  message: React.ReactNode; // Can be string or JSX
  confirmText?: string; // Optional text for the confirm button
  cancelText?: string; // Optional text for the cancel button
}

const Confirmation: React.FC<ConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  theme,
  title, // Destructure title
  message,
  confirmText = 'Confirm', // Default text
  cancelText = 'Cancel',   // Default text
}) => {
  const isDarkMode = theme === 'dark';

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60"
            variants={backdropVariants}
            onClick={onClose} // Close on backdrop click
          />

          {/* Modal Content */}
          <motion.div
            className={`
              relative z-10 w-full max-w-md rounded-xl shadow-2xl
              ${isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}
              p-6 sm:p-8
            `}
            variants={modalVariants}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`
                absolute top-3 right-3 p-2 rounded-full
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
                transition-colors
              `}
              aria-label="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Title */}
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title} {/* Render the title prop */}
            </h3>

            {/* Modal Message */}
            <div className="mb-6 leading-relaxed">
              {message}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className={`
                  px-5 py-2 rounded-lg font-medium transition-colors
                  ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`
                  px-5 py-2 rounded-lg font-medium transition-colors
                  bg-sky-500 text-white hover:bg-sky-600
                `}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Confirmation;
