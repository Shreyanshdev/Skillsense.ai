// src/app/final-report/[reviewSessionId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Using Heroicons for a cleaner look
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '@/redux/slices/themeSlice';
import AppLayout from '@/components/Layout/AppLayout';
import type { RootState } from '@/redux/store';
import type { EvaluationReport } from '@/types/evaluation'; // Ensure this path is correct

// Initialize marked for markdown parsing
marked.setOptions({ gfm: true, breaks: true });

export default function FinalReportPage() {
  const { reviewSessionId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define sophisticated theme-based colors for elegance
  const textColorPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textColorSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgColorPage = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const bgColorCard = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Elegant gradients for highlights and special cards
  const accentGradientSoft = isDark ? 'from-purple-800 to-indigo-900' : 'from-indigo-100 to-blue-50'; // For overall summary
  const specialCardGradient = 'bg-gradient-to-r from-teal-500 to-cyan-600'; // Unique, elegant gradient for the new card
  const specialCardGradientHover = 'hover:from-teal-600 hover:to-cyan-700';

  // Framer Motion Variants for Staggered & Elegant Entry
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Subtle stagger for elegance
        delayChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    async function fetchReport() {
      if (!reviewSessionId) {
        setError("Review session ID not found.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/evaluation-report/${reviewSessionId}`);
        if (!res.ok) throw new Error('Failed to load report. Please try again.');
        setReport(await res.json());
      } catch (e) {
        setError(e as string);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reviewSessionId]);

  const renderMarkdown = (md: string) => ({ __html: DOMPurify.sanitize(marked.parse(md)) });

  if (loading) {
    return (
      <AppLayout>
        <div className={`flex items-center justify-center min-h-screen ${bgColorPage} font-inter`}>
          <p className={`${textColorSecondary} text-lg animate-pulse`}>Generating report...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className={`flex items-center justify-center min-h-screen ${bgColorPage} font-inter`}>
          <div role="alert" className={`bg-red-100 border border-red-400 text-red-700 ${isDark ? 'dark:bg-red-900 dark:text-red-200 dark:border-red-700' : ''} px-6 py-4 rounded-lg shadow-md max-w-lg text-center`}>
            <strong className="font-bold text-lg">Error!</strong>
            <span className="block sm:inline ml-2 text-base">{error || 'Report not found for this session.'}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  const scorePercentage = (report.totalScore / report.questionResults.length) * 100;

  return (
    <AppLayout>
      <div className={`font-inter min-h-screen p-6 sm:p-8 ${bgColorPage} ${textColorPrimary}`}>
        <motion.div
          className="max-w-6xl mx-auto space-y-6 sm:space-y-8" // Increased max-w for more desktop area
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 ${isDark ? 'text-sky-300 hover:text-sky-100' : 'text-sky-600 hover:text-sky-800'} transition-colors duration-200`}
            >
              <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" /> <span className="text-sm sm:text-base font-medium">Back to Questions</span>
            </motion.button>
            <motion.button
              onClick={() => dispatch(toggleTheme())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />}
            </motion.button>
          </div>

          {/* Title */}
          <header className="text-center mb-10">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 ${textColorPrimary}`}>
              Test Evaluation Report
            </h1>
            <p className={`text-base sm:text-lg ${textColorSecondary}`}>
              For Test ID: <span className="font-semibold">{report.testId}</span> | Candidate: <span className="font-semibold">{report.userId}</span>
            </p>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              Submitted on {new Date(report.submissionTimestamp).toLocaleString()}
            </p>
          </header>

          {/* Overall Performance Summary Card */}
          <motion.section
            variants={sectionVariants}
            className={`p-6 sm:p-8 rounded-xl shadow-lg ${isDark ? accentGradientSoft : accentGradientSoft} border ${isDark ? 'border-purple-700' : 'border-indigo-200'}`}
          >
            <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-indigo-800'} border-b ${isDark ? 'border-purple-600' : 'border-indigo-300'} pb-3`}>
              Overall Performance
            </h2>
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xl sm:text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-indigo-700'}`}>Score: {report.totalScore} / {report.questionResults.length}</span>
              <span className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{scorePercentage.toFixed(1)}%</span>
            </div>
            <div className={`h-3 sm:h-4 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${isDark ? 'bg-green-500' : 'bg-green-600'} rounded-full`}
              />
            </div>
          </motion.section>

          {/* AI Summary */}
          {report.llmInsights?.summaryAboutCandidate && (
            <motion.div
              variants={sectionVariants}
              className={`p-6 rounded-lg shadow-md ${bgColorCard} border ${borderColor}`}
            >
              <h2 className={`text-xl sm:text-2xl font-semibold mb-3 ${textColorPrimary}`}>AI Summary</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown(report.llmInsights.summaryAboutCandidate)} />
              {report.llmInsights.motivationalQuote && (
                <p className={`mt-4 text-sm italic ${textColorSecondary} border-t ${borderColor} pt-3`}>
                  &quot;{report.llmInsights.motivationalQuote}&quot;
                </p>
              )}
            </motion.div>
          )}

          {/* Strengths & Improvements Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {report.llmInsights?.whatsGood?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                className={`p-5 rounded-lg border ${isDark ? 'border-green-700 bg-gray-800' : 'border-green-200 bg-white'} shadow-sm`}
              >
                <h3 className={`font-semibold text-lg sm:text-xl ${isDark ? 'text-green-300' : 'text-green-700'} mb-2`}>Strengths</h3>
                <ul className={`list-disc pl-5 space-y-1 text-sm ${textColorSecondary}`}>
                  {report.llmInsights.whatsGood.map((s, i) => (<li key={i}>{s}</li>))}
                </ul>
              </motion.div>
            )}
            {report.llmInsights?.areaForImprovement?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                className={`p-5 rounded-lg border ${isDark ? 'border-red-700 bg-gray-800' : 'border-red-200 bg-white'} shadow-sm`}
              >
                <h3 className={`font-semibold text-lg sm:text-xl ${isDark ? 'text-red-300' : 'text-red-700'} mb-2`}>Areas for Improvement</h3>
                <ul className={`list-disc pl-5 space-y-1 text-sm ${textColorSecondary}`}>
                  {report.llmInsights.areaForImprovement.map((i, idx) => (<li key={idx}>{i}</li>))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* Skill Proficiency */}
          {report.llmInsights?.skillProficiency && Object.keys(report.llmInsights.skillProficiency).length > 0 && (
            <motion.div
              variants={sectionVariants}
              className={`p-6 rounded-lg shadow-md ${bgColorCard} border ${borderColor}`}
            >
              <h4 className={`text-xl sm:text-2xl font-semibold mb-3 ${textColorPrimary}`}>Skill Proficiency:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm sm:text-base">
                {Object.entries(report.llmInsights.skillProficiency).map(([skill, level]) => (
                  <div key={skill} className={`flex flex-col items-center p-3 rounded-md border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-inner`}>
                    <span className={`font-medium ${textColorSecondary}`}>{skill}</span>
                    <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1`}>{level}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Grouped Insights: Misconceptions, Trend, Readiness, Recommendations, Suggestions, Approach */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {report.llmInsights?.technicalConceptMisconceptions && report.llmInsights.technicalConceptMisconceptions.length > 0 && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-orange-700 bg-gray-800' : 'border-orange-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Common Misconceptions:</h4>
                <ul className={`list-disc pl-5 space-y-1 text-sm ${textColorSecondary}`}>
                  {report.llmInsights.technicalConceptMisconceptions.map((item, index) => (<li key={`misconception-${index}`}>{item}</li>))}
                </ul>
              </motion.div>
            )}

            {report.llmInsights?.performanceTrend && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-purple-700 bg-gray-800' : 'border-purple-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Performance Trend:</h4>
                <p className={`leading-relaxed text-sm ${textColorSecondary}`}>{report.llmInsights.performanceTrend}</p>
              </motion.div>
            )}

            {report.llmInsights?.readinessForRole && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-teal-700 bg-gray-800' : 'border-teal-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>Readiness for Role:</h4>
                <p className={`leading-relaxed text-sm ${textColorSecondary}`}>{report.llmInsights.readinessForRole}</p>
              </motion.div>
            )}

            {report.llmInsights?.personalizedLearningRecommendations && report.llmInsights.personalizedLearningRecommendations.length > 0 && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-yellow-700 bg-gray-800' : 'border-yellow-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Learning Recommendations:</h4>
                <ul className={`list-disc pl-5 space-y-1 text-sm ${textColorSecondary}`}>
                  {report.llmInsights.personalizedLearningRecommendations.map((item, index) => (<li key={`rec-${index}`}>{item}</li>))}
                </ul>
              </motion.div>
            )}

            {report.llmInsights?.suggestions?.length > 0 && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-cyan-700 bg-gray-800' : 'border-cyan-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>General Suggestions:</h4>
                <ul className={`list-disc pl-5 space-y-1 text-sm ${textColorSecondary}`}>
                  {report.llmInsights.suggestions.map((item, index) => (<li key={`gen-sugg-${index}`}>{item}</li>))}
                </ul>
              </motion.div>
            )}

            {report.llmInsights?.overallApproachAnalysis && (
              <motion.div variants={sectionVariants} className={`p-5 rounded-lg shadow-sm border ${isDark ? 'border-pink-700 bg-gray-800' : 'border-pink-200 bg-white'}`}>
                <h4 className={`font-semibold text-lg sm:text-xl mb-2 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Overall Approach Analysis:</h4>
                <p className={`leading-relaxed text-sm ${textColorSecondary}`}>{report.llmInsights.overallApproachAnalysis}</p>
              </motion.div>
            )}
          </motion.div>

          {/* NEW CARD: Strict Timetable & Daily Progress Tracker - The "Special" Card */}
          <motion.div
            variants={sectionVariants}
            className={`${specialCardGradient} text-white rounded-xl shadow-lg p-6 sm:p-8 text-center border border-teal-400 dark:border-cyan-700`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center justify-center">
              <i className="fas fa-clock mr-3 text-white text-xl sm:text-2xl"></i>
              Unlock Your Potential with Structured Learning!
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-5">
              Ready to take control of your study schedule and monitor your growth?
              Follow a strict timetable and track your daily progress to achieve your goals effectively.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className={`inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 border border-white text-sm sm:text-base font-semibold rounded-full shadow-md text-teal-800 bg-white ${specialCardGradientHover} focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600 transition-colors duration-300`}
              onClick={() => router.push('/dashboard/timetable')} // Example route
            >
              Start Tracking Progress <i className="fas fa-arrow-right ml-2"></i>
            </motion.button>
          </motion.div>

          {/* Final Call to Action */}
          <motion.div
            variants={sectionVariants}
            className={`text-center rounded-xl shadow-md p-6 ${isDark ? 'bg-gradient-to-r from-purple-700 to-indigo-800' : 'bg-gradient-to-r from-purple-600 to-indigo-700'} text-white`}
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-3">Ready to Polish Your Skills?</h3>
            <p className="text-sm sm:text-base mb-4 opacity-90">
              Enhance your understanding and accelerate your learning journey with advanced tools.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className={`inline-flex items-center justify-center px-5 py-2 sm:px-6 sm:py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-300`}
            >
              Explore Premium Features <i className="fas fa-arrow-right ml-2"></i>
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </AppLayout>
  );
}