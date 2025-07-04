// src/components/ResumeEditor/AchievementsActivities.tsx
'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  addAchievementActivity,
  updateAchievementActivity,
  removeAchievementActivity,
  AchievementActivity,
} from '@/redux/slices/resumeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const AchievementsActivities = () => {
  const dispatch: AppDispatch = useDispatch();
  const achievementsActivities = useSelector(
    (state: RootState) => state.resume.resumeData.achievementsActivities
  );
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDescription, setCurrentDescription] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');

  // Dynamic classes
  const formSectionBg = isDark
    ? 'bg-gray-800/80 border-gray-700 shadow-xl backdrop-blur-sm'
    : 'bg-gray-50 border-gray-200 shadow-sm';
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputTextColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputPlaceholderColor = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const inputFocusRing = isDark
    ? 'focus:ring-red-700 focus:border-red-700'
    : 'focus:ring-red-500 focus:border-red-500';
  const headerColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subHeaderColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const buttonClass = (bgColor: string) =>
    `px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-white ${bgColor}`;
  const editButtonClass = isDark
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-blue-500 hover:bg-blue-600';
  const deleteButtonClass = isDark
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-red-500 hover:bg-red-600';
  const addButtonClass = isDark
    ? 'bg-green-600 hover:bg-green-700'
    : 'bg-green-500 hover:bg-green-600';
  const saveButtonClass = isDark
    ? 'bg-purple-600 hover:bg-purple-700'
    : 'bg-purple-500 hover:bg-purple-600';

  const handleAddActivity = () => {
    if (newActivityDescription.trim()) {
      dispatch(addAchievementActivity({ description: newActivityDescription.trim() }));
      setNewActivityDescription('');
    }
  };

  const handleEdit = (item: AchievementActivity) => {
    setEditingId(item.id);
    setCurrentDescription(item.description);
  };

  const handleSaveEdit = () => {
    if (editingId && currentDescription.trim()) {
      dispatch(updateAchievementActivity({ id: editingId, description: currentDescription.trim() }));
      setEditingId(null);
      setCurrentDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentDescription('');
  };

  const handleDelete = (id: string) => {
    dispatch(removeAchievementActivity(id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Achievements & Activities</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Highlight your accomplishments, awards, and extracurricular activities.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-5 ${formSectionBg}`}
      >
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>Your Activities</h3>
        <ul className="space-y-3">
          <AnimatePresence>
            {achievementsActivities.length === 0 && (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-md border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-100'} ${inputTextColor}`}
              >
                No achievements or activities added yet.
              </motion.li>
            )}
            {achievementsActivities.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`p-4 rounded-md border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-100'} flex items-center justify-between gap-4 flex-wrap`}
              >
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={currentDescription}
                      onChange={(e) => setCurrentDescription(e.target.value)}
                      className={`flex-grow p-2 rounded-md border ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
                    />
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleSaveEdit}
                        className={buttonClass(saveButtonClass)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSave />
                      </motion.button>
                      <motion.button
                        onClick={handleCancelEdit}
                        className={buttonClass(deleteButtonClass)} // Using delete color for cancel
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTimes />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={`flex-grow ${inputTextColor}`}>{item.description}</p>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleEdit(item)}
                        className={buttonClass(editButtonClass)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(item.id)}
                        className={buttonClass(deleteButtonClass)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="mt-6 border-t pt-4">
          <label htmlFor="newActivity" className={`block text-sm font-medium mb-1 ${labelColor}`}>
            Add New Achievement or Activity
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="newActivity"
              value={newActivityDescription}
              onChange={(e) => setNewActivityDescription(e.target.value)}
              placeholder="e.g., 1st place in National Coding Competition"
              className={`flex-grow p-2 rounded-md border ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            />
            <motion.button
              onClick={handleAddActivity}
              className={buttonClass(addButtonClass)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="mr-1" /> Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AchievementsActivities;