// src/components/ResumeEditor/Skills.tsx
'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { addSkill, updateSkill, removeSkill, Skill } from '@/redux/slices/resumeSlice'; // Import Skill type
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaTrashAlt, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Skills = () => {
  const dispatch: AppDispatch = useDispatch();
  const skills = useSelector((state: RootState) => state.resume.resumeData.skills);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [currentSkill, setCurrentSkill] = useState<Skill>({ id: '', name: '', level: undefined, category: undefined }); // Initialize with category
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic classes (no changes here, they are fine)
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

  const listItemBg = isDark ? 'bg-red-700/30 text-red-100' : 'bg-red-100 text-red-800'; // Skill tag style
  const emptyStateBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const emptyStateText = isDark ? 'text-gray-400' : 'text-gray-500';

  const primaryButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                              ${isDark ? 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`;
  const secondaryButtonClass = `inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200
                                ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-500'}`;
  const skillTagLevelBg = isDark ? 'bg-red-800/50' : 'bg-red-200';
  const skillTagActionColor = isDark ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800';

  // Common categories for selection
  const commonCategories = ['Frontend', 'Backend', 'Databases', 'Tools', 'Languages', 'Cloud', 'Mobile', 'Other'];


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSkill((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSkill.name.trim()) {
      toast.error('Skill name cannot be empty.', {
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
      return;
    }
    // Check for duplicates (name + category to allow same skill in different categories)
    if (!isEditing) {
      const isDuplicate = skills.some(
        (skill) =>
          skill.name.toLowerCase() === currentSkill.name.trim().toLowerCase() &&
          (skill.category || '').toLowerCase() === (currentSkill.category || '').toLowerCase()
      );
      if (isDuplicate) {
        toast.error('This skill already exists in this category.', {
          style: {
            background: isDark ? '#333' : '#fff',
            color: isDark ? '#fff' : '#333',
          },
        });
        return;
      }
    }

    if (isEditing) {
      dispatch(updateSkill(currentSkill));
      setIsEditing(false);
    } else {
      // Generate ID for new skill
      dispatch(addSkill({ ...currentSkill}));
    }
    // Reset form
    setCurrentSkill({ id: '', name: '', level: undefined, category: undefined });
  };

  const handleEdit = (skill: Skill) => {
    setCurrentSkill({ ...skill, level: skill.level || undefined, category: skill.category || undefined });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentSkill({ id: '', name: '', level: undefined, category: undefined });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    dispatch(removeSkill(id));
    if (currentSkill.id === id) { // If deleting the item currently being edited
        handleCancelEdit();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Skills</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Highlight your most relevant technical and soft skills, categorized for clarity.
        </p>
      </div>

      {/* Form to Add/Edit Skill */}
      <motion.form
        onSubmit={handleAddOrUpdate}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-4 ${formSectionBg}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>
          {isEditing ? 'Edit Skill' : 'Add New Skill'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to 3 columns */}
          <div>
            <label htmlFor="skillName" className={`block text-sm font-medium mb-1 ${labelColor}`}>Skill Name</label>
            <motion.input type="text" id="skillName" name="name" value={currentSkill.name || ''} onChange={handleChange} required
              placeholder="e.g., JavaScript, React"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
          <div>
            <label htmlFor="skillCategory" className={`block text-sm font-medium mb-1 ${labelColor}`}>Category</label>
            <motion.select id="skillCategory" name="category" value={currentSkill.category || ''} onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            >
              <option value="" className={inputBg}>Select Category</option>
              {commonCategories.map(cat => (
                <option key={cat} value={cat} className={inputBg}>{cat}</option>
              ))}
              {/* Allow custom category if not in commonCategories and it's set */}
              {currentSkill.category && !commonCategories.includes(currentSkill.category) && (
                <option value={currentSkill.category}>{currentSkill.category} (Custom)</option>
              )}
            </motion.select>
          </div>
          <div>
            <label htmlFor="skillLevel" className={`block text-sm font-medium mb-1 ${labelColor}`}>Proficiency Level (Optional)</label>
            <motion.select id="skillLevel" name="level" value={currentSkill.level || ''} onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            >
              <option value="" className={inputBg}>Select Level</option>
              <option value="Beginner" className={inputBg}>Beginner</option>
              <option value="Intermediate" className={inputBg}>Intermediate</option>
              <option value="Advanced" className={inputBg}>Advanced</option>
              <option value="Expert" className={inputBg}>Expert</option>
            </motion.select>
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
            {isEditing ? <><FaSave className="mr-2" /> Update Skill</> : <><FaPlus className="mr-2" /> Add Skill</>}
          </motion.button>
        </div>
      </motion.form>

      {/* List of Added Skills (Grouped by Category) */}
      <div className="space-y-4">
        {skills.length === 0 ? (
          <p className={`text-center py-8 border border-dashed rounded-lg transition-colors duration-300 ${emptyStateBg} ${emptyStateText}`}>
            No skills added yet. Add your key skills using the form above.
          </p>
        ) : (
          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Group skills by category */}
            {Object.entries(
              skills.reduce((acc: { [key: string]: Skill[] }, skill) => {
                const category = skill.category || 'Uncategorized';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(skill);
                return acc;
              }, {})
            ).sort(([catA], [catB]) => catA.localeCompare(catB)) // Sort categories alphabetically
            .map(([category, skillsInCategory]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h4 className={`text-lg font-semibold mb-2 ${labelColor}`}>{category}</h4>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {skillsInCategory.map((skill) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3 }}
                        className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-full shadow-sm ${listItemBg}`}
                      >
                        <span className="mr-2">{skill.name}</span>
                        {skill.level && (
                            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${skillTagLevelBg}`}>
                                {skill.level}
                            </span>
                        )}
                        <motion.button
                          onClick={() => handleEdit(skill)}
                          className={`ml-1 p-1 transition-colors ${skillTagActionColor}`}
                          title="Edit Skill"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaEdit size={12} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(skill.id)}
                          className={`ml-1 p-1 transition-colors ${skillTagActionColor}`}
                          title="Remove Skill"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTimes size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;