// src/app/my-resumes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  createNewResume, // This action is less critical now for loading, but good for starting a fresh Redux state
  loadResume,      // Key action for loading existing data into Redux
  blankResumeContent, // For creating new resume data
  ResumeState,      // Interface for the full Redux resume state
  // You might not need to import all individual content interfaces here
  // unless you specifically need them for local object creation.
  // For simplicity, I'll assume ResumeState and blankResumeContent are sufficient.
} from '@/redux/slices/resumeSlice';
import AppLayout from '@/components/Layout/AppLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrashAlt, FaFileAlt, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for new records
import api from '@/services/api'; // <--- IMPORTANT: Your API service import

// --- Type Definitions for API Records ---
// This interface reflects the structure of a history record from your DB via API.
// It's different from ResumeState because the DB stores a more compact representation.
interface HistoryRecord {
  id: number; // The database primary key, if applicable (optional, recordId is main ID)
  recordId: string; // The UUID that links to your ResumeState.id
  content: ResumeState['resumeData']; // The actual resume content stored as JSON/JSONB
  userEmail: string; // User who owns the record
  createdAt: string;
  updatedAt?: string; // Optional: last modified timestamp
  aiAgentType: string; // E.g., '/ai-resume-builder', '/ai-image-generator'
  metadeta?: string; // JSON string for additional metadata like resume title, template ID
}

// Define constant for clarity
const AI_RESUME_BUILDER_AGENT_TYPE = '/ai-resume-builder';

// Helper function to safely parse metadeta assuming it's JSON for resumes
const parseResumeMetadeta = (metadetaString: string | undefined): { title?: string; templateId?: string } | null => {
  if (!metadetaString) {
    return null;
  }
  try {
    const parsed = JSON.parse(metadetaString);
    if (typeof parsed === 'object' && parsed !== null && ('title' in parsed || 'templateId' in parsed)) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse resume metadata JSON:", e);
    return null;
  }
};


const MyResumesPage = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // State to hold our list of history records for resumes
  const [resumes, setResumes] = useState<HistoryRecord[]>([]); // Now stores HistoryRecord[]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Dynamic CSS Classes ---
  const cardBgClass = isDark ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white';
  const cardBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subtextColor = isDark ? 'text-gray-400' : 'text-gray-600';

  const actionButtonClass = (color: string) => `
    flex items-center justify-center p-2 rounded-full transition-colors duration-200 ease-in-out
    ${color} text-white focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
  `;

  const newResumeBtnColor = isDark ? 'bg-red-700 hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
  const editBtnColor = isDark ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
  const deleteBtnColor = isDark ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600' : 'bg-red-500 hover:bg-red-600 focus:ring-red-500';

  // --- Fetch Resumes from API ---
  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await api.get('/history'); // Your API endpoint to fetch all history
        // Filter records to only include those from the AI Resume Builder
        const resumeRecords: HistoryRecord[] = response.data.filter((record: HistoryRecord) =>
          record.aiAgentType === AI_RESUME_BUILDER_AGENT_TYPE
        );
        setResumes(resumeRecords);
      } catch (err: any) {
        console.error("Error fetching resumes:", err);
        setError(err.response?.data?.error || "Failed to load resumes.");
        toast.error(err.response?.data?.error || "Failed to load resumes.", {
          style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, [isDark]); // Re-fetch if theme changes (optional, but good for toast styles)

  // --- Handlers ---
  const handleNewResume = async () => {
    setIsLoading(true);
    setError(null);

    const newRecordId = uuidv4();
    const newResumeTitle = 'New Resume ' + new Date().toLocaleDateString();
    const currentTime = new Date().toISOString();

    // The Redux slice needs a full ResumeState object
    const initialResumeState: ResumeState = {
      id: newRecordId,
      title: newResumeTitle,
      createdAt: currentTime,
      lastModified: currentTime,
      templateId: 'default',
      currentStep: 0,
      resumeData: blankResumeContent, // Use the blank content for a new resume
      // sections can be imported from your slice's initial state or defined as a constant
      sections: [
        'General Info', 'Personal Info', 'Education', 'Experience', 'Skills',
        'Projects', 'Extra Activity', 'Summary',
      ],
      isLoadingAI: false,
      errorAI: null,
      isSaving: false,
      saveError: null,
    };

    try {
      // Simulate saving to DB/backend
      const apiResponse = await api.post('/history', {
        recordId: newRecordId,
        content: initialResumeState.resumeData, // Send only resumeData to the DB
        aiAgentType: AI_RESUME_BUILDER_AGENT_TYPE,
        metadeta: JSON.stringify({ title: newResumeTitle, templateId: initialResumeState.templateId }),
      });

      // Assuming API returns the full saved record (like Drizzle's .returning())
      const savedHistoryRecord: HistoryRecord = apiResponse.data;

      // Add the newly created record to the local list (for display)
      setResumes(prev => [...prev, savedHistoryRecord]);

      // Load the full ResumeState into Redux for editing
      dispatch(loadResume(initialResumeState));

      // Redirect to the builder with the record ID
      router.push(`/ai-resume-builder/${newRecordId}`);
    } catch (err: any) {
      console.error("Error creating new resume:", err);
      setError(err.response?.data?.error || "Failed to create new resume.");
      toast.error(err.response?.data?.error || "Failed to create new resume.", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditResume = async (recordId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/history?recordId=${recordId}`); // Fetch specific record
      const fetchedRecord: HistoryRecord = response.data;

      if (fetchedRecord && fetchedRecord.aiAgentType === AI_RESUME_BUILDER_AGENT_TYPE) {
        const parsedMetadeta = parseResumeMetadeta(fetchedRecord.metadeta);

        // Construct the full ResumeState object from the fetched HistoryRecord
        const loadedResumeState: ResumeState = {
          id: fetchedRecord.recordId,
          title: parsedMetadeta?.title || 'Untitled Resume',
          createdAt: fetchedRecord.createdAt,
          lastModified: fetchedRecord.updatedAt || fetchedRecord.createdAt,
          templateId: parsedMetadeta?.templateId || 'default',
          currentStep: 0, // Reset step on load, or persist if needed
          resumeData: fetchedRecord.content, // This is the core resume content
          sections: [
            'General Info', 'Personal Info', 'Education', 'Experience', 'Skills',
            'Projects', 'Extra Activity', 'Summary',
          ], // Ensure sections are consistent with your slice
          isLoadingAI: false, // Reset UI states
          errorAI: null,
          isSaving: false,
          saveError: null,
        };
        dispatch(loadResume(loadedResumeState)); // Load into Redux
        router.push(`/ai-resume-builder/${recordId}`); // Redirect
      } else {
        toast.error("Resume data not found or is not a valid resume record!", { style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' } });
      }
    } catch (err: any) {
      console.error("Error fetching resume for edit:", err);
      setError(err.response?.data?.error || "Failed to load resume for editing.");
      toast.error(err.response?.data?.error || "Failed to load resume for editing.", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#333' : '#333' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResume = async (recordId: string) => {
    if (!window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/history?recordId=${recordId}`); // Delete via API
      setResumes(prevResumes => prevResumes.filter(r => r.recordId !== recordId)); // Update local state
      toast.success("Resume deleted successfully!", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    } catch (err: any) {
      console.error("Error deleting resume:", err);
      setError(err.response?.data?.error || "Failed to delete resume.");
      toast.error(err.response?.data?.error || "Failed to delete resume.", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className={`min-h-screen flex flex-col items-center p-4 md:p-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300 font-sans`}>
        <header className="mb-8 text-center">
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-700 dark:from-sky-400 dark:to-blue-600 tracking-tight mb-2 leading-tight`}>
            My Resumes
          </h1>
          <p className={`text-md sm:text-lg ${subtextColor}`}>
            Manage your existing resumes or create a new one.
          </p>
        </header>

        {/* New Resume Button */}
        <motion.button
          onClick={handleNewResume}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${newResumeBtnColor} mb-8 text-lg font-semibold`}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 15px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.97 }}
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus />} Create New Resume
        </motion.button>

        {/* Resumes List */}
        <div className="w-full max-w-4xl">
          {isLoading && resumes.length === 0 && !error ? ( // Show spinner only when initially loading AND no resumes are present AND no error
            <div className="text-center py-10">
              <FaSpinner className={`animate-spin text-4xl ${isDark ? 'text-gray-400' : 'text-gray-600'} mx-auto`} />
              <p className={`mt-4 text-lg ${subtextColor}`}>Loading resumes...</p>
            </div>
          ) : error ? ( // Show error message if an error occurred
            <div className={`text-center py-10 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              <p className="text-lg font-semibold">Error: {error}</p>
              <p className="text-sm">Please try again later.</p>
            </div>
          ) : resumes.length === 0 ? ( // Show empty state when not loading and no resumes and no error
            <div className={`p-8 text-center rounded-lg border ${cardBorderClass} ${cardBgClass}`}>
              <FaFileAlt className={`text-5xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`${subtextColor} text-lg`}>No resumes found. Click "Create New Resume" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {resumes.map((resumeRecord) => { // Renamed to resumeRecord for clarity
                  const parsedMetadeta = parseResumeMetadeta(resumeRecord.metadeta);
                  const title = parsedMetadeta?.title || 'Untitled Resume';
                  const templateName = parsedMetadeta?.templateId || 'Default';
                  const lastModifiedDate = resumeRecord.updatedAt ? new Date(resumeRecord.updatedAt).toLocaleDateString() : 'N/A';

                  return (
                    <motion.div
                      key={resumeRecord.recordId} // Use recordId for key
                      className={`relative p-6 rounded-lg shadow-xl border ${cardBorderClass} ${cardBgClass} flex flex-col`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <FaFileAlt className={`text-4xl mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'} self-center`} />
                      <h2 className={`text-xl font-semibold mb-2 ${textColor}`}>{title}</h2>
                      <p className={`text-sm ${subtextColor} mb-1`}>Last Modified: {lastModifiedDate}</p>
                      <p className={`text-sm ${subtextColor} mb-4`}>Template: {templateName.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>

                      <div className={`flex justify-around items-center gap-3 mt-auto pt-4 border-t border-dashed w-full ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <motion.button
                          onClick={() => handleEditResume(resumeRecord.recordId)}
                          className={`${actionButtonClass(editBtnColor)} px-4 py-2 text-sm md:text-base font-medium flex-grow`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLoading}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteResume(resumeRecord.recordId)}
                          className={`${actionButtonClass(deleteBtnColor)} px-4 py-2 text-sm md:text-base font-medium flex-grow`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLoading}
                        >
                          <FaTrashAlt className="mr-2" /> Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyResumesPage;