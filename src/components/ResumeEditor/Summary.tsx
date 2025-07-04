// src/components/ResumeEditor/Summary.tsx
'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { updateSummary, setAILoading, setAIError } from '@/redux/slices/resumeSlice';
import { motion } from 'framer-motion';
import { FaMagic } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '@/services/api'; // Ensure this path is correct

const Summary = () => {
  const dispatch: AppDispatch = useDispatch();
  const summary = useSelector((state: RootState) => state.resume.resumeData.summary);
  const personalInfo = useSelector((state: RootState) => state.resume.resumeData.personalInfo);
  const experience = useSelector((state: RootState) => state.resume.resumeData.experience);
  const projects = useSelector((state: RootState) => state.resume.resumeData.projects);
  const skills = useSelector((state: RootState) => state.resume.resumeData.skills); // Skills are an array of Skill objects
  const isLoadingAI = useSelector((state: RootState) => state.resume.isLoadingAI); // Correct path for isLoadingAI
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateSummary(e.target.value));
  };

  // Dynamic classes (reusing from previous components)
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
  const aiButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                         ${isDark ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-sky-500 text-white hover:bg-sky-600'}
                         focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-sky-700 focus:ring-offset-gray-800' : 'focus:ring-sky-500 focus:ring-offset-white'}`;


  const handleAIGenerateSummary = async () => {
    // Collect relevant data from Redux state to send to AI for context
    const resumeContext = {
      personalInfo: {
        name: personalInfo.name,
        jobTitle: personalInfo.jobTitle, // Use personalInfo.jobTitle
      },
      skills: skills.map(s => s.name).join(', '), // Correctly map skill objects to names
      experienceSummary: experience.map(exp => `${exp.jobTitle} at ${exp.company} from ${exp.startDate} to ${exp.endDate || 'Present'}:\n${exp.responsibilities.map(r => `- ${r}`).join('\n')}`).join('\n\n'),
      projectSummary: projects.map(proj => `${proj.name}:\n${proj.bulletPoints.map(p => `- ${p}`).join('\n')}`).join('\n\n'),
      currentSummary: summary, // Pass current summary for refinement
    };

    dispatch(setAILoading(true));
    toast.loading('Generating summary with AI...', {
      id: 'ai-gen-summary',
      style: {
        background: isDark ? '#333' : '#fff',
        color: isDark ? '#fff' : '#333',
      },
    });

    try {
      const response = await api.post('/resumeApi/generate-summary', resumeContext);
      const generatedSummary = response.data.summary;

      dispatch(updateSummary(generatedSummary)); // Update Redux state with AI-generated summary
      
      toast.success('AI summary generated!', {
        id: 'ai-gen-summary',
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
    } catch (error: any) {
      console.error('AI Summary Generation Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate summary.';
      dispatch(setAIError(errorMessage)); // Correct path for setAIError
      toast.error(errorMessage, {
        id: 'ai-gen-summary',
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
    } finally {
      dispatch(setAILoading(false)); // Correct path for setAILoading
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Professional Summary</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Craft a compelling summary highlighting your key skills and achievements.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-4 ${formSectionBg}`}
      >
        <label htmlFor="summary" className={`block text-sm font-medium mb-1 ${labelColor}`}>
          Your Professional Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={6}
          value={summary}
          onChange={handleChange}
          placeholder="e.g., Highly motivated software engineer with 5+ years of experience in full-stack development..."
          className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm resize-y transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
          required
        ></textarea>
        <p className={`mt-1 text-xs ${infoTextColor}`}>
          Keep it concise, 3-5 sentences summarizing your professional identity.
        </p>
        <motion.button
          type="button"
          onClick={handleAIGenerateSummary}
          disabled={isLoadingAI} // Disable if AI is already loading
          className={`mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${aiButtonClass}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaMagic className="mr-2" /> {isLoadingAI ? 'Generating...' : 'AI Generate Summary'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Summary;