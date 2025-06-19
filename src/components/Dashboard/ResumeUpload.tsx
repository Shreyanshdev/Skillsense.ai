// src/components/ResumeUploadDialog.tsx

'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileUp, X, Loader2, Check, ArrowRight, UploadCloud } from 'lucide-react';
import axios from 'axios';
import api from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
// import { set } from 'lodash'; // This import is not used and can be removed

interface ResumeUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeSuccess: (recordId: string) => void;
}

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'complete' | 'error';

export const ResumeUploadDialog: React.FC<ResumeUploadDialogProps> = ({ isOpen, onClose, onAnalyzeSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const theme = useSelector((state: RootState) => state.theme.theme);

  // Theme-dependent dialog classes
  const textColorClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subTextColorClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColorClass = theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'; // More subtle border
  const dialogBgClass = theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'; // More glassmorphic
  const defaultButtonBgClass = theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300';
  const defaultButtonTextColorClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setUploadStatus('idle');
      setCurrentRecordId(null);
      setErrorMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      // Validate type and size (<2MB)
      if (file.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are allowed.');
        setSelectedFile(null);
        setUploadStatus('idle');
      } else if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('File size must be less than 2 MB.');
        setSelectedFile(null);
        setUploadStatus('idle');
      } else {
        setSelectedFile(file);
        setUploadStatus('selected');
      }
    } else {
      setSelectedFile(null);
      setUploadStatus('idle');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    const newRecordId = uuidv4();
    setCurrentRecordId(newRecordId);
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('recordId', newRecordId);
    try {
      const result = await api.post('/ai-resume-analyzer', formData ,{
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(result.data)
      // Assuming analysis starts immediately after successful upload or is part of this endpoint
      setUploadStatus('analyzing');
    } catch (error) {
      console.error('Failed to upload or analyze resume:', error); // Changed error message
      setErrorMessage('Failed to upload or analyze resume. Please try again.'); // User-friendly message
      setUploadStatus('error');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced simulation time slightly
    setUploadStatus('complete');
  };

  const handleNext =async () => {
    if (currentRecordId) {
      setIsNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAnalyzeSuccess(currentRecordId);
      router.push(`/ai-resume-analyzer/${currentRecordId}`);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const dropIn:Variants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: '0', opacity: 1, transition: { duration: 0.2, type: 'spring', damping: 20, stiffness: 400 } }, // Slightly faster spring
    exit: { y: '100vh', opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'dark' ? 'bg-black/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'}`} // Stronger backdrop blur
          onClick={handleCancel}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative p-8 rounded-2xl shadow-xl w-11/12 max-w-lg ${dialogBgClass} border ${borderColorClass} ${textColorClass} backdrop-blur-lg`} // Added backdrop-blur-lg
          >
            <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" aria-label="Close dialog">
              <X size={24} />
            </button>

            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${textColorClass}`}>
              <UploadCloud size={28} className="text-blue-500" /> Upload Resume
            </h2>
            <p className={`${subTextColorClass} mb-6`}>Upload your resume to get instant analysis and insights.</p>

            <div className={`flex flex-col items-center justify-center border-2 border-dashed ${borderColorClass} rounded-lg p-6 mb-2
                         ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100/30'}`}> {/* Added subtle background */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.03 }} // Subtle scale for internal button
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-blue-500/30" // Added shadow
              >
                <FileUp size={20} /> {selectedFile ? selectedFile.name : 'Select PDF'}
              </motion.button>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4 animate-fade-in">{errorMessage}</p>} {/* Added fade-in */}
            {selectedFile && !errorMessage && <p className={`${subTextColorClass} mb-6 text-sm`}>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}

            {uploadStatus !== 'idle' && uploadStatus !== 'selected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                {uploadStatus === 'uploading' && <p className={`flex items-center justify-center font-medium ${textColorClass}`}><Loader2 className="animate-spin mr-2" size={20} />Uploading...</p>}
                {uploadStatus === 'analyzing' && <p className={`flex items-center justify-center font-medium ${textColorClass}`}><Loader2 className="animate-spin mr-2" size={20} />Analyzing your resume...</p>}
                {uploadStatus === 'complete' && <p className={`flex items-center justify-center font-medium ${textColorClass}`}><Check className="mr-2 text-green-500" size={20} />Analysis Complete!</p>} {/* Green check */}
                {uploadStatus === 'error' && <p className={`flex items-center justify-center text-red-500 font-medium ${textColorClass}`}><X className="mr-2" size={20} />Error during analysis.</p>}
              </motion.div>
            )}

            <div className="flex justify-end gap-3">
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${defaultButtonBgClass} ${defaultButtonTextColorClass}`}
              >
                Cancel
              </motion.button>

              {uploadStatus === 'selected' && !errorMessage && (
                <motion.button
                  onClick={handleUploadAndAnalyze}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.5)' }} // Green glow
                  whileTap={{ scale: 0.95 }}
                  disabled={!selectedFile}
                  className="inline-flex items-center gap-x-2 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/30 transition-all duration-200"
                >
                  <UploadCloud size={20} /> Upload & Analyze
                </motion.button>
              )}

              {uploadStatus === 'complete' && (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59,130,246,0.5)' }} // Blue glow
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-x-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-200"
                >
                 {isNavigating ? ( // Conditionally render spinner or text
                    <>
                      <FaSpinner className={`animate-spin ${theme === 'dark' ? 'text-blue-200' : 'text-blue-200'}`} />
                      Navigating...
                    </>
                  ) : (
                    <>
                      Next <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};