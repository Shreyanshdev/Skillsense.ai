
'use client';

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaSpinner, FaTimesCircle, FaBars, FaTimes } from 'react-icons/fa'; // Added FaBars, FaTimes for hamburger
import { FiEdit3, FiCheckSquare, FiFileText } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { setTestData, setTestLoading, setTestError, clearTestData } from '@/redux/slices/testSlice';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Import the new tab components
import FocusTab from './FocusTab';
import DetailsTab from './DetailsTab';
import PreferencesTab from './PreferencesTab';
import Confirmation from './Confirmation'; // Reusing this for start test confirmation

// Import constants and types
import { SelectedSkill } from '@/constants';


// Define config for tabs within the form
const TABS_CONFIG = [
  { id: 'focus', name: 'Focus', icon: <FiEdit3 /> },
  { id: 'details', name: 'Details', icon: <FiFileText /> },
  { id: 'preferences', name: 'Preferences', icon: <FiCheckSquare /> },
];

// Define interface for form data to be stored in local storage
interface FormDataState {
    selectedSkills: SelectedSkill[];
    selectedExperience: string;
    userPrompt: string;
    resumeFileName: string;
    selectedDuration: string;
    isResumeOnlyAssessment: boolean;
    testType: 'general' | 'specialized';
    isGARoundSelected: boolean;
    specializedRoundCounts: { mcq: number | ''; theory: number | ''; coding: number | ''; };
    codingDifficulty: string;
    selectedRole: string;
}


const EvaluationForm: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  const router = useRouter();

  // --- Form States (Managed here, passed down to children) ---
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('30m');
  const [isResumeOnlyAssessment, setIsResumeOnlyAssessment] = useState<boolean>(false);

  // --- New Test Configuration States ---
  const [testType, setTestType] = useState<'general' | 'specialized'>('general');
  const [isGARoundSelected, setIsGARoundSelected] = useState<boolean>(false);
  const [generalTestCounts] = useState<{ mcq: number; theory: number; coding: number }>({ mcq: 10, theory: 5, coding: 3 });
  const [specializedRoundCounts, setSpecializedRoundCounts] = useState<{ mcq: number | ''; theory: number | ''; coding: number | ''; }>({ mcq: 2, theory: 2, coding: 2 });
  const [codingDifficulty, setCodingDifficulty] = useState<string>('medium'); // 'easy', 'medium', 'hard', 'mixed'

  // --- AI Integration States ---
  const [roleInput, setRoleInput] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);

  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [isSkillLoading, setIsSkillLoading] = useState<boolean>(false);
  const [manualSkillInput, setManualSkillInput] = useState<string>('');
  const [analyzedSkills, setAnalyzedSkills] = useState<string[]>([]);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState<boolean>(false);

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<string>(TABS_CONFIG[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingProficiency, setEditingProficiency] = useState<string | null>(null);
  const [showStartTestModal, setShowStartTestModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  const prevTabIndexRef = useRef(TABS_CONFIG.findIndex(tab => tab.id === activeTab));

  useEffect(() => {
      prevTabIndexRef.current = TABS_CONFIG.findIndex(tab => tab.id === activeTab);
  }, [activeTab]);


  // --- Local Storage: Load State on Mount ---
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem('evaluationFormData');
      if (savedFormData) {
        const parsedData: FormDataState = JSON.parse(savedFormData);
        setSelectedSkills(parsedData.selectedSkills || []);
        setSelectedExperience(parsedData.selectedExperience || '');
        setUserPrompt(parsedData.userPrompt || '');
        setResumeFileName(parsedData.resumeFileName || '');
        setSelectedDuration(parsedData.selectedDuration || '30m');
        setIsResumeOnlyAssessment(parsedData.isResumeOnlyAssessment || false);
        setTestType(parsedData.testType || 'general');
        setIsGARoundSelected(parsedData.isGARoundSelected || false);
        setSpecializedRoundCounts(parsedData.specializedRoundCounts || { mcq: 2, theory: 2, coding: 2 });
        setCodingDifficulty(parsedData.codingDifficulty || 'medium');
        setSelectedRole(parsedData.selectedRole || '');
        setRoleInput(parsedData.selectedRole || '');
        toast.info('Loaded saved form progress!');
      }
    } catch (e) {
      console.error("Failed to load form data from local storage", e);
      localStorage.removeItem('evaluationFormData');
    }
  }, []);

  // --- Local Storage: Save State on Change (Debounced) ---
  const debouncedSave = useCallback(
    debounce((data: FormDataState) => {
      try {
        localStorage.setItem('evaluationFormData', JSON.stringify(data));
      } catch (e) {
        console.error("Failed to save form data to local storage", e);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    const dataToSave: FormDataState = {
      selectedSkills,
      selectedExperience,
      userPrompt,
      resumeFileName,
      selectedDuration,
      isResumeOnlyAssessment,
      testType,
      isGARoundSelected,
      specializedRoundCounts,
      codingDifficulty,
      selectedRole,
    };
    debouncedSave(dataToSave);
  }, [
    selectedSkills, selectedExperience, userPrompt, resumeFileName, selectedDuration,
    isResumeOnlyAssessment, testType, isGARoundSelected, specializedRoundCounts,
    codingDifficulty, selectedRole, debouncedSave
  ]);


  // --- Handlers ---

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
           dispatch(clearTestData());
           dispatch(setTestError(null));
           setError('');
      } else {
          if (!resumeFile && activeTab === 'details') {
              setError('Resume is required for non-Resume Only assessment.');
          } else {
              setError('');
          }
      }
  };

  const handleExperienceSelect = (expId: string) => setSelectedExperience(expId);

  const handleResumeChange = async (event: ChangeEvent<HTMLInputElement>) => {
      setError('');
      setAnalyzedSkills([]);
      setIsAnalyzingResume(false);

      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        dispatch(clearTestData());
        dispatch(setTestError(null));

        if (file.size > 5 * 1024 * 1024) { setError('File size should not exceed 5MB.'); setResumeFile(null); setResumeFileName(''); return; }
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) { setError('Please upload a PDF or Word document (.pdf, .doc, .docx).'); setResumeFile(null); setResumeFileName(''); return; }

        setResumeFile(file);
        setResumeFileName(file.name);

        setIsAnalyzingResume(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Resume analysis failed.' }));
                throw new Error(errorData.error || 'Resume analysis failed.');
            }

            const result = await response.json();
            if (result && result.skills && Array.isArray(result.skills)) {
                setAnalyzedSkills(result.skills);
                toast.success('Resume analyzed successfully!');
            } else {
                setAnalyzedSkills([]);
                toast.info('Resume analyzed, but no specific skills found.');
            }
        } catch (err: any) {
            console.error('Resume analysis error:', err);
            setError(`Resume analysis failed: ${err.message}`);
            setAnalyzedSkills([]);
            toast.error('Resume analysis failed.');
        } finally {
            setIsAnalyzingResume(false);
        }

      } else {
          setResumeFile(null);
          setResumeFileName('');
      }
  };

  const handleDurationSelect = (durationId: string) => setSelectedDuration(durationId);

  const handleClearAll = () => {
    setSelectedSkills([]); setSelectedRole(''); setRoleInput(''); setRoleSuggestions([]); setSkillSuggestions([]); setUserPrompt('');
    setResumeFile(null); setResumeFileName(''); setSelectedDuration('30m'); setError('');
    setIsResumeOnlyAssessment(false);
    setEditingProficiency(null);
    setTestType('general');
    setIsGARoundSelected(false);
    setSpecializedRoundCounts({ mcq: 2, theory: 2, coding: 2 });
    setCodingDifficulty('medium');
    setAnalyzedSkills([]);
    setIsAnalyzingResume(false);

    setActiveTab(TABS_CONFIG[0].id);
    dispatch(clearTestData());
    dispatch(setTestError(null));
    localStorage.removeItem('evaluationFormData');
    toast.info('All form data cleared!');
  };

  const handleProficiencySelect = (skillId: string, levelId: string) => {
    setSelectedSkills((prev) =>
      prev.map(skill =>
        skill.id === skillId ? { ...skill, level: levelId } : skill
      )
    );
    setEditingProficiency(null);
  };

  const handleTestTypeChange = (type: 'general' | 'specialized') => {
      setTestType(type);
      if (type === 'general') {
          setSpecializedRoundCounts({ mcq: 2, theory: 2, coding: 2 });
      }
  };

  const handleGARoundToggle = () => {
      setIsGARoundSelected(prev => !prev);
  };

  const handleSpecializedCountChange = (roundType: 'mcq' | 'theory' | 'coding', value: number | '') => {
      const parsedValue = value === '' ? '' : Math.max(0, parseInt(value as unknown as string) || 0);
      setSpecializedRoundCounts(prev => ({
          ...prev,
          [roundType]: parsedValue
      }));
  };

  const handleCodingDifficultyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setCodingDifficulty(event.target.value);
  };

  const confirmAndStartTest = useCallback(async () => {
    setIsSubmitting(true);
    dispatch(setTestLoading(true));
    dispatch(setTestError(null));
    setShowStartTestModal(false);

    console.log('Submitting Evaluation Data for Test Generation...');
    const formData = new FormData();
    formData.append('isResumeOnlyAssessment', String(isResumeOnlyAssessment));
    formData.append('selectedExperience', selectedExperience);
    formData.append('selectedDuration', selectedDuration);
    if (resumeFile) {
        formData.append('resume', resumeFile);
    }

    if (!isResumeOnlyAssessment) {
         formData.append('selectedRole', selectedRole || '');
         formData.append('userPrompt', userPrompt || '');
         formData.append('selectedSkills', JSON.stringify(selectedSkills.map(skill => ({ id: skill.id, name: skill.name, level: skill.level }))));
    }

    formData.append('testType', testType);
    formData.append('isGARoundSelected', String(isGARoundSelected));
    formData.append('codingDifficulty', codingDifficulty);

    if (testType === 'general') {
        formData.append('generalTestCounts', JSON.stringify(generalTestCounts));
    } else {
        const finalSpecializedCounts = {
            mcq: typeof specializedRoundCounts.mcq === 'number' ? specializedRoundCounts.mcq : 0,
            theory: typeof specializedRoundCounts.theory === 'number' ? specializedRoundCounts.theory : 0,
            coding: typeof specializedRoundCounts.coding === 'number' ? specializedRoundCounts.coding : 0,
        };
        formData.append('specializedRoundCounts', JSON.stringify(finalSpecializedCounts));
    }

    try {
        const response = await fetch('/api/generate-test', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Test generation failed.' }));
            console.error('EvaluationForm: /api/generate-test failed with status:', response.status, errorData);
            throw new Error(errorData.error || 'Test generation failed.');
        }

        const result = await response.json();
        console.log('EvaluationForm: Test Generation Result Received:', result);

        if (result && result.rounds && result.rounds.length > 0) {
             dispatch(setTestData(result));
             router.push('/test-interface');
        } else {
            console.error('EvaluationForm: Test generation succeeded but returned no rounds or invalid format.', result);
            setError('Test generated successfully, but no questions were returned. Please try again.');
            dispatch(setTestError('Test generated successfully, but no questions were returned.'));
        }

    } catch (err: any) {
        console.error('Submission Error during test generation:', err);
        setError(err.message || 'An unexpected error occurred during test generation.');
        dispatch(setTestError(err.message || 'An unexpected error occurred during test generation.'));
    } finally {
        setIsSubmitting(false);
        dispatch(setTestLoading(false));
    }
  }, [
      isResumeOnlyAssessment, selectedExperience, selectedDuration, resumeFile,
      selectedRole, userPrompt, selectedSkills, testType, isGARoundSelected,
      codingDifficulty, generalTestCounts, specializedRoundCounts, dispatch, router
  ]);


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setError('');
    dispatch(setTestError(null));

    if (!resumeFile && !isResumeOnlyAssessment) {
        setError('Please upload your resume or select "Assessment Only" mode.');
        setActiveTab('details');
        return;
    }
    if (!selectedExperience && !isResumeOnlyAssessment) {
        setError('Please select your experience level or select "Assessment Only" mode.');
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
    if (testType === 'specialized') {
        const { mcq, theory, coding } = specializedRoundCounts;
        if (mcq === '' || theory === '' || coding === '' || (mcq as number) < 2 || (theory as number) < 2 || (coding as number) < 2) {
            setError('For Specialized Test, all question counts must be 2 or more.');
            setActiveTab('details');
            return;
        }
    }

    setShowStartTestModal(true);
  };


  // --- Styling Helpers ---
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

    const confirmedRolePillClass = `px-4 py-2 text-sm sm:text-base rounded-full border transition-colors duration-200 cursor-pointer`;


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
                if (isResumeOnlyAssessment) return false;
                return !selectedExperience || !selectedRole || ((selectedSkills.length === 0 && !userPrompt.trim()) || selectedSkills.some(skill => skill.level === null));
            case 'details':
                 if (testType === 'specialized') {
                     const { mcq, theory, coding } = specializedRoundCounts;
                     if (mcq === '' || theory === '' || coding === '' || (mcq as number) < 2 || (theory as number) < 2 || (coding as number) < 2) {
                         return true;
                     }
                 }
                 return !resumeFile && !isResumeOnlyAssessment;
            case 'preferences':
                 return true;
            default:
                return false;
        }
    };

    const isSubmitDisabled = useMemo(() => {
        if (isSubmitting) return true;

        if (!resumeFile && !isResumeOnlyAssessment) return true;
        if (!selectedExperience && !isResumeOnlyAssessment) return true;

        if (!isResumeOnlyAssessment) {
            if (!selectedRole) return true;
            if (selectedSkills.length === 0 && !userPrompt.trim()) return true;
            if (selectedSkills.some(skill => skill.level === null)) return true;
        }

        if (testType === 'specialized') {
            const { mcq, theory, coding } = specializedRoundCounts;
            if (mcq === '' || theory === '' || coding === '' || (mcq as number) < 2 || (theory as number) < 2 || (coding as number) < 2) {
                return true;
            }
        }

        return false;
    }, [isSubmitting, resumeFile, isResumeOnlyAssessment, selectedExperience, selectedRole, selectedSkills, userPrompt, testType, specializedRoundCounts]);


    const currentTabIndex = TABS_CONFIG.findIndex(tab => tab.id === activeTab);
    const direction = currentTabIndex > prevTabIndexRef.current ? 1 : -1;

    const tabContentVariants = {
        enter: (direction: number) => ({ opacity: 0, x: direction * 50 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: -direction * 50 }),
    };


  return (
     
     <div className="w-full py-8 sm:py-12"> {/* Removed px-4 from here */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            
            // This is the key change to ensure content has padding while the card itself is full width.
            className={`rounded-xl shadow-3xl lg:shadow-purple-500/30 dark:lg:shadow-sky-500/20 overflow-hidden ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-lg w-full sm:max-w-4xl sm:mx-auto`}
        >
            {/* Mobile Hamburger Menu / Desktop Tab Headers */}
            {/* This div now has p-4 to provide padding around the header content itself */}
            <div className={`relative flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200/80'} sm:flex px-4 sm:px-0`}> {/* Added px-4 here */}
                {/* Hamburger Icon for Mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`sm:hidden p-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                    aria-label="Open tab navigation"
                >
                    {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                </button>
                {/* Current Tab Name for Mobile */}
                <div className={`sm:hidden flex-1 flex items-center justify-center font-medium text-base ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>
                    {TABS_CONFIG.find(tab => tab.id === activeTab)?.name}
                </div>

                {/* Desktop Tab Headers */}
                <div className="hidden sm:flex flex-1"> {/* Hide on mobile, show on sm and up */}
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
            </div>

            {/* Mobile Tab Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className={`fixed inset-y-0 right-0 z-50 w-1/2 sm:hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-lg border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`p-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                                aria-label="Close tab navigation"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <nav className="flex flex-col p-4 space-y-2">
                            {TABS_CONFIG.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsMobileMenuOpen(false); // Close menu on selection
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-lg font-medium text-base transition-colors ${
                                        activeTab === tab.id
                                            ? (theme === 'dark' ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700')
                                            : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                                    }`}
                                >
                                    <span className="text-lg">{tab.icon}</span> {tab.name}
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Tab Content Area */}
            {/* This div already has p-5 sm:p-8, which provides internal padding */}
            <div className="p-5 sm:p-8 flex flex-col space-y-8 flex-grow">
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
                                skillSuggestionPillClass={skillSuggestionPillClass}
                                confirmedRolePillClass={confirmedRolePillClass}
                            />
                        )}
                        {activeTab === 'details' && (
                            <DetailsTab
                                  resumeFile={resumeFile}
                                  resumeFileName={resumeFileName}
                                  error={error}
                                  codingDifficulty={codingDifficulty}
                                  analyzedSkills={analyzedSkills}
                                  isAnalyzingResume={isAnalyzingResume}
                                  handleResumeChange={handleResumeChange}
                                  setError={setError}
                                  handleCodingDifficultyChange={handleCodingDifficultyChange}
                                  testType={testType}
                                  isGARoundSelected={isGARoundSelected}
                                  generalTestCounts={generalTestCounts}
                                  specializedRoundCounts={specializedRoundCounts}
                                  handleTestTypeChange={handleTestTypeChange}
                                  handleGARoundToggle={handleGARoundToggle}
                                  handleSpecializedCountChange={handleSpecializedCountChange}
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
                                testType={testType}
                                isGARoundSelected={isGARoundSelected}
                                generalTestCounts={generalTestCounts}
                                specializedRoundCounts={specializedRoundCounts}
                                codingDifficulty={codingDifficulty}
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
                    {/* Submit Button (Only on the last tab) */}
                    {currentTabIndex === TABS_CONFIG.length - 1 && (
                        <motion.button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            className={`${primaryButtonClass} w-full sm:w-auto`}
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" /> Generating...
                                </>
                            ) : (
                                'Start Evaluation'
                            )}
                        </motion.button>
                    )}
                 </div>
            </div>
        </motion.div>

        {/* Start Test Confirmation Modal */}
        <Confirmation
            isOpen={showStartTestModal}
            onClose={() => setShowStartTestModal(false)}
            onConfirm={confirmAndStartTest}
            theme={theme}
            title="Confirm Test Details"
            message={
                <div className={`text-left space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-semibold text-base">You are about to start your evaluation with the following configuration:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Test Type:</strong> {testType === 'general' ? 'General Assessment' : 'Specialized Assessment'}</li>
                        {testType === 'general' ? (
                            <>
                                <li><strong>MCQ Questions:</strong> {generalTestCounts.mcq}</li>
                                <li><strong>Theory Questions:</strong> {generalTestCounts.theory}</li>
                                <li><strong>Coding Questions:</strong> {generalTestCounts.coding}</li>
                            </>
                        ) : (
                            <>
                                <li><strong>MCQ Questions:</strong> {specializedRoundCounts.mcq || 0}</li>
                                <li><strong>Theory Questions:</strong> {specializedRoundCounts.theory || 0}</li>
                                <li><strong>Coding Questions:</strong> {specializedRoundCounts.coding || 0}</li>
                            </>
                        )}
                        <li><strong>Coding Difficulty:</strong> {codingDifficulty.charAt(0).toUpperCase() + codingDifficulty.slice(1)}</li>
                        <li><strong>GA Round:</strong> {isGARoundSelected ? 'Included (10 Qs / 10 Min)' : 'Not Included'}</li>
                    </ul>
                    <p className="font-semibold text-base mt-4">Are you ready to begin?</p>
                </div>
            }
            confirmText="Start Test"
            cancelText="Go Back"
        />
     </div>
  );
}

export default EvaluationForm;
