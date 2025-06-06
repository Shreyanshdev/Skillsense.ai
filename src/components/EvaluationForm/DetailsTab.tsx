// src/components/EvaluationForm/DetailsTab.tsx
// Handles resume upload, coding difficulty selection, and test type/round counts.

import React, { ChangeEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaFilePdf, FaFileWord, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner, FaQuestionCircle } from 'react-icons/fa';
import SectionWrapper from '@/components/common/SectionWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Define props for the DetailsTab component
interface DetailsTabProps {
    resumeFile: File | null;
    resumeFileName: string;
    error: string;
    codingDifficulty: string;
    analyzedSkills: string[];
    isAnalyzingResume: boolean;
    handleResumeChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
    setError: (error: string) => void;
    handleCodingDifficultyChange: (event: ChangeEvent<HTMLSelectElement>) => void; // This needs to be a select element now
    testType: 'general' | 'specialized';
    isGARoundSelected: boolean;
    generalTestCounts: { mcq: number; theory: number; coding: number };
    specializedRoundCounts: { mcq: number | ''; theory: number | ''; coding: number | ''; };
    handleTestTypeChange: (type: 'general' | 'specialized') => void;
    handleGARoundToggle: () => void;
    handleSpecializedCountChange: (roundType: 'mcq' | 'theory' | 'coding', value: number | '') => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({
    resumeFile, resumeFileName, error, codingDifficulty, analyzedSkills, isAnalyzingResume,
    handleResumeChange, setError, handleCodingDifficultyChange,
    testType, isGARoundSelected, generalTestCounts, specializedRoundCounts,
    handleTestTypeChange, handleGARoundToggle, handleSpecializedCountChange,
}) => {
    const theme = useSelector((state: RootState) => state.theme.theme);

    const isDarkMode = theme === 'dark';

    // Helper for styling pill buttons (replicated from EvaluationForm or passed as prop)
    const pillButtonClass = (isSelected: boolean, colorClass?: string) =>
        `flex-1 px-4 py-2 text-sm sm:text-base rounded-lg border-2 transition-all duration-200 text-center cursor-pointer min-w-[80px]
        ${isSelected
            ? `${colorClass || 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500'} ${isDarkMode ? 'text-sky-300' : 'text-sky-600'}`
            : `${isDarkMode ? 'border-gray-600 hover:border-sky-600 bg-gray-700/50' : 'border-gray-300 hover:border-sky-400 bg-gray-50/50'} ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} hover:scale-[1.02] active:scale-[0.98]`
        }
        focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:z-10`;

    const difficultyOptions = [
        { id: 'easy', label: 'Easy', color: 'green' },
        { id: 'medium', label: 'Medium', color: 'blue' },
        { id: 'hard', label: 'Hard', color: 'red' },
        { id: 'mixed', label: 'Mixed', color: 'purple' }, // New Mixed option
    ];

    const getDifficultyColorClass = (difficultyId: string) => {
        switch (difficultyId) {
            case 'easy': return 'border-green-500 bg-green-500/10 ring-1 ring-green-500 text-green-300';
            case 'medium': return 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 text-blue-300';
            case 'hard': return 'border-red-500 bg-red-500/10 ring-1 ring-red-500 text-red-300';
            case 'mixed': return 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 text-purple-300'; // Specific color for Mixed
            default: return '';
        }
    };


    return (
        <div className="space-y-6">
            {/* Error Display */}
            <AnimatePresence>
                {error && error.includes('resume') && ( // Only show resume-related errors here
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`text-red-500 text-sm sm:text-base text-center flex items-center justify-center p-3 ${isDarkMode?'bg-red-500/10':'bg-red-500/5'} rounded-md border ${isDarkMode?'border-red-500/30':'border-red-500/20'}`}>
                        <FaTimesCircle className="mr-2" /> {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Resume Upload Section */}
            <SectionWrapper title="Upload Resume" icon={<FaUpload className="text-purple-500" />}>
                <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/50 border border-gray-200'}`}>
                    <label htmlFor="resume-upload" className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDarkMode ? 'border-gray-500 hover:border-sky-500 bg-gray-700 text-gray-300' : 'border-gray-300 hover:border-sky-500 bg-gray-100 text-gray-600'}`}>
                        {resumeFileName ? (
                            <div className="flex items-center space-x-2 text-green-500 font-medium">
                                {resumeFile?.type.includes('pdf') ? <FaFilePdf className="text-2xl" /> : <FaFileWord className="text-2xl" />}
                                <span>{resumeFileName}</span>
                                <FaCheckCircle className="ml-2" />
                            </div>
                        ) : (
                            <>
                                <FaUpload className="text-3xl mb-3" />
                                <span className="font-semibold text-center text-sm sm:text-base">Click to upload or drag & drop</span>
                                <span className="text-xs sm:text-sm mt-1">PDF, DOC, DOCX (Max 5MB)</span>
                            </>
                        )}
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className="hidden"
                        />
                    </label>
                    <AnimatePresence>
                        {isAnalyzingResume && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`mt-4 flex items-center text-sm sm:text-base ${isDarkMode ? 'text-sky-300' : 'text-sky-600'}`}
                            >
                                <FaSpinner className="animate-spin mr-2" /> Analyzing resume for skills...
                            </motion.div>
                        )}
                        {!isAnalyzingResume && analyzedSkills.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                <p className="font-semibold text-sm sm:text-base flex items-center mb-2">
                                    <FaCheckCircle className="text-green-500 mr-2" /> Skills identified from resume:
                                </p>
                                <ul className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                    {analyzedSkills.map((skill, index) => (
                                        <li key={index} className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-sky-700/30 text-sky-200' : 'bg-sky-100 text-sky-700'}`}>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                        {!isAnalyzingResume && resumeFile && analyzedSkills.length === 0 && !error && (
                             <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`mt-4 text-orange-500 text-sm sm:text-base flex items-center`}>
                                <FaExclamationTriangle className="mr-2" /> No specific skills found in resume. Consider using user prompt.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </SectionWrapper>

            {/* Test Type Selection Section */}
            <SectionWrapper title="Test Type" icon={<FaInfoCircle className="text-blue-500" />}>
                <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/50 border border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                            type="button"
                            onClick={() => handleTestTypeChange('general')}
                            className={pillButtonClass(testType === 'general')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex-1 text-left">
                                <span className="font-semibold">General Assessment</span>
                                <p className="text-xs sm:text-sm mt-1">
                                    A balanced test ({generalTestCounts.mcq} MCQs, {generalTestCounts.theory} Theory, {generalTestCounts.coding} Coding) covering core concepts.
                                </p>
                            </div>
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => handleTestTypeChange('specialized')}
                            className={pillButtonClass(testType === 'specialized')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex-1 text-left">
                                <span className="font-semibold">Specialized Assessment</span>
                                <p className="text-xs sm:text-sm mt-1">
                                    Customize the number of questions for each round.
                                </p>
                            </div>
                        </motion.button>
                    </div>

                    {testType === 'specialized' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 p-4 rounded-lg bg-opacity-70 border"
                        >
                            <h5 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Customize Question Counts (Min 2 per type):</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="mcq-count" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>MCQ Questions:</label>
                                    <input
                                        type="number"
                                        id="mcq-count"
                                        min="2"
                                        value={specializedRoundCounts.mcq}
                                        onChange={(e) => handleSpecializedCountChange('mcq', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-200 border-gray-500' : 'bg-gray-100 text-gray-800 border-gray-300'} focus:ring-sky-500 focus:border-sky-500`}
                                        placeholder="e.g., 5"
                                    />
                                     {specializedRoundCounts.mcq !== '' && specializedRoundCounts.mcq < 2 && (
                                        <p className="text-red-500 text-xs mt-1">Minimum 2 questions</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="theory-count" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Theory Questions:</label>
                                    <input
                                        type="number"
                                        id="theory-count"
                                        min="2"
                                        value={specializedRoundCounts.theory}
                                        onChange={(e) => handleSpecializedCountChange('theory', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-200 border-gray-500' : 'bg-gray-100 text-gray-800 border-gray-300'} focus:ring-sky-500 focus:border-sky-500`}
                                        placeholder="e.g., 3"
                                    />
                                    {specializedRoundCounts.theory !== '' && specializedRoundCounts.theory < 2 && (
                                        <p className="text-red-500 text-xs mt-1">Minimum 2 questions</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="coding-count" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Coding Questions:</label>
                                    <input
                                        type="number"
                                        id="coding-count"
                                        min="2"
                                        value={specializedRoundCounts.coding}
                                        onChange={(e) => handleSpecializedCountChange('coding', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-200 border-gray-500' : 'bg-gray-100 text-gray-800 border-gray-300'} focus:ring-sky-500 focus:border-sky-500`}
                                        placeholder="e.g., 2"
                                    />
                                    {specializedRoundCounts.coding !== '' && specializedRoundCounts.coding < 2 && (
                                        <p className="text-red-500 text-xs mt-1">Minimum 2 questions</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </SectionWrapper>


            {/* Coding Difficulty Section */}
            <SectionWrapper title="Coding Difficulty" icon={<FaQuestionCircle className="text-orange-500" />}>
                <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/50 border border-gray-200'}`}>
                    <div className="flex flex-wrap gap-3">
                        {difficultyOptions.map((option) => (
                            <motion.button
                                key={option.id}
                                type="button"
                                onClick={() => handleCodingDifficultyChange({ target: { value: option.id } } as ChangeEvent<HTMLSelectElement>)}
                                className={pillButtonClass(codingDifficulty === option.id, getDifficultyColorClass(option.id))}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* General Aptitude Round Section */}
            <SectionWrapper title="General Aptitude Round" icon={<FaInfoCircle className="text-teal-500" />}>
                <div className={`p-5 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/50 border border-gray-200'}`}>
                    <div>
                        <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Include a General Aptitude Round?</p>
                        <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Adds 10 standard general aptitude questions (10 min).
                        </p>
                    </div>
                    <label htmlFor="ga-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="ga-toggle"
                                className="sr-only"
                                checked={isGARoundSelected}
                                onChange={handleGARoundToggle}
                            />
                            <div className={`block w-14 h-8 rounded-full transition-colors ${isGARoundSelected ? 'bg-sky-500' : 'bg-gray-400'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isGARoundSelected ? 'translate-x-full' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>
            </SectionWrapper>

        </div>
    );
};

export default DetailsTab;
