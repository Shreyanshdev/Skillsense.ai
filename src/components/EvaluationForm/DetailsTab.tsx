// src/components/EvaluationForm/DetailsTab.tsx
// Handles the content and logic for the 'Details' tab of the evaluation form

import React, { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import SectionWrapper from '@/components/common/SectionWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Define props for the DetailsTab component
interface DetailsTabProps {
    // State
    resumeFile: File | null;
    resumeFileName: string;
    error: string; // Pass error state down to display relevant errors

    // Handlers
    handleResumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    setError: (error: string) => void; // Pass error setter down

    // Styling helpers (passed as props or imported if defined globally)
    inputBaseClass: string; // Although not used directly, keeping for consistency if needed
}

const DetailsTab: React.FC<DetailsTabProps> = ({
    // State
    resumeFile, resumeFileName, error,
    // Handlers
    handleResumeChange, setError,
    // Styling
    inputBaseClass,
}) => {
    const theme = useSelector((state: RootState) => state.theme.theme);

    return (
        <>
            <SectionWrapper title="Upload Resume" icon={<FaCloudUploadAlt className="text-sky-500" />}>
                <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Required. PDF, DOC, DOCX. Max 5MB. Your resume helps personalize the questions further. <span className="text-red-500">*</span></p>
                <label htmlFor="resume-upload" className={`px-5 py-3 rounded-lg font-medium text-base sm:text-lg flex items-center justify-center cursor-pointer group w-full sm:w-auto ${theme === 'dark' ? 'bg-gray-700 text-sky-300 hover:bg-gray-600 border border-gray-600' : 'bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200'} transition-all duration-200 hover:scale-103 active:scale-98`}>
                    <FaCloudUploadAlt className={`mr-2 transition-transform duration-300 group-hover:animate-bounce ${resumeFile ? 'text-green-500' : (theme === 'dark' ? 'text-sky-300' : 'text-sky-600')}`} />
                    {resumeFile ? 'Change Resume' : 'Choose Resume File'}
                </label>
                <input type="file" id="resume-upload" className="hidden" onChange={handleResumeChange} accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                <AnimatePresence>
                    {resumeFileName && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`mt-3 text-sm flex items-center ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}><FaCheckCircle className="mr-2" />{resumeFileName}</motion.p>}
                    {error && error.includes('upload your resume') && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`mt-2 text-xs flex items-center text-red-500`}><FaTimesCircle className="mr-1.5" />{error}</motion.p>
                    )}
                </AnimatePresence>
            </SectionWrapper>
        </>
    );
};

export default DetailsTab;
