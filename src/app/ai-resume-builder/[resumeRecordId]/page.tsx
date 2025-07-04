// src/app/ai-resume-builder/[resumeRecordId]/page.tsx
'use client';

import React, { useState, useRef } from 'react'; // Import useRef
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { nextStep, prevStep, setSavingStatus, setSaveError, updateResumeTitle } from '@/redux/slices/resumeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaArrowLeft, FaArrowRight, FaFilePdf, FaShareAlt, FaPalette, FaEye, FaTimes } from 'react-icons/fa';
import AppLayout from '@/components/Layout/AppLayout';
import Breadcrumbs from '@/components/ResumeEditor/Breadcrumbs';
import ResumePreview from '@/components/ResumePreview/ResumePreview'; // Keep this import
import TemplateChooser from '@/components/ResumePreview/Templates/TemplateChooser';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

// Import for PDF generation
import { usePDF } from 'react-to-pdf'; // <--- NEW IMPORT


// Import your section components (ensure all are here as before)
import Generalinfo from '@/components/ResumeEditor/Generalinfo';
import PersonalInfo from '@/components/ResumeEditor/PersonalInfo';
import Education from '@/components/ResumeEditor/Education';
import Experience from '@/components/ResumeEditor/Experience';
import Skills from '@/components/ResumeEditor/Skills';
import Projects from '@/components/ResumeEditor/Projects';
import Summary from '@/components/ResumeEditor/Summary';
import AchievementsActivities from '@/components/ResumeEditor/AchievementsActivities';

import api from '@/services/api'; // Your API service import

const sectionComponents = [
  Generalinfo,
  PersonalInfo,
  Education,
  Experience,
  Skills,
  Projects,
  AchievementsActivities,
  Summary,
];

const AI_RESUME_BUILDER_AGENT_TYPE = '/ai-resume-builder'; // Ensure this constant is defined

const ResumeBuilderPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentStep, sections, templateId, resumeData, title: resumeTitle } = useSelector((state: RootState) => state.resume);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const { toPDF, targetRef } = usePDF({ filename: 'resume.pdf', page: { format: 'A4', orientation: 'portrait' } });

  const params = useParams();
  const resumeRecordId = params.resumeRecordId as string;

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showTemplateChooser, setShowTemplateChooser] = useState(false);

  // --- NEW: Ref for PDF generation ---



  const CurrentSectionComponent = sectionComponents[currentStep];

  const progress = ((currentStep + 1) / sections.length) * 100;

  const pageBgClass = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const headerTextColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subheaderTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const sectionBgClass = isDark ? 'bg-gray-800/90' : 'bg-white';
  const sectionBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const exportShareButtonClass = (colorClass: string) => `
    flex items-center justify-center p-2 rounded-full transition-all duration-200 ease-in-out cursor-pointer
    ${colorClass}
    focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-950' : 'focus:ring-offset-white'}
    text-sm sm:text-base md:text-sm lg:text-base
  `;

  const templateButtonColor = isDark ? 'bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500';
  const downloadButtonColor = isDark ? 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  const shareButtonColor = isDark ? 'bg-green-700 text-white hover:bg-green-800 focus:ring-green-700' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
  const previewButtonColor = isDark ? 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500';
  const cancelButtonColor = isDark ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600' : 'bg-gray-400 text-white hover:bg-gray-500 focus:ring-gray-400';

  const headerTextGradient = isDark ? 'bg-gradient-to-r from-sky-400 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-sky-700';

  const fabClass = `
    fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out cursor-pointer
    flex items-center justify-center text-white text-lg md:text-xl font-semibold
    ${isDark ? 'bg-red-700 hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}
    focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
  `;

  const arrowNavButtonClass = `
    z-30 translate p-2 rounded-full
    text-gray-400 hover:text-white
    ${isDark ? 'bg-gray-700/30 hover:bg-red-700' : 'bg-gray-100/30 hover:bg-red-600'}
    shadow-md transition-all duration-300 backdrop-blur-sm cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-red-700 focus:ring-offset-gray-950' : 'focus:ring-red-500 focus:ring-offset-gray-50'}
  `;

  // --- UPDATED: handleDownloadPdf ---
  const handleDownloadPdf = () => {

      toPDF(); // Call the usePDF hook function
      toast.success("Resume download started!", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
     
      toast.error("Could not generate PDF. Preview element not found.", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    
  };


  const handleChooseTemplate = () => {
    setShowTemplateChooser(true);
  };

  // --- NEW/UPDATED: handleShareResume ---
  const handleShareResume = () => {
    // In a real application, this would involve an API call to your backend
    // to generate a unique shareable URL for the resume (e.g., /api/share-resume?recordId=...)
    // The backend would store a token/slug and return the full shareable URL.

    const sampleShareUrl = `${window.location.origin}/share-resume/${resumeRecordId}`; // Example URL

    // For now, we'll just show the sample URL and a copy button
    toast((t) => (
      <div className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
        <p className="font-semibold mb-2">Share Resume (Backend integration needed):</p>
        <p className="text-sm break-all mb-3">{sampleShareUrl}</p>
        <div className="flex justify-end gap-2">
          <motion.button
            onClick={() => {
              navigator.clipboard.writeText(sampleShareUrl);
              toast.success('URL copied to clipboard!', {
                id: t.id, // Update the current toast
                icon: '📋',
                style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
              });
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Copy URL
          </motion.button>
          <motion.button
            onClick={() => toast.dismiss(t.id)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${isDark ? 'text-white' : 'text-gray-800'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Close
          </motion.button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep toast open until dismissed
      style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
    });
  };

  const handleSaveResume = async () => {
    if (!resumeRecordId) {
      toast.error("Cannot save: Resume ID is missing in the URL. Please ensure you accessed this page correctly (e.g., /ai-resume-builder/YOUR_RESUME_ID).", {
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
      return;
    }

    dispatch(setSavingStatus(true));
    toast.loading('Saving resume...', {
      id: 'save-resume',
      style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
    });

    try {
      const dataToSave = resumeData;

      if (resumeData.generalInfo.resumeTitle && resumeData.generalInfo.resumeTitle !== resumeTitle) {
        dispatch(updateResumeTitle(resumeData.generalInfo.resumeTitle));
      }

      const response = await api.put('/history', {
          recordId: resumeRecordId,
          content: dataToSave,
          aiAgentType: AI_RESUME_BUILDER_AGENT_TYPE, // Ensure this is sent
          metadeta: JSON.stringify({
              title: resumeData.generalInfo.resumeTitle || 'Untitled Resume',
              templateId: templateId,
          }),
      });

      console.log("Resume saved successfully:", response.data);
      toast.success("Resume saved!", {
        id: 'save-resume',
        icon: '✅',
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    } catch (err: any) {
      console.error("Error saving resume:", err);
      const errorMessage = err.response?.data?.error || "Failed to save resume.";
      dispatch(setSaveError(errorMessage));
      toast.error(errorMessage, {
        id: 'save-resume',
        style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' },
      });
    } finally {
      dispatch(setSavingStatus(false));
    }
  };

  const handlePreviewResume = () => {
    setShowMobilePreview(true);
  };

  const handleCloseMobilePreview = () => {
    setShowMobilePreview(false);
  };

  return (
    <AppLayout>
      <div className={`min-h-screen flex flex-col p-4 md:p-6 lg:p-8 ${pageBgClass} transition-colors duration-300 font-sans`}>

        <div>

          <header className="sticky top-0 z-20 ">
            <div className="flex flex-col-reverse sm:flex-col-reverse lg:flex-row justify-between items-center lg:items-start px-4 py-4 sm:py-6 lg:px-8 gap-4 lg:gap-0">
              {/* Left Side → Heading and Subtext */}
              <div className="w-full lg:w-auto text-center">
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text ${headerTextGradient} tracking-tight leading-tight`}
                >
                  Your Resume
                </h1>
                <p className={`text-sm sm:text-base font-light lg:text-lg ${subheaderTextColor}`}>
                  Build your professional resume step-by-step.
                  Current Template:{' '}
                  <span className="font-semibold capitalize">{templateId.replace(/-/g, ' ')}</span>
                </p>
              </div>
              {/* Right Side → Actions */}
              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-2 sm:gap-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hidden sm:block">
                    Actions:
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    <motion.button
                      onClick={handleChooseTemplate}
                      className={exportShareButtonClass(templateButtonColor)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Choose Template"
                    >
                      <FaPalette className="text-base sm:text-lg" /> <span className="hidden lg:inline ml-1">Template</span>
                    </motion.button>

                    <motion.button
                      onClick={handleDownloadPdf}
                      className={exportShareButtonClass(downloadButtonColor)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Download PDF"
                    >
                      <FaFilePdf className="text-base sm:text-lg" /> <span className="hidden lg:inline ml-1">Download</span>
                    </motion.button>

                    <motion.button
                      onClick={handleShareResume}
                      className={exportShareButtonClass(shareButtonColor)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Share Resume"
                    >
                      <FaShareAlt className="text-base sm:text-lg" /> <span className="hidden lg:inline ml-1">Share</span>
                    </motion.button>

                    <motion.button
                      onClick={handlePreviewResume}
                      className={`${exportShareButtonClass(previewButtonColor)} lg:hidden`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Preview Resume"
                    >
                      <FaEye className="text-base sm:text-lg" /> Preview
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </header>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 lg:mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-red-600 dark:bg-red-700 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          ></motion.div>
        </div>

        <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Breadcrumbs currentStep={currentStep} sections={sections} />
          </div>

          {/**Next & current step button */}
          <div className='flex'>
            {currentStep > 0 && (
              <motion.button
                onClick={handlePrevious}
                className={`${arrowNavButtonClass}  lg:left md:flex`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                title="Previous Step"
              >
                <FaArrowLeft className="text-xl" />
              </motion.button>
            )}

            {currentStep < sections.length - 1 && (
              <motion.button
                onClick={handleNext}
                className={`${arrowNavButtonClass}  lg:right  md:flex`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                title="Next Step"
              >
                <FaArrowRight className="text-xl" />
              </motion.button>
            )}
          </div>

        </div >

        <main className="relative flex flex-grow flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto pb-8 lg:pb-4">

          <section className={`flex-1 ${sectionBgClass} p-4 md:p-6 rounded-lg shadow-xl ${sectionBorderClass} transition-colors duration-300 overflow-y-auto`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: currentStep > (useSelector((state: RootState) => state.resume.currentStep)) ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: currentStep < (useSelector((state: RootState) => state.resume.currentStep)) ? 50 : -50 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <CurrentSectionComponent />
              </motion.div>
            </AnimatePresence>
          </section>

          {/* --- NEW: Pass ref to ResumePreview --- */}
          <aside  ref={targetRef} className={`lg:w-1/3 flex-shrink-0 ${sectionBgClass} p-4 md:p-6 rounded-lg shadow-xl ${sectionBorderClass} sticky top-0 lg:h-full overflow-y-auto transition-colors duration-300 hidden lg:block`}>
            <h2 className={`text-lg font-bold mb-4 ${headerTextColor}`}>Live Preview</h2>
            <ResumePreview />
          </aside>

        </main>

          {/**Save Button */}
        <motion.button
          onClick={handleSaveResume}
          className={fabClass}
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
          title="Save or Finalize Resume"
        >
          <FaSave className="mr-0 md:mr-2 text-xl md:text-2xl" />
          <span className="hidden md:block">Save Resume</span>
        </motion.button>

        <AnimatePresence>
          {showMobilePreview && (
            <motion.div
              className={`fixed inset-0 z-[100] flex flex-col ${isDark ? 'bg-gray-950/95' : 'bg-white/95'} backdrop-blur-md p-4 md:p-6 lg:hidden`}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className={`text-xl font-bold ${headerTextColor}`}>Resume Preview</h2>
                <motion.button
                  onClick={handleCloseMobilePreview}
                  className={`${exportShareButtonClass(cancelButtonColor)} p-2`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Close Preview"
                >
                  <FaTimes className="text-lg" />
                </motion.button>
              </div>
              <div className={`flex-grow overflow-y-auto rounded-lg shadow-xl ${sectionBgClass} ${sectionBorderClass} p-4`}>
                {/* --- NEW: Pass ref for mobile preview as well if you want it to be downloadable --- */}
                <ResumePreview ref={targetRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TemplateChooser
          isOpen={showTemplateChooser}
          onClose={() => setShowTemplateChooser(false)}
        />

      </div>
    </AppLayout>
  );
};

export default ResumeBuilderPage;