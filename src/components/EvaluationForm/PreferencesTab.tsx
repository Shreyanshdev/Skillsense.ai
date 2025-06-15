

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaTrashAlt, FaSpinner, FaTimesCircle, FaInfoCircle} from 'react-icons/fa'; // Added FaQuestionCircle
import SectionWrapper from '@/components/common/SectionWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Define props for the PreferencesTab component
interface PreferencesTabProps {
    // State from EvaluationForm (some might be less relevant for UI, but passed for consistency)
    selectedDuration: string; // Will no longer be used for UI selection, but might be sent to backend
    isSubmitting: boolean;
    error: string;
    
    isSubmitDisabled: boolean;

    // Handlers from EvaluationForm
    handleDurationSelect: (durationId: string) => void; // No longer used for UI interaction
    handleClearAll: () => void;
    handleSubmit: (event: React.FormEvent) => void; // Changed to React.FormEvent for better type safety

    // Styling helpers (passed as props)
    pillButtonClass: (isSelected: boolean) => string; // Still needed for general pill styling if any
    secondaryButtonClass: string;
    primaryButtonClass: string;

    // NEW props for dynamic test configuration (from EvaluationForm)
    testType: 'general' | 'specialized';
    isGARoundSelected: boolean;
    generalTestCounts: { mcq: number; theory: number; coding: number };
    specializedRoundCounts: { mcq: number | ''; theory: number | ''; coding: number | ''; }; // Allow empty string
    codingDifficulty: string; // 'easy', 'medium', 'hard', 'mixed'
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({
    // State
    selectedDuration, isSubmitting, error, isSubmitDisabled,
    // Handlers
    handleDurationSelect, handleClearAll, handleSubmit,
    // Styling
    pillButtonClass, secondaryButtonClass, primaryButtonClass,
    // New Test Config Props
    testType, isGARoundSelected, generalTestCounts, specializedRoundCounts, codingDifficulty,
}) => {
    const theme = useSelector((state: RootState) => state.theme.theme);

    // Guidelines Content component (defined locally as it's only used here)
    const GuidelinesSection = () => {
        // Calculate total questions and estimated time based on selected configuration
        const getQuestionCounts = () => {
            if (testType === 'general') {
                return generalTestCounts;
            }
            // For specialized, ensure numbers are parsed, treat empty string as 0 for display
            return {
                mcq: typeof specializedRoundCounts.mcq === 'number' ? specializedRoundCounts.mcq : 0,
                theory: typeof specializedRoundCounts.theory === 'number' ? specializedRoundCounts.theory : 0,
                coding: typeof specializedRoundCounts.coding === 'number' ? specializedRoundCounts.coding : 0,
            };
        };

        const currentCounts = getQuestionCounts();
        let totalQuestions = currentCounts.mcq + currentCounts.theory + currentCounts.coding;
        let estimatedMinutes = 0;
        let roundDetails: string[] = [];

        // Round 1: MCQ
        if (currentCounts.mcq > 0) {
            estimatedMinutes += currentCounts.mcq * 1; // 1 min per MCQ
            roundDetails.push(`Round 1: ${currentCounts.mcq} Multiple Choice Questions (${currentCounts.mcq} min)`);
        }

        // Round 2: Theory
        if (currentCounts.theory > 0) {
            estimatedMinutes += currentCounts.theory * 2; // 2 min per Theory
            roundDetails.push(`Round 2: ${currentCounts.theory} Theoretical Questions (${currentCounts.theory * 2} min)`);
        }

        // Round 3: Coding
        if (currentCounts.coding > 0) {
            let codingTimePerQuestion = 0;
            switch (codingDifficulty) {
                case 'easy': codingTimePerQuestion = 20; break;
                case 'medium': codingTimePerQuestion = 30; break;
                case 'hard': codingTimePerQuestion = 45; break;
                case 'mixed': codingTimePerQuestion = 30; break; // For mixed, assume average 30 min per question for estimation
                default: codingTimePerQuestion = 30; // Fallback
            }
            estimatedMinutes += currentCounts.coding * codingTimePerQuestion;
            roundDetails.push(`Round 3: ${currentCounts.coding} Coding Questions (Difficulty: ${codingDifficulty.charAt(0).toUpperCase() + codingDifficulty.slice(1)}, Est. ${codingTimePerQuestion} min/Q, Total: ${currentCounts.coding * codingTimePerQuestion} min)`);
        }

        // GA Round (optional) - Added explicitly here for display
        if (isGARoundSelected) {
            totalQuestions += 10;
            estimatedMinutes += 10; // 10 questions / 10 minutes for GA
            roundDetails.push(`Optional GA Round: 10 General Aptitude Questions (10 min)`);
        }

        // Filter out empty rounds if specialized test allows 0 questions (though min 2 is enforced)
        roundDetails = roundDetails.filter(detail => !detail.includes('0 Questions'));


        return (
            <SectionWrapper title="What to Expect" icon={<FaInfoCircle className="text-sky-500" />}>
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={`p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600 text-gray-300' : 'bg-blue-50/50 border border-blue-200 text-gray-700'}`}
                >
                    <h4 className={`font-semibold text-lg mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Test Overview:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                            <span className="font-semibold">Test Type:</span> {testType === 'general' ? 'General Assessment' : 'Specialized Assessment'}
                        </motion.li>
                        {roundDetails.length > 0 && (
                            <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                                <span className="font-semibold">Rounds:</span>
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    {roundDetails.map((detail, index) => (
                                        <li key={index}>{detail}</li>
                                    ))}
                                </ul>
                            </motion.li>
                        )}
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                            <span className="font-semibold">Total Questions:</span> {totalQuestions}
                        </motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
                            <span className="font-semibold">Estimated Duration:</span> {estimatedMinutes} minutes
                        </motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>
                            <span className="font-semibold">Navigation:</span> You can switch between questions and rounds at any time during the test.
                        </motion.li>
                        <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.7 }}>
                            <span className="font-semibold">Requirements:</span> Ensure you have a stable internet connection and a quiet environment.
                        </motion.li>
                    </ul>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.8 }} className={`mt-4 text-xs sm:text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        This assessment helps us understand your strengths to provide tailored learning resources.
                    </motion.p>
                 </motion.div>
            </SectionWrapper>
        );
    };


    return (
        <div className="space-y-8"> {/* Added overall vertical spacing */}
            {/* Guidelines Section */}
            <GuidelinesSection />

            {/* The old "Test Duration" section is removed as duration is now dynamic */}

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
                    
                </div>
            </div>
        </div>
    );
};

export default PreferencesTab;
