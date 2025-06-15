// src/components/FocusTab/FocusTab.tsx
import React, { ChangeEvent, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaToggleOn,
  FaToggleOff,
  FaBriefcase,
  FaTools,
  FaUserGraduate,
  FaSpinner,
  FaCheckCircle,
  FaRegTimesCircle,
  FaPlusCircle,
  FaInfoCircle,
  FaStar,
  FaRegStar,
  FaTimesCircle,
} from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import debounce from 'lodash.debounce';

import SectionWrapper from '@/components/common/SectionWrapper';
import ProficiencySelector from '@/components/common/ProficiencySelector';
import { RootState } from '@/redux/store';
import { EXPERIENCE_LEVELS, SelectedSkill, PROFICIENCY_LEVELS } from '@/constants';

interface FocusTabProps {
  // State
  isResumeOnlyAssessment: boolean;
  roleInput: string;
  selectedRole: string;
  roleSuggestions: string[];
  isRoleLoading: boolean;
  selectedSkills: SelectedSkill[];
  skillSuggestions: string[];
  isSkillLoading: boolean;
  manualSkillInput: string;
  userPrompt: string;
  selectedExperience: string;
  editingProficiency: string | null;
  error: string;

  // Handlers
  handleResumeOnlyToggle: () => void;
  setRoleInput: (value: string) => void;
  setSelectedRole: (value: string) => void;
  setRoleSuggestions: (suggestions: string[]) => void;
  setIsRoleLoading: (isLoading: boolean) => void;
  setSelectedSkills: (
    skills: SelectedSkill[] | ((prev: SelectedSkill[]) => SelectedSkill[])
  ) => void;
  setSkillSuggestions: (
    suggestions: string[] | ((prev: string[]) => string[])
  ) => void;
  setIsSkillLoading: (isLoading: boolean) => void;
  setManualSkillInput: (value: string) => void;
  setUserPrompt: (value: string) => void;
  handleExperienceSelect: (expId: string) => void;
  setEditingProficiency: (skillId: string | null) => void;
  handleProficiencySelect: (skillId: string, levelId: string) => void;
  setError: (error: string) => void;

  // Styling helpers
  inputBaseClass: string;
  pillButtonClass: (isSelected: boolean) => string;
  selectedSkillPillClass: string;
  skillSuggestionPillClass: string;
  confirmedRolePillClass: string;
}

const FocusTab: React.FC<FocusTabProps> = ({
  isResumeOnlyAssessment,
  roleInput,
  selectedRole,
  roleSuggestions,
  isRoleLoading,
  selectedSkills,
  skillSuggestions,
  isSkillLoading,
  manualSkillInput,
  userPrompt,
  selectedExperience,
  editingProficiency,
  error,

  handleResumeOnlyToggle,
  setRoleInput,
  setSelectedRole,
  setRoleSuggestions,
  setIsRoleLoading,
  setSelectedSkills,
  setSkillSuggestions,
  setIsSkillLoading,
  setManualSkillInput,
  setUserPrompt,
  handleExperienceSelect,
  setEditingProficiency,
  handleProficiencySelect,
  setError,

  inputBaseClass,
  pillButtonClass,
  selectedSkillPillClass,
  skillSuggestionPillClass,
    confirmedRolePillClass,

}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  // Debounced fetch for roles
  const fetchRoleSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setRoleSuggestions([]);
          setIsRoleLoading(false);
          return;
        }
        setIsRoleLoading(true);
        try {
          const res = await fetch(`/api/suggest-roles?query=${encodeURIComponent(query)}`);
          const data = await res.json();
          setRoleSuggestions(data.suggestions || []);
        } catch {
          setRoleSuggestions([]);
        } finally {
          setIsRoleLoading(false);
        }
      }, 500),
    [setRoleSuggestions, setIsRoleLoading]
  );

  useEffect(() => {
    if (!isResumeOnlyAssessment && roleInput) {
      fetchRoleSuggestions(roleInput);
    } else {
      fetchRoleSuggestions.cancel();
      setRoleSuggestions([]);
    }
    return () => {
      fetchRoleSuggestions.cancel();
    };
  }, [roleInput, isResumeOnlyAssessment, fetchRoleSuggestions, setRoleSuggestions]);

  // Debounced fetch for skills
  const fetchSkillSuggestions = useMemo(
    () =>
      debounce(async (role: string, currentIds: string[]) => {
        if (!role) {
          setSkillSuggestions([]);
          setIsSkillLoading(false);
          return;
        }
        setIsSkillLoading(true);
        try {
          const res = await fetch('/api/suggest-skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, selectedSkills: currentIds }),
          });
          const data = await res.json();
          const filtered = (data.suggestions || []).filter(
            (s: string) => !currentIds.includes(s.toLowerCase().replace(/\W/g, ''))
          );
          setSkillSuggestions(filtered);
        } catch {
          setSkillSuggestions([]);
        } finally {
          setIsSkillLoading(false);
        }
      }, 500),
    [setSkillSuggestions, setIsSkillLoading]
  );

  useEffect(() => {
    if (!isResumeOnlyAssessment && selectedRole) {
      fetchSkillSuggestions(selectedRole, selectedSkills.map(s => s.id));
    } else {
      fetchSkillSuggestions.cancel();
      setSkillSuggestions([]);
    }
    return () => {
      fetchSkillSuggestions.cancel();
    };
  }, [selectedRole, selectedSkills, isResumeOnlyAssessment, fetchSkillSuggestions, setSkillSuggestions]);

  const handleRoleSuggestionSelect = (role: string) => {
    setRoleInput(role);
    setSelectedRole(role);
    setRoleSuggestions([]);
    setError('');
  };

  const handleAddSkill = (skillName: string) => {
    const id = skillName.toLowerCase().replace(/\W/g, '');
    if (!selectedSkills.some(s => s.id === id)) {
      setSelectedSkills(prev => [...prev, { id, name: skillName, level: null }]);
      setEditingProficiency(id);
      fetchSkillSuggestions(selectedRole || roleInput, [...selectedSkills.map(s => s.id), id]);
    }
    setManualSkillInput('');
    setSkillSuggestions(prev => prev.filter(s => s !== skillName));
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
    if (editingProficiency === skillId) setEditingProficiency(null);
    fetchSkillSuggestions(
      selectedRole || roleInput,
      selectedSkills.filter(s => s.id !== skillId).map(s => s.id)
    );
  };

  const handleRemoveRole = () => {
    setSelectedRole(''); // Clear the confirmed role
    setRoleInput(''); // Clear the input field so user can type again
    setRoleSuggestions([]); // Clear any old suggestions
     setSkillSuggestions([]); // Clear skill suggestions as role is removed
    setError(''); // Clear any role-related error
};

  return (
    <div>
      {/* Assessment Type */}
      <div className="mb-4">
      <SectionWrapper
        title="Assessment Type"
        icon={
          isResumeOnlyAssessment ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-500" />
        }
      >
        <p className={`mb-4 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose between a detailed assessment based on your profile or a quick evaluation based solely on your resume.
        </p>
        <div className="flex items-center space-x-3">
          <motion.button
            type="button"
            onClick={handleResumeOnlyToggle}
            className={`flex items-center space-x-2 mb-3 px-4 py-2 rounded-full font-medium transition-colors ${
              isResumeOnlyAssessment
                ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                : theme === 'dark'
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 active:bg-gray-400'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isResumeOnlyAssessment ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
            <span className="text-sm sm:text-base">
              {isResumeOnlyAssessment ? 'Resume Only Enabled' : 'Enable Resume Only Assessment'}
            </span>
          </motion.button>
          {!isResumeOnlyAssessment && (
            <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Disable to customize Role & Skills below
            </span>
          )}
        </div>
      </SectionWrapper>
      </div>

      {/* Target Role */}
      <div className="mb-9">
      <SectionWrapper title="Target Role" icon={<FaBriefcase className="text-sky-500" />} disabled={isResumeOnlyAssessment}>
                <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Type your target role or select from suggestions. <span className="text-red-500">*</span>
                </p>

                    <AnimatePresence mode="wait">
                         {selectedRole && !isResumeOnlyAssessment ? (
                            // --- Display Refined Confirmed Role Pill ---
                            <motion.div
                                 key="confirmed-role"
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 // Apply refined styling: flex, items-center, gap, padding, rounded, border, theme colors, limited width
                                 className={`${confirmedRolePillClass} flex items-center gap-3 p-3 rounded-lg border transition-colors duration-200 ${theme === 'dark' ? 'border-sky-700 bg-sky-900/30 text-sky-200' : 'border-sky-300 bg-sky-100/50 text-sky-800'} w-fit max-w-full`} // w-fit to wrap content, max-w-full for responsiveness
                            >
                                 {/* Icon Circle */}
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-sky-700 text-sky-200' : 'bg-sky-300 text-sky-800'}`}>
                                     <FaBriefcase size={16} /> {/* Use the briefcase icon */}
                                 </div>
                                {/* Role Name */}
                                <span className="font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">{selectedRole}</span> 
                                 {/* Remove Button/Icon */}
                                 <motion.button
                                    type="button"
                                    onClick={handleRemoveRole}
                                    className={`p-1 rounded-full transition-colors flex-shrink-0 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Remove confirmed role"
                                 >
                                     <FaRegTimesCircle className="text-red-500 text-lg" />
                                 </motion.button>
                            </motion.div>
                         ) : (
                            // --- Display Input Field and Suggestions ---
                             <motion.div
                                  key="role-input-suggestions"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="space-y-3" // Add spacing between input and suggestions
                             >
                                <input
                                    type="text"
                                    value={roleInput}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setRoleInput(e.target.value);
                                        setSelectedRole('');
                                        setError('');
                                    }}
                                    placeholder="e.g., Frontend Developer"
                                    className={`${inputBaseClass} ${isResumeOnlyAssessment ? 'cursor-not-allowed' : ''}`}
                                    disabled={isResumeOnlyAssessment}
                                />
                                <AnimatePresence>
                                    {isRoleLoading && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-sm flex items-center mt-2 ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>
                                            <FaSpinner className="animate-spin mr-2"/> Loading suggestions...
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                 {/* Role Suggestions Display */}
                                 {(roleSuggestions.length > 0 || (roleInput && !isRoleLoading && !selectedRole)) && !isResumeOnlyAssessment && (
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex flex-wrap gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-200/50 border border-gray-300'}`}>
                                         {roleSuggestions.map((role, index) => (
                                             <motion.button
                                                 key={index}
                                                 type="button"
                                                 onClick={() => handleRoleSuggestionSelect(role)}
                                                 className={pillButtonClass(false) + ' w-auto'}
                                                 whileHover={{ scale: 1.03 }}
                                                 whileTap={{ scale: 0.98 }}
                                             >
                                                 <span>{role}</span>
                                             </motion.button>
                                         ))}
                                         {/* Option to confirm typed input if no suggestions */}
                                         {roleInput && roleSuggestions.length === 0 && (
                                             <motion.button
                                                 key="confirm-typed-role"
                                                 type="button"
                                                 onClick={() => handleRoleSuggestionSelect(roleInput)}
                                                 className={pillButtonClass(false) + ' w-auto border-dashed'}
                                                 whileHover={{ scale: 1.03 }}
                                                 whileTap={{ scale: 0.98 }}
                                             >
                                                 <span>Confirm "{roleInput}"</span> <FaCheckCircle className="ml-2 text-green-500"/>
                                             </motion.button>
                                         )}
                                     </motion.div>
                                 )}
                             </motion.div>
                         )}
                    </AnimatePresence>
                

                 {/* Role Error Message */}
                 {error && error.includes('confirm your target role') && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`mt-2 text-xs flex items-center text-red-500`}><FaTimesCircle className="mr-1.5" />{error}</motion.p>
                 )}

            </SectionWrapper>
            </div> {/* End of mb-4 container */}


      {/* Key Skills */}
     
      <SectionWrapper title="Key Skills" icon={<FaTools className="text-sky-500" />} disabled={isResumeOnlyAssessment}>
        <p className={`mb-2  text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Select suggested skills or add manually. Indicate proficiency for selected skills if not Resume Only.
        </p>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-2">
            <h5 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Selected Skills
            </h5>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(skill => (
                <motion.div key={skill.id} className="flex flex-col items-start w-full sm:w-auto">
                  <motion.button
                    
                    onClick={() =>
                      editingProficiency === skill.id ? setEditingProficiency(null) : setEditingProficiency(skill.id)
                    }
                    className={`${selectedSkillPillClass} w-full justify-between`}
                  >
                    <span>{skill.name}</span>
                    <motion.button 
                          onClick={(e) => { // Keep stopPropagation
                                            e.stopPropagation();
                                            handleRemoveSkill(skill.id);
                                         }}
                            // Added whileHover and whileTap animations
                            whileHover={{ scale: 1.2, rotate: 5 }} // Scale up slightly and rotate on hover
                            whileTap={{ scale: 0.9, rotate: -5 }} // Scale down and rotate on click
                                                    
                            className={`p-1 rounded-full transition-colors flex-shrink-0 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                            aria-label={`Remove skill ${skill.name}`} // Added aria-label for accessibility
                    >
                        <FaRegTimesCircle className="text-red-500 text-lg" />
                    </motion.button>
                  </motion.button>

                  {/* Display Proficiency or Prompt */}
                  {skill.level && editingProficiency !== skill.id && !isResumeOnlyAssessment && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-1 px-2 py-0.5 text-xs rounded-full flex items-center space-x-1 ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>{PROFICIENCY_LEVELS.find(p => p.id === skill.level)?.name}</span>
                      <div className="flex">
                        {[...Array(3)].map((_, i) =>
                          i < (PROFICIENCY_LEVELS.find(p => p.id === skill.level)?.stars || 0) ? (
                            <FaStar key={i} size={10} />
                          ) : (
                            <FaRegStar key={i} size={10} />
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                  {!skill.level && editingProficiency !== skill.id && !isResumeOnlyAssessment && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-1 px-2 py-0.5 text-xs rounded-full flex items-center space-x-1 border border-red-400 ${
                        theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                      } cursor-pointer`}
                      onClick={() => setEditingProficiency(skill.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaInfoCircle size={10} className="text-red-400" /> <span className="underline">Select proficiency</span>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {editingProficiency === skill.id && !isResumeOnlyAssessment && (
                      <ProficiencySelector
                                  skillId={skill.id}
                                  currentLevel={skill.level ?? null}
                                  onSelectLevel={level => handleProficiencySelect(skill.id, level)} onClose={function (): void {
                                      throw new Error('Function not implemented.');
                                  } }                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skill Suggestions */}
        {!isResumeOnlyAssessment && (skillSuggestions.length > 0 || isSkillLoading) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2 ">
            <h5 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Suggested Skills
            </h5>
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.map((skillName, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(skillName)}
                  className={skillSuggestionPillClass}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{skillName}</span> <FaPlusCircle className="ml-2 text-green-500" />
                </motion.button>
              ))}
              <AnimatePresence>
                {isSkillLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm flex items-center ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}
                  >
                    <FaSpinner className="animate-spin mr-2 mb-2" /> Loading suggestions...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Manual Skill Input */}
        {!isResumeOnlyAssessment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
            <h5 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Add Custom Skill
            </h5>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualSkillInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setManualSkillInput(e.target.value)}
                placeholder="e.g., GraphQL"
                className={`${inputBaseClass} flex-grow`}
                onKeyPress={e => {
                  if (e.key === 'Enter' && manualSkillInput.trim()) {
                    e.preventDefault();
                    handleAddSkill(manualSkillInput.trim());
                  }
                }}
              />
              <motion.button
                type="button"
                onClick={() => manualSkillInput.trim() && handleAddSkill(manualSkillInput.trim())}
                className={pillButtonClass(false) + ' flex-shrink-0'}
                whileHover={{ scale: manualSkillInput.trim() ? 1.05 : 1 }}
                whileTap={{ scale: manualSkillInput.trim() ? 0.98 : 1 }}
              >
                <FaPlusCircle className="mr-1.5" /> Add
              </motion.button>
            </div>
          </motion.div>
        )}
        

        {/* Optional Goals/Skills */}
        <div className="mt-9 ml-[-0.5]">
        <SectionWrapper
          title="Describe Goals/Skills (Optional)"
          icon={<FiEdit3 className="text-sky-500" />}
          disabled={isResumeOnlyAssessment}
        >
          <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            E.g., &quotFocus on advanced React hooks and state management for e-commerce.&quot
          </p>
          <motion.textarea
            value={userPrompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUserPrompt(e.target.value)}
            placeholder="Type here..."
            rows={5}
            className={`${inputBaseClass} resize-y min-h-[100px] text-base sm:text-lg ${
              isResumeOnlyAssessment ? 'cursor-not-allowed' : ''
            }`}
            whileFocus={{ borderColor: theme === 'dark' ? '#0ea5e9' : '#0284c7' }}
            disabled={isResumeOnlyAssessment}
          />
        </SectionWrapper>

        {/* Experience Level */}
        <div className="mt-9">
        <SectionWrapper title="Experience Level" icon={<FaUserGraduate className="text-sky-500" />}>
          <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Select your current experience. <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPERIENCE_LEVELS.map(o => (
              <motion.button
                key={o.id}
                type="button"
                onClick={() => handleExperienceSelect(o.id)}
                className={pillButtonClass(selectedExperience === o.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {o.icon}
                <span>{o.name}</span>
                {selectedExperience === o.id && <FaCheckCircle className="ml-auto text-sky-500" />}
              </motion.button>
            ))}
          </div>
          {error.includes('experience level') && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs flex items-center text-red-500"
            >
              <FaRegTimesCircle className="mr-1.5" />
              {error}
            </motion.p>
          )}
        </SectionWrapper>
        </div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default FocusTab;
