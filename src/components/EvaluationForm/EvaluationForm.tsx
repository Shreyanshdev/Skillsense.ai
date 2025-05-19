// src/components/EvaluationForm/EvaluationForm.tsx
// Contains the core logic and state for the evaluation form steps (Focus, Details, Preferences)
// Renders child tab components based on active tab state.

'use client'; // This component needs client-side features like state and hooks

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaInfoCircle } from 'react-icons/fa'; // Only need navigation icons here
import { FiEdit3, FiCheckSquare, FiFileText } from 'react-icons/fi'; // Tab icons
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import debounce from 'lodash.debounce'; // Still needed for debounced handlers passed down

// Import the new tab components
import FocusTab from './FocusTab';
import DetailsTab from './DetailsTab';
import PreferencesTab from './PreferencesTab';

// Import constants and types
import {
    EXPERIENCE_LEVELS, DURATION_OPTIONS, SelectedSkill, PROFICIENCY_LEVELS
} from '@/constants';
import SectionWrapper from '../common/SectionWrapper';
import router from 'next/router';

// Define config for tabs within the form (Kept here as it controls the parent's tabs)
const TABS_CONFIG = [
  { id: 'focus', name: 'Focus', icon: <FiEdit3 /> },
  { id: 'details', name: 'Details', icon: <FiFileText /> }, // Changed icon for Details
  { id: 'preferences', name: 'Preferences', icon: <FiCheckSquare /> },
];

interface EvaluationFormProps {
  // No props needed from AppLayout for internal tab management
}

const EvaluationForm: React.FC<EvaluationFormProps> = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  // --- Form States (Managed here, passed down to children) ---
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('30m');
  const [isResumeOnlyAssessment, setIsResumeOnlyAssessment] = useState<boolean>(false);

  // --- AI Integration States (Managed here, passed down to children) ---
  const [roleInput, setRoleInput] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);

  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [isSkillLoading, setIsSkillLoading] = useState<boolean>(false);
  const [manualSkillInput, setManualSkillInput] = useState<string>('');


  // --- UI States (Managed here) ---
  const [activeTab, setActiveTab] = useState<string>(TABS_CONFIG[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingProficiency, setEditingProficiency] = useState<string | null>(null); // Still needed here to control selector visibility across tabs

  const prevTabIndexRef = useRef(TABS_CONFIG.findIndex(tab => tab.id === activeTab));

  useEffect(() => {
      prevTabIndexRef.current = TABS_CONFIG.findIndex(tab => tab.id === activeTab);
  }, [activeTab]);


  // --- Handlers (Managed here, passed down to children) ---

  // Handle toggling the "Resume Only Assessment" mode
  const handleResumeOnlyToggle = () => {
      const newState = !isResumeOnlyAssessment;
      setIsResumeOnlyAssessment(newState);
      if (newState) {
           setSelectedSkills([]);
           setSelectedRole('');
           setRoleInput('');
           setRoleSuggestions([]);
           setSkillSuggestions([]);
           setUserPrompt('');
           setEditingProficiency(null);
           if (resumeFile) {
               // Optional: setActiveTab('preferences'); // Auto-navigate
           }
      } else {
          if (error.includes("Resume Only assessment requires resume")) {
               setError('');
          }
      }
  };

   // Handle selecting an experience level
  const handleExperienceSelect = (expId: string) => setSelectedExperience(expId);

  // Handle resume file input change
  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
      setError('');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { setError('File size should not exceed 5MB.'); setResumeFile(null); setResumeFileName(''); return; }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) { setError('Please upload a PDF or Word document (.pdf, .doc, .docx).'); setResumeFile(null); setResumeFileName(''); return; }

      setResumeFile(file);
      setResumeFileName(file.name);
    } else {
        setResumeFile(null);
        setResumeFileName('');
    }
  };

  // Handle selecting a test duration
  const handleDurationSelect = (durationId: string) => setSelectedDuration(durationId);

  // Handle clearing all form selections and states
  const handleClearAll = () => {
    setSelectedSkills([]); setSelectedRole(''); setRoleInput(''); setRoleSuggestions([]); setSkillSuggestions([]); setUserPrompt('');
    setResumeFile(null); setResumeFileName(''); setSelectedDuration('30m'); setError('');
    setIsResumeOnlyAssessment(false);
    setEditingProficiency(null);
    setActiveTab(TABS_CONFIG[0].id);
  };

  // Handle selecting a proficiency level for a skill (Passed down to FocusTab's ProficiencySelector)
  const handleProficiencySelect = (skillId: string, levelId: string) => {
    setSelectedSkills((prev) =>
      prev.map(skill =>
        skill.id === skillId ? { ...skill, level: levelId } : skill
      )
    );
    setEditingProficiency(null);
  };


  // Handle the final form submission (Post data to backend for test generation)
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');

    if (!resumeFile) {
        setError('Please upload your resume.');
        setActiveTab('details');
        return;
    }

    if (!selectedExperience) {
        setError('Please select your experience level.');
        setActiveTab('focus');
        return;
    }

    if (!isResumeOnlyAssessment) {
         if (!selectedRole) {
            setError('Please confirm your target role.');
             setActiveTab('focus');
             return;
         }
        if (selectedSkills.length === 0 && !userPrompt.trim()) {
            setError('Please select skills/role OR describe your goals/skills.');
             setActiveTab('focus');
            return;
        }
        if (selectedSkills.some(skill => skill.level === null)) {
            setError('Please select proficiency for all chosen skills.');
            setActiveTab('focus');
            return;
        }
    }

    setIsSubmitting(true);

    console.log('Submitting Evaluation Data:', { isResumeOnlyAssessment, selectedRole, selectedSkills, selectedExperience, userPrompt, resumeFileName, selectedDuration });
    const formData = new FormData();
    formData.append('isResumeOnlyAssessment', String(isResumeOnlyAssessment));
    formData.append('selectedExperience', selectedExperience);
    formData.append('selectedDuration', selectedDuration);
    if (resumeFile) {
        formData.append('resume', resumeFile);
    }

    if (!isResumeOnlyAssessment) {
         formData.append('selectedRole', selectedRole);
         formData.append('userPrompt', userPrompt);
         formData.append('selectedSkills', JSON.stringify(selectedSkills.map(skill => ({ id: skill.id, name: skill.name, level: skill.level }))));
    }

    try {
        const response = await fetch('/api/generate-test', {
            method: 'POST',
            body: formData,
        });
        console.log('Response:', response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Submission failed.' }));
            throw new Error(errorData.error || 'Submission failed.');
        }

        const result = await response.json();
        console.log('Test Generation Result:', result);

        setIsSubmitting(false);
        setError('');
        alert('Test Generation Successful!');
        router.push('/test-interface');
    } catch (err: any) {
        console.error('Submission Error:', err);
        setIsSubmitting(false);
        setError(err.message || 'An unexpected error occurred.');
    }
  };


  // --- Styling Helpers (Defined here, passed down to children) ---
  const inputBaseClass = `w-full p-3 text-base sm:text-lg rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
    theme === 'dark'
      ? 'bg-gray-700/50 border-gray-600 focus:border-sky-500 focus:ring-sky-500 text-gray-200 placeholder-gray-400 hover:border-gray-500'
      : 'bg-gray-50/50 border-gray-300 focus:border-sky-500 focus:ring-sky-500 text-gray-800 placeholder-gray-400 hover:border-gray-400'
  }`;

  const primaryButtonClass = `px-7 py-3.5 text-lg sm:text-xl rounded-full font-semibold flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-gray-100'
  } bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-sky-500/40 dark:hover:shadow-blue-500/40 hover:scale-105 active:scale-95 active:ring-2 active:ring-sky-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:active:scale-100 disabled:active:ring-0 cursor-pointer`;

  const secondaryButtonClass = `px-5 py-2.5 text-sm sm:text-base rounded-full font-medium flex items-center ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 active:bg-gray-500'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 active:bg-gray-400'
  } hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 cursor-pointer`;

  const pillButtonClass = (isSelected: boolean) =>
    `p-3 text-sm sm:text-base rounded-lg border-2 text-left transition-all duration-200 flex items-center space-x-2 cursor-pointer
    ${isSelected
        ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500'
        : `${theme === 'dark' ? 'border-gray-600 hover:border-sky-600 bg-gray-700/50 active:bg-gray-600' : 'border-gray-300 hover:border-sky-400 bg-gray-50/50 active:bg-gray-300'}`
    } ${theme === 'dark' ? 'text-gray-200 hover:text-sky-300' : 'text-gray-700 hover:text-sky-600'}
    hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:z-10`;

  const selectedSkillPillClass = `px-3 py-1.5 text-xs sm:text-sm rounded-full border-2 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer
    border-sky-500 bg-sky-500/10 text-sky-500 ring-1 ring-sky-500 hover:scale-[1.05] active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:z-10`;

   const skillSuggestionPillClass = `px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 flex items-center space-x-1.5 cursor-pointer
       ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:border-sky-600 hover:text-sky-300 bg-gray-700/50 active:bg-gray-600' : 'border-gray-300 text-gray-700 hover:border-sky-400 hover:text-sky-600 bg-gray-50/50 active:bg-gray-300'}
       hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:z-10`;


    // Dynamic text for the 'Next' button based on the next tab
    const getNextButtonText = (currentTabId: string) => {
        const currentIndex = TABS_CONFIG.findIndex(tab => tab.id === currentTabId);
        if (currentIndex < TABS_CONFIG.length - 1) {
          const nextTabName = TABS_CONFIG[currentIndex + 1].name;
          switch (nextTabName) {
            case "Details": return "Add Your Details";
            case "Preferences": return "Set Preferences";
            default: return `Next: ${nextTabName}`;
          }
        }
        return "Finish Setup";
      };

    // Determine if the 'Next' button should be disabled on the current tab
    const isNextDisabled = () => {
        switch (activeTab) {
            case 'focus':
                if (!selectedExperience) return true;
                if (isResumeOnlyAssessment) return false; // Resume-only mode allows navigation
                return (
                    !selectedRole || // Role must be confirmed
                    (selectedSkills.length === 0 && !userPrompt.trim()) || // Must have skills OR prompt
                    selectedSkills.some(skill => skill.level === null) // ALL selected skills must have proficiency
                );
            case 'details':
                 return !resumeFile;
            case 'preferences':
                 return true; // Next is disabled on the last tab
            default:
                return false;
        }
    };

      // Determine if the 'Start Evaluation' button should be disabled
    const isSubmitDisabled = isSubmitting || !resumeFile || !selectedExperience || (!isResumeOnlyAssessment && (!selectedRole || (selectedSkills.length === 0 && !userPrompt.trim()) || selectedSkills.some(skill => skill.level === null)));


    // Determine the animation direction based on current and previous tab index
    const currentTabIndex = TABS_CONFIG.findIndex(tab => tab.id === activeTab);
    const direction = currentTabIndex > prevTabIndexRef.current ? 1 : -1;

    // Animation variants for tab content transition
    const tabContentVariants = {
        enter: (direction: number) => ({ opacity: 0, x: direction * 50 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: -direction * 50 }),
    };


  return (
     <div className="w-full max-w-4xl mx-auto py-8"> {/* Container to center and limit width, added vertical padding */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-xl shadow-3xl lg:shadow-purple-500/30 dark:lg:shadow-sky-500/20 overflow-hidden ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-lg`}
        >
            {/* Tab Headers */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200/80'}`}>
                {TABS_CONFIG.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-2 sm:py-5 font-medium text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 transition-colors relative focus:outline-none ${
                    activeTab === tab.id
                        ? (theme === 'dark' ? 'text-sky-300' : 'text-sky-600')
                        : (theme === 'dark' ? 'text-gray-400 hover:text-sky-400 hover:bg-gray-700/50' : 'text-gray-500 hover:text-sky-500 hover:bg-gray-100/70')
                    } cursor-pointer`}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                >
                    <span className="text-lg sm:text-xl">{tab.icon}</span> {tab.name}
                    {activeTab === tab.id && (
                    <motion.div
                        layoutId="activeTabIndicatorEvaluation"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme === 'dark' ? 'bg-sky-400' : 'bg-sky-500'}`}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                    )}
                </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div className="p-5 sm:p-8 min-h-[450px] sm:min-h-[500px] flex flex-col space-y-8">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        variants={tabContentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        className="space-y-6 flex-grow"
                    >
                        {/* Render the appropriate tab component based on activeTab */}
                        {activeTab === 'focus' && (
                            <FocusTab
                                  isResumeOnlyAssessment={isResumeOnlyAssessment}
                                  roleInput={roleInput}
                                  selectedRole={selectedRole}
                                  roleSuggestions={roleSuggestions}
                                  isRoleLoading={isRoleLoading}
                                  selectedSkills={selectedSkills}
                                  skillSuggestions={skillSuggestions}
                                  isSkillLoading={isSkillLoading}
                                  manualSkillInput={manualSkillInput}
                                  userPrompt={userPrompt}
                                  selectedExperience={selectedExperience}
                                  editingProficiency={editingProficiency}
                                  error={error}
                                  handleResumeOnlyToggle={handleResumeOnlyToggle}
                                  setRoleInput={setRoleInput}
                                  setSelectedRole={setSelectedRole}
                                  setRoleSuggestions={setRoleSuggestions}
                                  setIsRoleLoading={setIsRoleLoading}
                                  setSelectedSkills={setSelectedSkills}
                                  setSkillSuggestions={setSkillSuggestions}
                                  setIsSkillLoading={setIsSkillLoading}
                                  setManualSkillInput={setManualSkillInput}
                                  setUserPrompt={setUserPrompt}
                                  handleExperienceSelect={handleExperienceSelect}
                                  setEditingProficiency={setEditingProficiency}
                                  handleProficiencySelect={handleProficiencySelect}
                                  setError={setError}
                                  inputBaseClass={inputBaseClass}
                                  pillButtonClass={pillButtonClass}
                                  selectedSkillPillClass={selectedSkillPillClass}
                                  skillSuggestionPillClass={skillSuggestionPillClass} confirmedRolePillClass={''}                            />
                        )}
                        {activeTab === 'details' && (
                            <DetailsTab
                                resumeFile={resumeFile}
                                resumeFileName={resumeFileName}
                                error={error}
                                handleResumeChange={handleResumeChange}
                                setError={setError}
                                inputBaseClass={inputBaseClass} // Passed for consistency, though not used internally
                            />
                        )}
                        {activeTab === 'preferences' && (
                            <PreferencesTab
                                selectedDuration={selectedDuration}
                                isSubmitting={isSubmitting}
                                error={error}
                                isSubmitDisabled={isSubmitDisabled}
                                handleDurationSelect={handleDurationSelect}
                                handleClearAll={handleClearAll}
                                handleSubmit={handleSubmit}
                                pillButtonClass={pillButtonClass}
                                secondaryButtonClass={secondaryButtonClass}
                                primaryButtonClass={primaryButtonClass}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Tab Navigation (Previous/Next buttons) */}
                 <div className={`mt-auto pt-6 border-t flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200/80'}`}>
                    {/* Previous Button */}
                    <motion.button
                        type="button"
                        onClick={() => setActiveTab(TABS_CONFIG[Math.max(0, currentTabIndex - 1)].id)}
                        disabled={currentTabIndex === 0}
                        className={`${secondaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                        whileHover={{ scale: currentTabIndex !== 0 ? 1.05 : 1 }}
                        whileTap={{ scale: currentTabIndex !== 0 ? 0.95 : 1 }}
                    >
                        <FaArrowLeft className="mr-1.5" /> Previous
                    </motion.button>

                    {/* Next Button (Hidden on the last tab) */}
                    {currentTabIndex < TABS_CONFIG.length - 1 && (
                        <motion.button
                            type="button"
                            onClick={() => setActiveTab(TABS_CONFIG[Math.min(TABS_CONFIG.length - 1, currentTabIndex + 1)].id)}
                            disabled={isNextDisabled()}
                            className={`${secondaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                            whileHover={{ scale: !isNextDisabled() ? 1.05 : 1 }}
                            whileTap={{ scale: !isNextDisabled() ? 0.95 : 1 }}
                        >
                            {getNextButtonText(activeTab)} <FaArrowRight className="ml-1.5" />
                        </motion.button>
                    )}
                 </div>
            </div>
        </motion.div>
     </div>
  );
}

export default EvaluationForm;

// GuidelinesSection Component (Defined outside the main component)
const GuidelinesSection = ({ selectedDuration }: { selectedDuration: string }) => {
    const theme = useSelector((state: RootState) => state.theme.theme);
     const DURATION_OPTIONS = [
          { id: '15m', name: 'Quick (15 min)', icon: null },
          { id: '30m', name: 'Standard (30 min)', icon: null },
          { id: '45m', name: 'In-depth (45 min)', icon: null },
          { id: '60m', name: 'Full (60 min)', icon: null },
     ];
     const durationName = DURATION_OPTIONS.find(d => d.id === selectedDuration)?.name || 'selected duration';

    return (
        <SectionWrapper title="What to Expect" icon={<FaInfoCircle className="text-sky-500" />}>
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 border border-gray-600 text-gray-300' : 'bg-blue-50/50 border border-blue-200 text-gray-700'}`}
            >
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                    <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}><span className="font-semibold">Question Types:</span> You will encounter a mix of coding challenges, multiple-choice questions, and theoretical concepts.</motion.li>
                    <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}><span className="font-semibold">Requirements:</span> Ensure you have a stable internet connection and a quiet environment.</motion.li>
                    <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}><span className="font-semibold">Duration:</span> The test duration is based on your selection (<span className="font-semibold">{durationName}</span>). Manage your time effectively.</motion.li>
                    <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}><span className="font-semibold">After the Test:</span> You will receive a summary of your performance and suggested areas for improvement.</motion.li>
                </ul>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.6 }} className={`mt-3 text-xs sm:text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This assessment helps us understand your strengths to provide tailored learning resources.</motion.p>
             </motion.div>
        </SectionWrapper>
    );
};
