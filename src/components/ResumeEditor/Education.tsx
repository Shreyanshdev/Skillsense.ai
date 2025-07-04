// src/components/ResumeEditor/Education.tsx
'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { addEducation, updateEducation, removeEducation } from '@/redux/slices/resumeSlice';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Education = () => {
  const dispatch: AppDispatch = useDispatch();
  const educationEntries = useSelector((state: RootState) => state.resume.resumeData.education);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [currentEducation, setCurrentEducation] = useState({
    id: '', institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '',
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
  const listItemDescColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const emptyStateBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const emptyStateText = isDark ? 'text-gray-400' : 'text-gray-500';

  const actionButtonClass = (colorClass: string) => `p-2 rounded-full transition-colors duration-200 
                                                  ${isDark ? `text-${colorClass}-400 hover:bg-gray-700` : `text-${colorClass}-600 hover:bg-${colorClass}-100`}`;
  const primaryButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200 
                              ${isDark ? 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`;
  const secondaryButtonClass = `inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200 
                                ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-500'}`;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEducation.institution || !currentEducation.degree || !currentEducation.startDate) {
      toast.error('Institution, Degree, and Start Date are required.', {
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
      return;
    }

    if (isEditing) {
      dispatch(updateEducation(currentEducation));
      setIsEditing(false);
    } else {
      dispatch(addEducation({ ...currentEducation }));
    }
    // Reset form
    setCurrentEducation({ id: '', institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' });
  };

  const handleEdit = (education: typeof currentEducation) => {
    setCurrentEducation(education);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentEducation({ id: '', institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    dispatch(removeEducation(id));
    if (currentEducation.id === id) { // If deleting the item currently being edited
        handleCancelEdit();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Education</h2>
        <p className={`text-md ${subHeaderColor}`}>
          List your academic achievements and educational background.
        </p>
      </div>

      {/* Form to Add/Edit Education */}
      <motion.form
        onSubmit={handleAddOrUpdate}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-4 ${formSectionBg}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>
          {isEditing ? 'Edit Education Entry' : 'Add New Education'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="institution" className={`block text-sm font-medium mb-1 ${labelColor}`}>Institution Name</label>
            <motion.input type="text" id="institution" name="institution" value={currentEducation.institution} onChange={handleChange} required
              placeholder="e.g., Harvard University"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="degree" className={`block text-sm font-medium mb-1 ${labelColor}`}>Degree/Qualification</label>
            <motion.input type="text" id="degree" name="degree" value={currentEducation.degree} onChange={handleChange} required
              placeholder="e.g., Master of Science"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="fieldOfStudy" className={`block text-sm font-medium mb-1 ${labelColor}`}>Field of Study</label>
            <motion.input type="text" id="fieldOfStudy" name="fieldOfStudy" value={currentEducation.fieldOfStudy} onChange={handleChange}
              placeholder="e.g., Computer Science"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="startDate" className={`block text-sm font-medium mb-1 ${labelColor}`}>Start Date</label>
            <motion.input type="month" id="startDate" name="startDate" value={currentEducation.startDate} onChange={handleChange} required
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="endDate" className={`block text-sm font-medium mb-1 ${labelColor}`}>End Date (or Expected)</label>
            <motion.input type="month" id="endDate" name="endDate" value={currentEducation.endDate} onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
             <p className={`mt-1 text-xs ${infoTextColor}`}>Leave blank if currently pursuing.</p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className={`block text-sm font-medium mb-1 ${labelColor}`}>Description/Achievements (Optional)</label>
            <motion.textarea id="description" name="description" value={currentEducation.description} onChange={handleChange} rows={3}
              placeholder="e.g., Dean's List, Relevant coursework, Thesis topic."
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm resize-y transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            ></motion.textarea>
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
            {isEditing ? <><FaSave className="mr-2" /> Update Entry</> : <><FaPlus className="mr-2" /> Add Education</>}
          </motion.button>
        </div>
      </motion.form>

      {/* List of Added Education Entries */}
      <div className="space-y-4">
        {educationEntries.length === 0 ? (
          <p className={`text-center py-8 border border-dashed rounded-lg transition-colors duration-300 ${emptyStateBg} ${emptyStateText}`}>
            No education entries added yet. Use the form above to add your first one!
          </p>
        ) : (
          <AnimatePresence>
            {educationEntries.map((edu) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-lg flex justify-between items-start transition-colors duration-300 ${listItemBg}`}
              >
                <div>
                  <h4 className={`text-lg font-bold ${listItemTitleColor}`}>{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p className={`text-md ${listItemSubtextColor}`}>{edu.institution}</p>
                  <p className={`text-sm mt-1 ${listItemDateColor}`}>{edu.startDate} - {edu.endDate || 'Present'}</p>
                  {edu.description && <p className={`text-sm mt-2 whitespace-pre-wrap ${listItemDescColor}`}>{edu.description}</p>}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit({ ...edu, description: edu.description || '' })}
                    className={actionButtonClass('blue')}
                    title="Edit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(edu.id)}
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

export default Education;