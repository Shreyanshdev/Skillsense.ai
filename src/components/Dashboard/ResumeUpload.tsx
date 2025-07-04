'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileUp, X, Loader2, Check, ArrowRight, UploadCloud } from 'lucide-react';
import api from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

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

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const subText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const bgColor = isDark ? 'bg-gray-800/90' : 'bg-white/90';

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setUploadStatus('idle');
      setCurrentRecordId(null);
      setErrorMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMessage('Only PDF files are allowed.');
      setSelectedFile(null);
    } else if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size must be less than 2MB.');
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setUploadStatus('selected');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    const recordId = uuidv4();
    setCurrentRecordId(recordId);
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('recordId', recordId);

    try {
      await api.post('/ai-resume-analyzer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('analyzing');
    } catch {
      setUploadStatus('error');
      setErrorMessage('Upload failed. Please try again.');
      return;
    }

    await new Promise(res => setTimeout(res, 2000));
    setUploadStatus('complete');
  };

  const handleNext = async () => {
    if (!currentRecordId) return;
    setIsNavigating(true);
    await new Promise(res => setTimeout(res, 1000));
    onAnalyzeSuccess(currentRecordId);
    router.push(`/ai-resume-analyzer/${currentRecordId}`);
    onClose();
  };

  const dropIn: Variants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: '0', opacity: 1, transition: { duration: 0.2, type: 'spring', damping: 20, stiffness: 400 } },
    exit: { y: '100vh', opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className={`relative p-6 rounded-xl shadow-2xl w-[90%] max-w-md ${bgColor} border ${borderColor} ${textColor}`}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <UploadCloud size={28} className="text-blue-500" />
              <h2 className="text-xl font-bold">Upload Your Resume</h2>
            </div>
            <p className={`mb-4 text-sm ${subText}`}>PDF only, max 2MB. Instant resume analysis.</p>

            <div className={`flex flex-col items-center justify-center border-2 border-dashed ${borderColor} rounded-lg p-6 mb-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-100/30'}`}>
              <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 rounded-full text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow"
              >
                <FileUp className="inline mr-2" size={18} /> {selectedFile ? selectedFile.name : 'Select Resume PDF'}
              </motion.button>
            </div>

            {errorMessage && <p className="text-red-500 text-sm mb-4 animate-pulse">{errorMessage}</p>}
            {selectedFile && !errorMessage && <p className={`text-xs mb-2 ${subText}`}>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}

            {uploadStatus !== 'idle' && uploadStatus !== 'selected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-center">
                {uploadStatus === 'uploading' && <p className="flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={18} /> Uploading...</p>}
                {uploadStatus === 'analyzing' && <p className="flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={18} /> Analyzing...</p>}
                {uploadStatus === 'complete' && <p className="flex items-center justify-center gap-2 text-green-500 text-sm"><Check size={18} /> Done!</p>}
                {uploadStatus === 'error' && <p className="flex items-center justify-center gap-2 text-red-500 text-sm"><X size={18} /> Error occurred</p>}
              </motion.div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                className={`px-5 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </motion.button>

              {uploadStatus === 'selected' && !errorMessage && (
                <motion.button
                  onClick={handleUploadAndAnalyze}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:from-green-600 hover:to-emerald-700"
                >
                  Upload & Analyze
                </motion.button>
              )}

              {uploadStatus === 'complete' && (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow hover:from-blue-600 hover:to-indigo-700"
                >
                  {isNavigating ? <FaSpinner className="animate-spin" /> : <><span>Next</span> <ArrowRight size={18} className="ml-2" /></>}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
