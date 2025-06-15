// src/app/review-test/[reviewSessionId]/page.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EvaluationReport, QuestionResult } from '@/types/evaluation';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, Bars3Icon, SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '@/redux/slices/themeSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import { ExternalLinkIcon } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Initialize marked for markdown parsing
marked.setOptions({
  gfm: true,
  breaks: true,
});

const POLLING_INTERVAL_MS = 3000; // Poll every 3 seconds
const MAX_POLLING_ATTEMPTS = 20;

function ReviewTestPage () {
  const params = useParams();
  const router = useRouter();
  const reviewSessionId = params.reviewSessionId as string;
  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile sidebar visibility only
  const [pollingAttempt, setPollingAttempt] = useState(0); // Track polling attempts
  const [isEvaluating, setIsEvaluating] = useState(true); // New state to indicate ongoing evaluation

  const dispatch = useDispatch<AppDispatch>();
  const currentTheme = useSelector((state: RootState) => state.theme.theme);
  const isDark = currentTheme === 'dark';

  // --- Theme-based styles (ensure these match your tailwind.config.js) ---
  const textColorPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const bgColorPrimary = isDark ? 'bg-gray-950' : 'bg-gray-50'; // Main content background
  const bgColorSecondary = isDark ? 'bg-gray-900' : 'bg-white'; // Card/sidebar background
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
  const primaryGradient = 'bg-gradient-to-r from-sky-500 to-blue-600'; // Your desired gradient
  const primaryGradientHover = 'hover:from-sky-600 hover:to-blue-700';
  const buttonBgColor = isDark ? 'bg-gray-850' : 'bg-gray-100'; // For internal buttons like theme toggle in sidebar

  // --- Direct Theme Application (for consistency with system theme and local storage) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observer = useRef<IntersectionObserver | null>(null);

  // --- Data Fetching ---
  const fetchEvaluationReport = useCallback(async () => {
    if (!reviewSessionId) {
      setError("Review session ID not found. Please provide a valid ID.");
      setLoading(false);
      setIsEvaluating(false);
      return;
    }

    if (pollingAttempt >= MAX_POLLING_ATTEMPTS) {
      console.warn(`Max polling attempts (${MAX_POLLING_ATTEMPTS}) reached for ${reviewSessionId}. Stopping polling.`);
      setError("Evaluation report not found after several attempts. Please try again later or check your dashboard.");
      setLoading(false);
      setIsEvaluating(false); // Stop showing loading/evaluating spinner
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluation-report/${reviewSessionId}`);
      if (!response.ok) {
        // If not found (404), or other client errors, continue polling
        if (response.status === 404) {
          console.log(`Evaluation report not yet available for ${reviewSessionId}. Attempt ${pollingAttempt + 1}.`);
          setPollingAttempt(prev => prev + 1); // Increment attempt count
          // No error state set here, as it's an expected temporary state
          setLoading(false); // Can set loading to false to indicate report not yet loaded, but evaluation is ongoing
          setIsEvaluating(true); // Keep evaluation status true
          return; // Do not set report, let the loop continue
        } else {
          // For other errors (e.g., 500 Internal Server Error), stop polling and show error
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch evaluation report (Status: ${response.status}).`);
        }
      }

      // If response is OK (200), report is found!
      const data: EvaluationReport = await response.json();
      setEvaluationReport(data);
      setLoading(false);
      setError(null); // Clear any previous errors
      setIsEvaluating(false); // Evaluation complete
      console.log(`Evaluation report found for ${reviewSessionId} after ${pollingAttempt + 1} attempts.`);

    } catch (err) {
      console.error('Error fetching evaluation report:', err);
      setError((err as Error).message || 'An unexpected error occurred while fetching the report.');
      setLoading(false);
      setIsEvaluating(false); // Stop showing loading/evaluating spinner for fatal error
    }
  }, [reviewSessionId, pollingAttempt]); // Add pollingAttempt to dependencies

  useEffect(() => {
    let pollingTimer: NodeJS.Timeout;

    if (!evaluationReport && !error && reviewSessionId && isEvaluating) {
      pollingTimer = setTimeout(() => {
        fetchEvaluationReport();
      }, POLLING_INTERVAL_MS);
    }

    // Initial fetch on component mount
    if (pollingAttempt === 0 && !evaluationReport && !error && reviewSessionId) {
      fetchEvaluationReport();
    }

    return () => {
      clearTimeout(pollingTimer);
    };
  }, [reviewSessionId, evaluationReport, error, fetchEvaluationReport, pollingAttempt, isEvaluating]);

  // --- Intersection Observer for Active Question (unchanged) ---
  useEffect(() => {
    if (!evaluationReport || !evaluationReport.questionResults.length) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveQuestionId(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.5, 0.9],
      }
    );

    evaluationReport.questionResults.forEach((qr) => {
      const element = questionRefs.current[qr.questionId];
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [evaluationReport]);

  // --- Handlers & Helpers ---
  const scrollToQuestion = (questionId: string) => {
    const element = questionRefs.current[questionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveQuestionId(questionId);
      // Close sidebar only on mobile after clicking a question
      if (window.innerWidth < 1024) { // 1024px is Tailwind's 'lg' breakpoint
        setIsSidebarOpen(false);
      }
    }
  };

  const handleFinishReview = () => {
    router.push(`/final-report/${reviewSessionId}`);
  };

  const getScoreColor = (marks: number) => {
    if (marks === 1) return 'text-green-600 dark:text-green-400';
    if (marks === 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderMarkdown = (markdownText: string) => {
    if (!markdownText) return { __html: '' };
    const cleanHtml = DOMPurify.sanitize(marked.parse(markdownText));
    return { __html: cleanHtml };
  };

  const groupedQuestions = evaluationReport?.questionResults.reduce((acc, qr) => {
    const type = qr.questionType.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(qr);
    return acc;
  }, {} as Record<string, QuestionResult[]>) || {};

  // --- Framer Motion Variants for smooth animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.04, // Slightly faster stagger
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120, // More responsive spring
        damping: 14,
      },
    },
  };

  // --- Loading/Error States ---
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColorPrimary} ${textColorPrimary} transition-colors duration-300 font-sans`}>
        <p className="text-lg font-medium">Loading evaluation questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColorPrimary} ${textColorPrimary} transition-colors duration-300 font-sans`}>
        <div role="alert" className={`bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-700 px-6 py-4 rounded-lg shadow-md max-w-lg text-center ${textColorSecondary}`}>
          <strong className="font-bold text-lg">Error!</strong>
          <span className="block sm:inline ml-2 text-base">{error}</span>
        </div>
      </div>
    );
  }

  if (!evaluationReport) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColorPrimary} ${textColorPrimary} transition-colors duration-300 font-sans`}>
        <div role="alert" className={`bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 px-6 py-4 rounded-lg shadow-md max-w-lg text-center ${textColorSecondary}`}>
          <strong className="font-bold text-lg">Questions Not Found</strong>
          <span className="block sm:inline ml-2 text-base">No questions found for this session ID. Please check the URL.</span>
        </div>
      </div>
    );
  }

  return (
    // Main container - relative positioning for fixed elements inside it
    <div className={`relative min-h-screen ${bgColorPrimary} ${textColorPrimary} font-sans transition-colors duration-300`}>

      {/* Desktop-only Theme Toggle (fixed top-left) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => dispatch(toggleTheme())}
        className={`fixed top-4 left-4 z-50 p-3 rounded-full ${bgColorSecondary} ${textColorSecondary} shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hidden lg:block`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <SunIcon className="h-6 w-6 text-yellow-400" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-700" />
        )}
      </motion.button>

      {/* Mobile-only Sidebar Open Button (hamburger, fixed top-right) */}
      <div className="fixed top-4 right-50 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`p-3 rounded-full ${bgColorSecondary} ${textColorSecondary} shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6 " />
        </button>
      </div>

      {/* Sidebar - Fixed for all screen sizes */}
      <AnimatePresence>
        {/* Render sidebar if it's open (mobile) or if on desktop (lg and up) */}
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            // Mobile: Slides in from right. Desktop: Always present at right-0
            initial={{ x: '100%' }}
            animate={{ x: window.innerWidth >= 1024 ? '0%' : (isSidebarOpen ? '0%' : '100%') }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
              fixed top-0 sm:right-50 lg:right-0 h-full w-72 ${bgColorSecondary} p-6 shadow-xl border-l ${borderColor} flex flex-col z-50 overflow-y-auto

              
            `}
          >
            <div className={`flex items-center justify-between mb-8 pb-4 border-b ${borderColor} sticky top-0 ${bgColorSecondary} z-30`}>
              <h2 className={`text-xl font-bold ${textColorPrimary}`}>Review Questions</h2>
              {/* Close button for mobile sidebar */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`lg:hidden p-2 rounded-md ${textColorSecondary} hover:${buttonBgColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                aria-label="Close sidebar"
              >
                <ArrowLeftIcon className="h-6 w-6" /> {/* Beautiful arrow icon */}
              </button>
              {/* Theme Toggle - Only visible inside sidebar on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(toggleTheme())}
                className={`lg:hidden p-2 rounded-full ${buttonBgColor} ${textColorSecondary} shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <SunIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-gray-700" />
                )}
              </motion.button>
            </div>

            <nav className="flex-grow pt-4">
              {Object.entries(groupedQuestions).map(([type, questions]) => (
                <div key={type} className="mb-6">
                  <h3 className={`text-base font-semibold ${textColorPrimary} mb-3 border-b ${borderColor} pb-2`}>
                    {type}
                  </h3>
                  <ul className="space-y-2">
                    {questions.map((qr, idx) => (
                      <motion.li
                        key={qr.questionId}
                        initial={{ opacity: 0, x: 10 }} // Subtle horizontal slide-in
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02, type: 'spring', stiffness: 100, damping: 10 }}
                      >
                        <button
                          onClick={() => scrollToQuestion(qr.questionId)}
                          className={`
                            w-full text-left py-2 px-3 rounded-md
                            flex items-center justify-between group
                            transition-all duration-200 ease-in-out
                            ${activeQuestionId === qr.questionId
                              ? `${primaryGradient} text-white shadow-md font-semibold`
                              : `hover:${buttonBgColor} ${textColorPrimary} hover:text-blue-700 dark:hover:text-white`
                            }
                          `}
                        >
                          <span className="truncate flex-grow text-sm">Question {evaluationReport.questionResults.indexOf(qr) + 1}</span>
                          <span className="ml-2 flex-shrink-0">
                            {qr.status !== 'unattempted' && qr.isCorrect && (
                                <CheckCircleIcon className={`h-4 w-4 ${activeQuestionId === qr.questionId ? 'text-white' : 'text-green-500'}`} title="Correct" />
                            )}
                            {qr.status !== 'unattempted' && !qr.isCorrect && (qr.marksAwarded === 0 || qr.marksAwarded === 0.5) && (
                                <XCircleIcon className={`h-4 w-4 ${activeQuestionId === qr.questionId ? 'text-white' : 'text-red-500'}`} title="Incorrect" />
                            )}
                            {qr.status === 'unattempted' && (
                                <InformationCircleIcon className={`h-4 w-4 ${activeQuestionId === qr.questionId ? 'text-white' : 'text-gray-400'}`} title="Unattempted" />
                            )}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className={`mt-auto pt-6 border-t ${borderColor}`}>
              <motion.button
                onClick={handleFinishReview}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full ${primaryGradient} ${primaryGradientHover} text-white font-bold py-2.5 px-4 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                Go to Full Report <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>


      {/* Main Content Area */}
      {/* For desktop (lg), add padding-right to account for the fixed sidebar */}
      {/* For mobile, ensure there is enough padding to not be hidden by the hamburger icon */}
      <main className={`flex-grow p-6 sm:p-8 lg:p-10 lg:pr-72 pt-16 sm:pt-20 lg:pt-10`}> {/* Added top padding to ensure content isn't under any potential global top bar or fixed buttons */}
        <div className="container mx-auto max-w-4xl">
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-4 text-center ${textColorPrimary} leading-tight`}>
            Detailed Review
          </h1>
          <p className={`text-center text-base ${textColorSecondary} mb-10`}>
            Reviewing Test ID: <span className="font-semibold">{evaluationReport.testId}</span>
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {evaluationReport.questionResults.map((qr, index) => (
              <motion.div
                key={qr.questionId}
                id={qr.questionId}
                ref={(el) => { questionRefs.current[qr.questionId] = el; }}
                variants={itemVariants}
                whileHover={{ scale: 1.005, boxShadow: isDark ? "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.15)" : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
                className={`
                  ${bgColorSecondary} rounded-xl p-6 sm:p-7 border
                  ${activeQuestionId === qr.questionId ? `border-blue-500 ring-2 ring-blue-500 shadow-xl` : `${borderColor} shadow-md`}
                  transition-all duration-200 ease-in-out
                `}
              >
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-3 ${borderColor}`}>
                  <h3 className={`text-xl font-bold ${textColorPrimary} mb-2 sm:mb-0`}>
                    Question {index + 1}
                  </h3>
                  <span className={`text-sm ${textColorSecondary} capitalize px-3 py-1 rounded-full ${buttonBgColor}`}>
                    {qr.questionType.replace(/-/g, ' ')}
                  </span>
                </div>
                <p className={`text-base ${textColorPrimary} mb-5 leading-relaxed`}>
                  {qr.questionText}
                </p>

                {/* Your Answer Section */}
                <div className={`mb-5 ${buttonBgColor} p-4 rounded-lg border ${borderColor} shadow-inner`}>
                  <p className={`font-semibold text-base ${textColorPrimary} mb-2`}>Your Answer:</p>
                  {qr.userAnswer && qr.userAnswer.trim() !== '' && qr.userAnswer.trim() !== 'SKIPPED' ? (
                      <div dangerouslySetInnerHTML={renderMarkdown(qr.userAnswer)} className={`prose prose-sm ${isDark ? 'prose-invert' : ''} max-w-none ${textColorPrimary} leading-relaxed`}></div>
                  ) : (
                      <p className={`italic text-sm ${textColorSecondary}`}>Not Attempted.</p>
                  )}
                </div>

                {(qr.questionType === 'multiple-choice' || qr.questionType === 'general-aptitude') && qr.options && (
                  <div className={`mb-5 ${buttonBgColor} p-4 rounded-lg border ${borderColor} shadow-inner`}>
                    <p className={`font-semibold text-base ${textColorPrimary} mb-2`}>Options:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      {qr.options.map((option, i) => (
                        <li
                          key={i}
                          className={`
                            text-sm ${textColorSecondary}
                            ${qr.userAnswer === option ? `font-bold ${primaryGradient} bg-clip-text text-transparent` : ''}
                            ${qr.correctAnswer && qr.correctAnswer.includes(option) ? 'font-bold text-green-600 dark:text-green-400' : ''}
                          `}
                        >
                          {option}
                          {qr.userAnswer === option && !qr.isCorrect && <span className="ml-1 text-red-500 dark:text-red-400 font-normal text-xs">(Your choice, incorrect)</span>}
                          {qr.correctAnswer && qr.correctAnswer.includes(option) && <span className="ml-1 text-green-500 dark:text-green-400 font-normal text-xs">(Correct Answer)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsive grid for marks/status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div className={`${buttonBgColor} p-4 rounded-lg border ${borderColor} shadow-inner`}>
                    <p className={`font-semibold text-base ${textColorPrimary} mb-2`}>Marks Awarded:</p>
                    <span className={`text-xl font-bold ${getScoreColor(qr.marksAwarded)}`}>{qr.marksAwarded}</span> / 1
                  </div>
                  <div className={`${buttonBgColor} p-4 rounded-lg border ${borderColor} shadow-inner`}>
                    <p className={`font-semibold text-base ${textColorPrimary} mb-2`}>Status:</p>
                    <span className={`text-lg font-bold ${qr.isCorrect ? 'text-green-600 dark:text-green-400' : qr.marksAwarded === 0.5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'} capitalize`}>
                      {qr.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className={`mb-5 ${isDark ? 'bg-blue-950 text-blue-200 border-blue-700' : 'bg-blue-50 text-blue-800 border-blue-200'} p-4 rounded-lg shadow-inner`}>
                  <p className={`font-semibold text-base ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-2`}>Feedback:</p>
                  <div dangerouslySetInnerHTML={renderMarkdown(qr.feedback)} className={`prose prose-sm ${isDark ? 'prose-invert' : ''} max-w-none ${isDark ? 'text-blue-200' : 'text-blue-800'} leading-relaxed`}></div>
                </div>

                {/* Correct Answer Explanation Section */}
                <div className={`${isDark ? 'bg-emerald-950 text-emerald-200 border-emerald-700' : 'bg-emerald-50 text-emerald-800 border-emerald-200'} p-4 rounded-lg shadow-inner`}>
                  <p className={`font-semibold text-base ${isDark ? 'text-emerald-300' : 'text-emerald-700'} mb-2`}>Correct Answer Explanation:</p>
                  <div dangerouslySetInnerHTML={renderMarkdown(qr.correctAnswerExplanation)} className={`prose prose-sm ${isDark ? 'prose-invert' : ''} max-w-none ${isDark ? 'text-emerald-200' : 'text-emerald-800'} leading-relaxed`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ReviewTestPage;