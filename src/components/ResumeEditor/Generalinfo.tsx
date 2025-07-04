// src/components/ResumeEditor/Generalinfo.tsx
'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { updateGeneralInfo } from '@/redux/slices/resumeSlice';
import { motion } from 'framer-motion';

const Generalinfo = () => {
  const dispatch: AppDispatch = useDispatch();
  const generalInfo = useSelector((state: RootState) => state.resume.resumeData.generalInfo);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const formSectionBg = isDark ? 'bg-gray-800/80 border-gray-700 shadow-xl backdrop-blur-sm' : 'bg-gray-50 border-gray-200 shadow-sm';
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputTextColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputPlaceholderColor = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const inputFocusRing = isDark ? 'focus:ring-red-700 focus:border-red-700' : 'focus:ring-red-500 focus:border-red-500';
  const infoTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const headerColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subHeaderColor = isDark ? 'text-gray-300' : 'text-gray-600';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateGeneralInfo({ [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>General Information</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Manage internal details for your resume and common profile links.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-5 ${formSectionBg}`}
      >
        {/* Resume Title (Internal) */}
        <div>
          <label htmlFor="resumeTitle" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            Resume Title (Internal)
          </label>
          <motion.input
            type="text"
            id="resumeTitle"
            name="resumeTitle"
            value={generalInfo.resumeTitle}
            onChange={handleChange}
            placeholder="e.g., Software Engineer Resume - Google"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          />
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            A descriptive name for your reference (e.g., "Software Dev CV - Q3 2025"). This is for internal use and not displayed on the resume.
          </p>
        </div>

        {/* Resume Description (Internal) */}
        <div>
          <label htmlFor="resumeDescription" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            Resume Description (Internal)
          </label>
          <motion.textarea
            id="resumeDescription"
            name="resumeDescription"
            value={generalInfo.resumeDescription}
            onChange={handleChange}
            rows={4}
            placeholder="e.g., This resume is tailored for senior software engineer roles at tech companies."
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm resize-y transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          ></motion.textarea>
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Briefly describe the purpose or target roles for this resume. This is for internal use and not displayed on the resume.
          </p>
        </div>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedin" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            LinkedIn Profile URL
          </label>
          <motion.input
            type="url"
            id="linkedin"
            name="linkedin"
            value={generalInfo.linkedin}
            onChange={handleChange}
            placeholder="https://www.linkedin.com/in/yourprofile"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          />
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Your professional LinkedIn profile link. This will appear on your resume.
          </p>
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="github" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            GitHub Profile URL (Personal)
          </label>
          <motion.input
            type="url"
            id="github"
            name="github"
            value={generalInfo.github}
            onChange={handleChange}
            placeholder="https://github.com/yourusername"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          />
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Your personal GitHub profile link. This will appear on your resume. For project-specific links, use the Projects section.
          </p>
        </div>

        {/* Portfolio URL */}
        <div>
          <label htmlFor="portfolio" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            Portfolio / Personal Website URL
          </label>
          <motion.input
            type="url"
            id="portfolio"
            name="portfolio"
            value={generalInfo.portfolio}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          />
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Your personal portfolio or website link. This will appear on your resume.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Generalinfo;