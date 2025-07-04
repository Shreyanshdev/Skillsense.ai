// src/components/TemplateChooser.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setTemplate } from '@/redux/slices/resumeSlice';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface TemplateChooserProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock thumbnails (replace with actual image paths)
const templateThumbnails = {
  'modern-professional': { // ADD THIS NEW TEMPLATE ENTRY
    name: 'Modern Professional',
    image: '/templates/modern-professional-thumb.png', // Create this image!
    description: 'A clean, professional, and content-focused layout inspired by LaTeX.',
  },
  modern: {
    name: 'Modern',
    image: '/templates/modern-thumb.png',
    description: 'Clean and contemporary design.',
  },
  classic: {
    name: 'Classic',
    image: '/templates/classic-thumb.png',
    description: 'Traditional and professional layout.',
  },
};

const TemplateChooser: React.FC<TemplateChooserProps> = ({ isOpen, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const currentTemplateId = useSelector((state: RootState) => state.resume.templateId);
  const isDark = theme === 'dark';

  const modalBgClass = isDark ? 'bg-gray-900/80' : 'bg-black/50';
  const panelBgClass = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const selectedBorderColor = isDark ? 'border-blue-500 ring-blue-500' : 'border-blue-700 ring-blue-700';

  const handleTemplateSelect = (templateId: string) => {
    dispatch(setTemplate(templateId));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[110] flex items-center justify-center p-4 ${modalBgClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 border ${borderColor} ${panelBgClass}`}
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 text-xl rounded-full p-2
                ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Close"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Template</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(templateThumbnails).map(([id, template]) => (
                <motion.div
                  key={id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center text-center transition-all duration-200
                    ${id === currentTemplateId ? `${selectedBorderColor} ring-4` : `${borderColor} hover:shadow-lg`}
                  `}
                  onClick={() => handleTemplateSelect(id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-full h-40 mb-3 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center text-gray-500 text-sm`}>
                    {template.image ? (
                        <Image src={template.image} alt={template.name} width={200} height={150} objectFit="cover" className="w-full h-full" />
                    ) : (
                        `Thumbnail for ${template.name}`
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateChooser;