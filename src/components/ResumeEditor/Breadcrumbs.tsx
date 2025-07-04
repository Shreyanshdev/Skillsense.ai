// src/components/common/Breadcrumbs.tsx
'use client';

import { BiChevronRight } from "react-icons/bi";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { goToStep } from '@/redux/slices/resumeSlice';
import { motion } from 'framer-motion';

interface BreadcrumbsProps {
  currentStep: number;
  sections: string[]; // Array of section names from Redux state (e.g., ["General Info", "Personal Info", ...])
}

function Breadcrumbs({ currentStep, sections }: BreadcrumbsProps) {
  const dispatch: AppDispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Base styles for the entire nav container - adjusted for horizontal scrolling
  const navBaseClass = `
    flex items-center text-xs sm:text-sm font-sans w-fit max-w-full p-1.5 md:p-2 rounded-full shadow-md
    transition-colors duration-300 backdrop-blur-sm
    ${isDark ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'}
    overflow-x-auto flex-nowrap custom-scrollbar
  `;
  // Added max-w-full to ensure it doesn't exceed its parent's width,
  // overflow-x-auto for horizontal scroll, and flex-nowrap to prevent wrapping.
  // custom-scrollbar is a placeholder, you'd define this in your global CSS if you want
  // a custom scrollbar appearance. Otherwise, default browser scrollbar will appear.

  // Styles for individual breadcrumb items (inactive) - adjusted padding/font size for responsiveness
  const inactiveCrumbClass = `
    relative px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium text-xs sm:text-sm
    transition-all duration-200 ease-in-out cursor-pointer whitespace-nowrap flex-shrink-0
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-red-600 focus:ring-offset-gray-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-red-500 focus:ring-offset-white'}
  `;
  // Added flex-shrink-0 to inactiveCrumbClass to ensure items don't shrink and force scroll.

  // Styles for separator icon - adjusted size for responsiveness
  const separatorClass = `
    mx-1 sm:mx-1.5 text-base sm:text-lg transition-transform duration-300 ease-in-out flex-shrink-0
    ${isDark ? 'text-gray-600' : 'text-gray-400'}
  `;

  // Function to determine border color for active step
  const getActiveBorderColor = (idx: number) => {
    const progressPercentage = ((idx + 1) / sections.length) * 100;
    const gradientStart = isDark ? '#f87171' : '#ef4444'; // Red-400 / Red-500
    const gradientEnd = isDark ? '#b91c1c' : '#dc2626'; // Red-700 / Red-600

    return `conic-gradient(from 0deg, ${gradientEnd} 0%, ${gradientEnd} ${progressPercentage}%, transparent ${progressPercentage}%, transparent 100%)`;
  };

  return (
    <nav className={navBaseClass}>
      {sections.map((segment, idx) => {
        const label = segment;
        const isActive = idx === currentStep;

        const handleClick = (stepIndex: number) => {
          if (!isActive) {
            dispatch(goToStep(stepIndex));
          }
        };

        return (
          <motion.div
            key={idx}
            className="flex items-center group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
          >
            {/* Separator only if not the first item */}
            {idx > 0 && (
              <BiChevronRight className={separatorClass} />
            )}

            {isActive ? (
              <motion.div
                className={`relative font-bold text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full cursor-default flex-shrink-0
                  ${isDark ? 'bg-red-800/30 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-300'}
                  overflow-hidden
                `}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: `
                    linear-gradient(${isDark ? 'rgb(31 41 55)' : 'rgb(255 255 255)'}, ${isDark ? 'rgb(31 41 55)' : 'rgb(255 255 255)'}),
                    ${getActiveBorderColor(idx)}
                  `,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                {label}
              </motion.div>
            ) : (
              <motion.button
                onClick={() => handleClick(idx)}
                className={inactiveCrumbClass}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {label}
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;