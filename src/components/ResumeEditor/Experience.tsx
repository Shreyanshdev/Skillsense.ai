// src/components/ResumeEditor/Experience.tsx
'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { addExperience, updateExperience, removeExperience, setAILoading, setAIError } from '@/redux/slices/resumeSlice';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes, FaMagic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api'; // Assuming your API service is located here

const Experience = () => {
  const dispatch: AppDispatch = useDispatch();
  const experienceEntries = useSelector((state: RootState) => state.resume.resumeData.experience);
  const isLoadingAI = useSelector((state: RootState) => state.resume.isLoadingAI);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [currentExperience, setCurrentExperience] = useState<{
    id: string;
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    responsibilitiesInput: string;
  }>({
    id: '', company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: [], responsibilitiesInput: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic classes
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

  const listItemBg = isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-white border-gray-200 shadow-md';
  const listItemTitleColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const listItemSubtextColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const listItemDateColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const listItemDescColor = isDark ? 'text-gray-400' : 'text-gray-700'; // For list items in description
  const emptyStateBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const emptyStateText = isDark ? 'text-gray-400' : 'text-gray-500';

  const actionButtonClass = (colorClass: string) => `p-2 rounded-full transition-colors duration-200
                                                  ${isDark ? `text-${colorClass}-400 hover:bg-gray-700` : `text-${colorClass}-600 hover:bg-${colorClass}-100`}`;
  const primaryButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                              ${isDark ? 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`;
  const secondaryButtonClass = `inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200
                                ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-500'}`;
  const aiButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                         ${isDark ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-sky-500 text-white hover:bg-sky-600'}
                         focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-sky-700 focus:ring-offset-gray-800' : 'focus:ring-sky-500 focus:ring-offset-white'}`;


  // Helper to sync textarea input with responsibilities array
  const syncResponsibilities = (input: string) => {
    const responsibilitiesArray = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    setCurrentExperience(prev => ({
      ...prev,
      responsibilitiesInput: input,
      responsibilities: responsibilitiesArray
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'responsibilitiesInput') {
      syncResponsibilities(value);
    } else {
      setCurrentExperience((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExperience.company || !currentExperience.jobTitle || !currentExperience.startDate) {
      toast.error('Company, Job Title, and Start Date are required.', {
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
      return;
    }

    if (isEditing) {
      dispatch(updateExperience({ ...currentExperience, responsibilities: currentExperience.responsibilities }));
      setIsEditing(false);
    } else {
      dispatch(addExperience({ ...currentExperience,  responsibilities: currentExperience.responsibilities }));
    }
    // Reset form
    setCurrentExperience({ id: '', company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: [], responsibilitiesInput: '' });
  };

  const handleEdit = (experience: typeof experienceEntries[0]) => {
    setCurrentExperience({
      ...experience,
      responsibilitiesInput: experience.responsibilities.join('\n'), // Convert array back to string for textarea
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentExperience({ id: '', company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: [], responsibilitiesInput: '' });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    dispatch(removeExperience(id));
    if (currentExperience.id === id) { // If deleting the item currently being edited
        handleCancelEdit();
    }
  };

  const handleAIGenerateResponsibilities = async () => {
    // We will pass the existing responsibilities as context to the AI for refinement or expansion
    const existingResponsibilitiesText = currentExperience.responsibilitiesInput.trim();
    const jobTitle = currentExperience.jobTitle.trim();
    const company = currentExperience.company.trim();

    if (!jobTitle || !company) {
      toast.error('Please enter Job Title and Company to generate responsibilities.', {
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
      return;
    }

    dispatch(setAILoading(true));
    toast.loading('Generating responsibilities with AI...', {
        id: 'ai-gen-exp',
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
    });

    try {
      const response = await api.post('/resumeApi/generate-responsibilities', { // Adjust API endpoint name if needed
        jobTitle: jobTitle,
        company: company,
        existingResponsibilities: existingResponsibilitiesText, // Pass existing text as context
      });

      const generatedResponsibilities = response.data.enhancedResponsibilities; // Assuming the API returns this
      
      // Combine existing and new, then deduplicate and update state
      const combinedResponsibilities = [
        ...currentExperience.responsibilities, // Keep current parsed responsibilities
        ...generatedResponsibilities.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)
      ];

      const newResponsibilitiesInput = Array.from(new Set(combinedResponsibilities)).join('\n'); // Deduplicate

      setCurrentExperience(prev => ({
        ...prev,
        responsibilitiesInput: newResponsibilitiesInput,
        responsibilities: newResponsibilitiesInput.split('\n').filter(Boolean),
      }));

      toast.success('AI responsibilities generated!', {
          id: 'ai-gen-exp',
          style: {
            background: isDark ? '#333' : '#fff',
            color: isDark ? '#fff' : '#333',
          },
      });
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate responsibilities.';
      dispatch(setAIError(errorMessage));
      toast.error(errorMessage, {
          id: 'ai-gen-exp',
          style: {
            background: isDark ? '#333' : '#fff',
            color: isDark ? '#fff' : '#333',
          },
      });
    } finally {
      dispatch(setAILoading(false));
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Work Experience</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Detail your professional history, starting with your most recent role.
        </p>
      </div>

      {/* Form to Add/Edit Experience */}
      <motion.form
        onSubmit={handleAddOrUpdate}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-4 ${formSectionBg}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>
          {isEditing ? 'Edit Experience Entry' : 'Add New Experience'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className={`block text-sm font-medium mb-1 ${labelColor}`}>Company Name</label>
            <motion.input type="text" id="company" name="company" value={currentExperience.company} onChange={handleChange} required
              placeholder="e.g., Tech Solutions Inc."
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="jobTitle" className={`block text-sm font-medium mb-1 ${labelColor}`}>Job Title</label>
            <motion.input type="text" id="jobTitle" name="jobTitle" value={currentExperience.jobTitle} onChange={handleChange} required
              placeholder="e.g., Software Engineer"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="startDate" className={`block text-sm font-medium mb-1 ${labelColor}`}>Start Date</label>
            <motion.input type="month" id="startDate" name="startDate" value={currentExperience.startDate} onChange={handleChange} required
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="endDate" className={`block text-sm font-medium mb-1 ${labelColor}`}>End Date (or Present)</label>
            <motion.input type="month" id="endDate" name="endDate" value={currentExperience.endDate} onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
            <p className={`mt-1 text-xs ${infoTextColor}`}>Leave blank if currently working here.</p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="responsibilitiesInput" className={`block text-sm font-medium mb-1 ${labelColor}`}>Key Responsibilities & Achievements</label>
            <motion.textarea id="responsibilitiesInput" name="responsibilitiesInput" value={currentExperience.responsibilitiesInput} onChange={handleChange} rows={6}
              placeholder="List key responsibilities and measurable achievements, one per line. Click 'AI Generate' for suggestions!"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm resize-y transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            ></motion.textarea>
            <p className={`mt-1 text-xs ${infoTextColor}`}>
              Each line will be treated as a separate bullet point.
            </p>
            <motion.button
              type="button"
              onClick={handleAIGenerateResponsibilities}
              disabled={isLoadingAI}
              className={`mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${aiButtonClass}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaMagic className="mr-2" /> {isLoadingAI ? 'Generating...' : 'AI Generate Bullet Points'}
            </motion.button>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {isEditing && (
            <motion.button
              type="button"
              onClick={handleCancelEdit}
              className={secondaryButtonClass}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTimes className="mr-2" /> Cancel
            </motion.button>
          )}
          <motion.button
            type="submit"
            className={primaryButtonClass}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? <><FaSave className="mr-2" /> Update Entry</> : <><FaPlus className="mr-2" /> Add Experience</>}
          </motion.button>
        </div>
      </motion.form>

      {/* List of Added Experience Entries */}
      <div className="space-y-4">
        {experienceEntries.length === 0 ? (
          <p className={`text-center py-8 border border-dashed rounded-lg transition-colors duration-300 ${emptyStateBg} ${emptyStateText}`}>
            No work experience added yet. Use the form above to add your first one!
          </p>
        ) : (
          <AnimatePresence>
            {experienceEntries.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-lg flex justify-between items-start transition-colors duration-300 ${listItemBg}`}
              >
                <div>
                  <h4 className={`text-lg font-bold ${listItemTitleColor}`}>{exp.jobTitle} at {exp.company}</h4>
                  <p className={`text-sm mt-1 ${listItemDateColor}`}>{exp.startDate} - {exp.endDate || 'Present'}</p>
                  {exp.responsibilities.length > 0 && (
                    <ul className={`list-disc list-inside text-sm mt-3 space-y-1 ${listItemDescColor}`}>
                      {exp.responsibilities.map((res, i) => (
                        <li key={i}>{res}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(exp)}
                    className={actionButtonClass('blue')}
                    title="Edit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(exp.id)}
                    className={actionButtonClass('red')}
                    title="Delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrashAlt />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Experience;