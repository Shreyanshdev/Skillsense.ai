// src/components/ResumeEditor/Projects.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  addProject,
  updateProject,
  removeProject,
  ProjectEntry,
  setAILoading,
  setAIError,
} from '@/redux/slices/resumeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLink, FaGithub, FaExternalLinkAlt, FaMagic } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import api from '@/services/api'; // Assuming your API service is located here

// Define a type for the project state in the form
interface ProjectFormState {
  id: string;
  name: string;
  githubLink: string;
  liveLink: string;
  bulletPointsInput: string; // Combined string for textarea
}

const Projects = () => {
  const dispatch: AppDispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.resume.resumeData.projects);
  const isLoadingAI = useSelector((state: RootState) => state.resume.isLoadingAI);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [currentProject, setCurrentProject] = useState<ProjectFormState>({
    id: '', name: '', githubLink: '', liveLink: '', bulletPointsInput: '',
  });
  const [isEditing, setIsEditing] = useState(false); // New state to track editing mode

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
  const actionButtonClass = (colorClass: string) => `p-2 rounded-full transition-colors duration-200
                                                  ${isDark ? `text-${colorClass}-400 hover:bg-gray-700` : `text-${colorClass}-600 hover:bg-${colorClass}-100`}`; // Reverted to experience-like buttons
  const primaryButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                              ${isDark ? 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-700' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`;
  const secondaryButtonClass = `inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200
                                ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-red-500'}`;
  const aiButtonClass = `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                         ${isDark ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-sky-500 text-white hover:bg-sky-600'}
                         focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-sky-700 focus:ring-offset-gray-800' : 'focus:ring-sky-500 focus:ring-offset-white'}`;
  const listItemBg = isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-white border-gray-200 shadow-md';
  const listItemTitleColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const listItemSubtextColor = isDark ? 'text-gray-300' : 'text-gray-700'; // For links etc.
  const listItemDescColor = isDark ? 'text-gray-400' : 'text-gray-700'; // For list items in description
  const emptyStateBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const emptyStateText = isDark ? 'text-gray-400' : 'text-gray-500';


  // Helper to parse textarea content into an array of bullet points
  const parseBulletPoints = (input: string): string[] => {
    return input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateProject = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!currentProject.name.trim()) {
      toast.error('Project name cannot be empty.', { style: { background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#333' } });
      return;
    }

    const projectDataForRedux: ProjectEntry = {
      id: currentProject.id || uuidv4(),
      name: currentProject.name,
      githubLink: currentProject.githubLink,
      liveLink: currentProject.liveLink,
      bulletPoints: parseBulletPoints(currentProject.bulletPointsInput),
    };

    if (isEditing) {
      dispatch(updateProject(projectDataForRedux));
      setIsEditing(false);
    } else {
      dispatch(addProject(projectDataForRedux));
    }
    // Reset form
    setCurrentProject({ id: '', name: '', githubLink: '', liveLink: '', bulletPointsInput: '' });
  };

  const handleEditProject = (project: ProjectEntry) => {
    setCurrentProject({
      id: project.id,
      name: project.name,
      githubLink: project.githubLink || '',
      liveLink: project.liveLink || '',
      bulletPointsInput: project.bulletPoints?.join('\n') || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentProject({ id: '', name: '', githubLink: '', liveLink: '', bulletPointsInput: '' });
    setIsEditing(false);
  };

  const handleDeleteProject = (id: string) => {
    dispatch(removeProject(id));
    if (currentProject.id === id) { // If deleting the item currently being edited
        handleCancelEdit();
    }
  };

  // --- AI Generation for Project Bullet Points ---
  const handleAIGenerateProjectBulletPoints = async () => {
    if (!currentProject.name.trim()) {
      toast.error('Please enter a Project Name to generate bullet points.', {
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
      return;
    }

    dispatch(setAILoading(true));
    toast.loading('Generating project details with AI...', {
      id: 'ai-gen-project',
      style: {
        background: isDark ? '#333' : '#fff',
        color: isDark ? '#fff' : '#333',
      },
    });

    try {
      const response = await api.post('/resumeApi/generate-project-bullets', {
        projectName: currentProject.name,
        existingBulletPoints: currentProject.bulletPointsInput || '',
        githubLink: currentProject.githubLink || '',
        liveLink: currentProject.liveLink || '',
      });

      const generatedBulletsRaw = response.data.enhancedProjectBullets;
      const generatedBulletsArray = parseBulletPoints(generatedBulletsRaw);

      // Combine existing (from parsed input) and new, then deduplicate
      const combinedBullets = Array.from(new Set([
        ...parseBulletPoints(currentProject.bulletPointsInput),
        ...generatedBulletsArray
      ]));

      const updatedBulletPointsInput = combinedBullets.join('\n');

      setCurrentProject(prev => ({ ...prev, bulletPointsInput: updatedBulletPointsInput }));
      
      toast.success('AI project details generated!', {
        id: 'ai-gen-project',
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
    } catch (error: any) {
      console.error('AI Project Generation Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate project details.';
      dispatch(setAIError(errorMessage));
      toast.error(errorMessage, {
        id: 'ai-gen-project',
        style: {
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
      });
    } finally {
      dispatch(setAILoading(false));
    }
  };
  // --- END AI Generation ---


  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Projects</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Showcase your key projects with details and links.
        </p>
      </div>

      {/* Project Add/Edit Form */}
      <motion.form
        onSubmit={handleAddOrUpdateProject} // Use form onSubmit for submission
        className={`p-6 rounded-lg transition-colors duration-300 space-y-4 ${formSectionBg}`} // Changed to space-y-4 for consistency
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="projectName" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="projectName"
              name="name"
              value={currentProject.name}
              onChange={handleChange}
              required // Added required
              placeholder="e.g., eCommerce Platform"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            />
          </div>
          <div>
            <label htmlFor="githubLink" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              GitHub Link (Optional)
            </label>
            <input
              type="url"
              id="githubLink"
              name="githubLink"
              value={currentProject.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/user/repo"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            />
          </div>
          <div>
            <label htmlFor="liveLink" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Live Demo Link (Optional)
            </label>
            <input
              type="url"
              id="liveLink"
              name="liveLink"
              value={currentProject.liveLink}
              onChange={handleChange}
              placeholder="https://your-project-demo.com"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            />
          </div>
        </div>

        {/* Project Details Textarea (Now always visible and integrated) */}
        <div className="md:col-span-2"> {/* This div ensures it spans full width on md screens */}
          <label htmlFor="bulletPointsInput" className={`block text-sm font-medium mb-1 ${labelColor}`}>Project Details & Achievements</label>
          <motion.textarea
            id="bulletPointsInput"
            name="bulletPointsInput"
            value={currentProject.bulletPointsInput}
            onChange={handleChange}
            rows={6}
            placeholder="Describe your project: its purpose, technologies used, your role, and key accomplishments. Each line will be a separate bullet point."
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm resize-y transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
            whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
          ></motion.textarea>
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Each line will be treated as a separate bullet point on the resume.
          </p>
          <motion.button
            type="button"
            onClick={handleAIGenerateProjectBulletPoints}
            disabled={isLoadingAI || !currentProject.name.trim()}
            className={`mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${aiButtonClass}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaMagic className="mr-2" /> {isLoadingAI ? 'Generating...' : 'AI Generate Bullet Points'}
          </motion.button>
        </div>

        <div className="flex justify-end space-x-2"> {/* Removed pt-4 border-t-dashed, as this form is a single unit */}
          {isEditing && (
            <motion.button
              type="button"
              onClick={handleCancelEdit}
              className={secondaryButtonClass} // Using unified button classes
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTimes className="mr-2" /> Cancel
            </motion.button>
          )}
          <motion.button
            type="submit" // Changed to type="submit" for form submission
            className={primaryButtonClass} // Using unified button classes
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? <><FaSave className="mr-2" /> Update Project</> : <><FaPlus className="mr-2" /> Add Project</>}
          </motion.button>
        </div>
      </motion.form>

      {/* List of Projects */}
      <div className="space-y-4 pt-4 border-t"> {/* Added pt-4 border-t for section separation */}
        <h3 className={`text-xl font-semibold mb-4 ${headerColor}`}>Your Projects</h3>
        {projects.length === 0 ? (
          <p className={`text-center py-8 border border-dashed rounded-lg transition-colors duration-300 ${emptyStateBg} ${emptyStateText}`}>
            No projects added yet. Add your first project above.
          </p>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`p-6 rounded-lg flex justify-between items-start transition-colors duration-300 ${listItemBg}`} // Adjusted padding and background for list items
                >
                  <div>
                    <h4 className={`text-lg font-bold ${listItemTitleColor}`}>{project.name}</h4>
                    <div className="flex flex-wrap gap-2 text-sm mt-1">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline ${listItemSubtextColor}`}>
                          <FaGithub /> GitHub
                        </a>
                      )}
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline ${listItemSubtextColor}`}>
                          <FaExternalLinkAlt /> Live Demo
                        </a>
                      )}
                    </div>
                    {/* Display existing bullet points from the stored array */}
                    {project.bulletPoints && project.bulletPoints.length > 0 && (
                      <ul className={`list-disc list-inside text-sm mt-3 space-y-1 ${listItemDescColor}`}>
                        {project.bulletPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex space-x-2"> {/* Changed to space-x-2 for experience-like buttons */}
                    <motion.button
                      onClick={() => handleEditProject(project)}
                      className={actionButtonClass('blue')}
                      title="Edit"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteProject(project.id)}
                      className={actionButtonClass('red')}
                      title="Delete"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;