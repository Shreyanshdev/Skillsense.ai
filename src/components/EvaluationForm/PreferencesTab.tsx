// src/components/EvaluationForm/PreferencesTab.tsx
// Handles the content and logic for the 'Preferences' tab of the evaluation form

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaTrashAlt, FaSpinner, FaTimesCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { FiCheckSquare } from 'react-icons/fi';
import SectionWrapper from '@/components/common/SectionWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Import constants and types
import { DURATION_OPTIONS } from '@/constants';

// Define props for the PreferencesTab component
interface PreferencesTabProps {
    // State
    selectedDuration: string;
    isSubmitting: boolean;
    error: string; // Pass error state down to display relevant errors
    isSubmitDisabled: boolean; // Pass the disabled state for the submit button

    // Handlers
    handleDurationSelect: (durationId: string) => void;
    handleClearAll: () => void;
    handleSubmit: (event: React.FormEvent) => Promise<void>; // Pass the submit handler

    // Styling helpers (passed as props or imported if defined globally)
    pillButtonClass: (isSelected: boolean) => string;
    secondaryButtonClass: string;
    primaryButtonClass: string;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({
    // State
    selectedDuration, isSubmitting, error, isSubmitDisabled,
    // Handlers
    handleDurationSelect, handleClearAll, handleSubmit,
    // Styling
    pillButtonClass, secondaryButtonClass, primaryButtonClass,
}) => {
    const theme = useSelector((state: RootState) => state.theme.theme);

    // Guidelines Content component (defined locally as it's only used here)
    const GuidelinesSection = ({ selectedDuration }: { selectedDuration: string }) => {
        const theme = useSelector((state: RootState) => state.theme.theme);
         const DURATION_OPTIONS = [ // Defined locally for this component
              { id: '15m', name: 'Quick (15 min)', icon: null },
              { id: '30m', name: 'Standard (30 min)', icon: null },
              { id: '45m', name: 'In-depth (45 min)', icon: null },
              { id: '60m', name: 'Full (60 min)', icon: null },
         ];
         const durationName = DURATION_OPTIONS.find(d => d.id === selectedDuration)?.name || 'selected duration';


        return (
            <SectionWrapper title="What to Expect" icon={<FaInfoCircle className="text-sky-500" />}>
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600 text-gray-300' : 'bg-blue-50/50 border border-blue-200 text-gray-700'}`}
                >
                    <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}><span className="font-semibold">Question Types:</span> You will encounter a mix of coding challenges, multiple-choice questions, and theoretical concepts.</motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}><span className="font-semibold">Requirements:</span> Ensure you have a stable internet connection and a quiet environment.</motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}><span className="font-semibold">Duration:</span> The test duration is based on your selection (<span className="font-semibold">{durationName}</span>). Manage your time effectively.</motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}><span className="font-semibold">After the Test:</span> You will receive a summary of your performance and suggested areas for improvement.</motion.li>
                    </ul>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.6 }} className={`mt-3 text-xs sm:text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This assessment helps us understand your strengths to provide tailored learning resources.</motion.p>
                 </motion.div>
            </SectionWrapper>
        );
    };


    return (
        <>
            <GuidelinesSection selectedDuration={selectedDuration} />

            <SectionWrapper title="Test Duration" icon={<FaClock className="text-sky-500" />}>
                <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose how long you want the test to be.</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {DURATION_OPTIONS.map(o => (
                        <motion.button key={o.id} type="button" onClick={() => handleDurationSelect(o.id)} className={pillButtonClass(selectedDuration === o.id)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            {o.icon}<span>{o.name}</span>{selectedDuration === o.id && <FaCheckCircle className="ml-auto text-sky-500" />}
                        </motion.button>
                    ))}
                </div>
            </SectionWrapper>

            <div className="pt-6 space-y-4">
                <AnimatePresence>
                    {error && !error.includes('upload your resume') && ( // Only show general errors here
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`text-red-500 text-sm sm:text-base text-center flex items-center justify-center p-3 ${theme=='dark'?'bg-red-500/10':'bg-red-500/5'} rounded-md border ${theme=='dark'?'border-red-500/30':'border-red-500/20'}`}>
                            <FaTimesCircle className="mr-2" /> {error}
                        </motion.p>
                    )}
                </AnimatePresence>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                    <motion.button type="button" onClick={handleClearAll} className={`${secondaryButtonClass} w-full sm:w-auto`} whileHover={{ scale: 1.05}} whileTap={{scale: 0.95}}>
                        <FaTrashAlt className="mr-1.5" /> Clear All
                    </motion.button>
                    {/* Submit button is unique to this tab */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitDisabled}
                        onClick={handleSubmit}
                        className={`${primaryButtonClass} w-full sm:w-auto`}
                    >
                        {isSubmitting ? <><FaSpinner className="animate-spin mr-2" /> Submitting...</> : <><FiCheckSquare className="mr-2" /> Start Evaluation</>}
                    </motion.button>
                </div>
            </div>
        </>
    );
};

export default PreferencesTab;
