// src/components/ResumeAnalyzer.tsx
// (No changes to existing imports, just adding ResumeChatbot)
"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "@/redux/slices/themeSlice";
// NEW IMPORT
import { ResumeChatbot } from "./ResumeChatbot";

function ResumeAnalyzer({ aiReport, pdfUrl }: any) {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: any) => state.theme.theme);
  const isDark = currentTheme === "dark";

  // Theme-based text and background colors
  const textColorPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textColorSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const bgColorPrimary = isDark
    ? "bg-gray-900/40 backdrop-blur-lg" // Dark transparent with blur
    : "bg-white/40 backdrop-blur-lg";
  const bgColorSecondary = isDark ? "bg-gray-850" : "bg-gray-100"; // Card background
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  // const shadowColor = isDark ? 'shadow-gray-700/50' : 'shadow-gray-300/50'; // Not used in this version

  // Sky-blue gradient for primary actions/highlights
  const primaryGradient = "bg-gradient-to-r from-sky-500 to-blue-600";
  const primaryGradientHover = "hover:from-sky-600 hover:to-blue-700";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const getSectionStyles = (score: number) => {
    if (score >= 90)
      return {
        textColor: "text-green-500",
        bgColor: isDark ? "bg-green-900/50" : "bg-green-100/50",
        borderColor: isDark ? "border-green-700" : "border-green-300",
        barColor: "bg-green-500",
      };
    if (score >= 80)
      return {
        textColor: "text-blue-500",
        bgColor: isDark ? "bg-blue-900/50" : "bg-blue-100/50",
        borderColor: isDark ? "border-blue-700" : "border-blue-300",
        barColor: "bg-blue-500",
      };
    if (score >= 70)
      return {
        textColor: "text-yellow-500",
        bgColor: isDark ? "bg-yellow-800/50" : "bg-yellow-100/50",
        borderColor: isDark ? "border-yellow-600" : "border-yellow-300",
        barColor: "bg-yellow-500",
      };
    return {
      textColor: "text-red-500",
      bgColor: isDark ? "bg-red-900/50" : "bg-red-100/50",
      borderColor: isDark ? "border-red-700" : "border-red-300",
      barColor: "bg-red-500",
    };
  };

  const getOverallRating = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "text-green-500" };
    if (score >= 80) return { text: "Good", color: "text-blue-500" };
    if (score >= 70) return { text: "Fair", color: "text-yellow-500" };
    if (score >= 60) return { text: "Needs Work", color: "text-orange-500" };
    return { text: "Poor", color: "text-red-500" };
  };

  const overallRating = getOverallRating(aiReport?.overall_score || 0);

  const sections = [
    { key: "contact_info", title: "Contact Info", icon: "fas fa-user-circle" },
    { key: "experience", title: "Experience", icon: "fas fa-briefcase" },
    { key: "education", title: "Education", icon: "fas fa-graduation-cap" },
    { key: "skills", title: "Skills", icon: "fas fa-lightbulb" },
    {
      key: "formatting_and_design",
      title: "Formatting & Design",
      icon: "fas fa-paint-brush",
    },
    { key: "projects", title: "Projects", icon: "fas fa-code" },
    { key: "job_alignment", title: "Job Alignment", icon: "fas fa-bullseye" },
    {
      key: "tone_and_language",
      title: "Tone & Language",
      icon: "fas fa-comments",
    },
    { key: "ats_compatibility", title: "ATS Compatibility", icon: "fas fa-robot" },
  ];

  const renderList = (items: string[], type: "good" | "bad") => (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, index) => (
        <li
          key={index}
          className={`${textColorSecondary} text-sm ${
            type === "good" ? "marker:text-green-500" : "marker:text-red-500"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className={`font-inter ${bgColorPrimary} ${textColorPrimary} min-h-screen`}>
      <div className="container mx-auto p-6 sm:p-8 lg:p-10 max-w-7xl">
        {/* Header and Theme Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1
            className={`text-3xl sm:text-4xl font-bold text-transparent bg-clip-text ${primaryGradient}`}
          >
            Resume AI Analyzer
          </h1>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-full shadow-md ${primaryGradient} ${primaryGradientHover} focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300`}
            >
              Re-analyze <i className="fa-solid fa-sync ml-2"></i>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full ${bgColorSecondary} ${textColorSecondary} shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300`}
            >
              <i className={`fas ${isDark ? "fa-sun" : "fa-moon"} text-lg`}></i>
            </motion.button>
          </div>
        </div>

        {/* Main Content Grid: Adjusted for PDF Preview Card and Analysis Results */}
        {/* Using flex for better control over space distribution within the grid column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Preview Section - Now a dedicated card within its own column */}
          <motion.div
            className="lg:col-span-1" // This div takes 1/3 column space on large screens
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Resume Preview Card */}
            <div
              className={`${bgColorSecondary} rounded-xl shadow-md p-4 border ${borderColor} flex flex-col items-center sticky top-4 lg:max-h-[calc(100vh-100px)] overflow-hidden`}
            >
              <h2 className={`font-semibold text-xl ${textColorPrimary} mb-3`}>
                Resume Preview
              </h2>
              {/* PDF Viewer Container - Adjusted width and aspect ratio */}
              <div className="w-full h-full max-w-sm lg:max-w-none lg:w-auto aspect-[8.5/11] rounded-md overflow-hidden shadow-inner flex-grow">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
                    className="w-full h-full border-none"
                    title="Resume Preview"
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center h-full w-full ${bgColorPrimary} rounded-md ${textColorSecondary} p-4 text-center`}
                  >
                    <p>No resume selected for preview.</p>
                  </div>
                )}
              </div>
            </div>
            {/* NEW: Chatbot will appear here, below the resume preview grid */}
            <ResumeChatbot />
          </motion.div>

          {/* AI Analysis Results - Occupies remaining 2/3 columns */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Overall Summary Card */}
            <motion.div
              variants={itemVariants}
              className={`${bgColorSecondary} rounded-xl shadow-md p-6 border ${borderColor} transition-all duration-200`}
            >
              <h3 className={`text-xl font-semibold ${textColorPrimary} mb-3`}>
                Summary
              </h3>
              <p className={`${textColorSecondary} mb-4 text-sm`}>
                {aiReport?.summary_comment || "No summary available."}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4
                    className={`text-lg font-semibold ${textColorPrimary} flex items-center`}
                  >
                    <i className="fas fa-star text-yellow-400 mr-2"></i>Overall
                    Score
                  </h4>
                  <div className="flex items-baseline">
                    <span
                      className={`text-4xl font-bold ${primaryGradient} bg-clip-text text-transparent leading-none`}
                    >
                      {aiReport?.overall_score || 0}
                    </span>
                    <span className={`text-xl ${textColorSecondary}`}>/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <i
                    className={`fas fa-arrow-alt-circle-up ${overallRating.color} text-xl mr-1`}
                  ></i>
                  <span className={`${overallRating.color} text-lg font-semibold`}>
                    {overallRating.text}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className={`${primaryGradient} h-2.5 rounded-full shadow-md`}
                  initial={{ width: 0 }}
                  animate={{ width: `${aiReport?.overall_score || 0}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                ></motion.div>
              </div>
              <p className={`${textColorSecondary} text-xs mt-2`}>
                {aiReport?.overall_feedback || "Your resume analysis is complete."}
              </p>

              {aiReport?.recommended_roles?.length > 0 && (
                <div className="mt-4">
                  <h4
                    className={`text-md font-semibold ${textColorPrimary} mb-2 flex items-center`}
                  >
                    <i className="fas fa-clipboard-list text-indigo-400 mr-2"></i>
                    Recommended Roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiReport.recommended_roles.map((role: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${primaryGradient} text-white shadow-sm`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Section Ratings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section) => {
                const sectionData = aiReport?.sections?.[section.key];
                if (!sectionData) return null;
                const styles = getSectionStyles(sectionData.score);

                return (
                  <motion.div
                    key={section.key}
                    variants={itemVariants}
                    className={`${bgColorSecondary} rounded-xl shadow-md p-4 border ${styles.borderColor}`}
                  >
                    <h4
                      className={`text-lg font-semibold ${textColorPrimary} mb-2 flex items-center`}
                    >
                      <i
                        className={`${section.icon} text-gray-500 dark:text-gray-400 mr-2 text-sm`}
                      ></i>
                      {section.title}
                    </h4>
                    <div className="flex items-baseline mb-2">
                      <span
                        className={`text-3xl font-bold ${styles.textColor} leading-none`}
                      >
                        {sectionData.score}%
                      </span>
                    </div>
                    <p className={`${textColorSecondary} text-xs mb-2`}>
                      {sectionData.comment || "Analysis complete."}
                    </p>
                    {sectionData.what_s_good?.length > 0 && (
                      <div className="mt-2">
                        <h5
                          className={`font-semibold text-green-500 text-sm mb-1 flex items-center`}
                        >
                          <i className="fas fa-check-circle mr-1"></i>Strengths
                        </h5>
                        {renderList(sectionData.what_s_good, "good")}
                      </div>
                    )}
                    {sectionData.needs_improvement?.length > 0 && (
                      <div className="mt-2">
                        <h5
                          className={`font-semibold text-red-500 text-sm mb-1 flex items-center`}
                        >
                          <i className="fas fa-exclamation-circle mr-1"></i>Improvement
                          Areas
                        </h5>
                        {renderList(sectionData.needs_improvement, "bad")}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Skills and Technologies */}
            <div className="space-y-4">
              {aiReport?.top_skills_extracted?.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className={`${bgColorSecondary} rounded-xl shadow-md p-4 border ${borderColor}`}
                >
                  <h3
                    className={`text-md font-semibold ${textColorPrimary} mb-2 flex items-center`}
                  >
                    <i className="fas fa-medal text-yellow-400 mr-2"></i>Top Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiReport.top_skills_extracted.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${primaryGradient} text-white shadow-sm`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {aiReport?.strongest_technologies?.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className={`${bgColorSecondary} rounded-xl shadow-md p-4 border ${borderColor}`}
                >
                  <h3
                    className={`text-md font-semibold ${textColorPrimary} mb-2 flex items-center`}
                  >
                    <i className="fas fa-bolt text-blue-400 mr-2"></i>Strongest
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiReport.strongest_technologies.map(
                      (tech: string, index: number) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${primaryGradient} text-white shadow-sm`}
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {aiReport?.missing_technologies_or_keywords?.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className={`${bgColorSecondary} rounded-xl shadow-md p-4 border ${borderColor}`}
                >
                  <h3
                    className={`text-md font-semibold ${textColorPrimary} mb-2 flex items-center`}
                  >
                    <i className="fas fa-exclamation-triangle text-orange-400 mr-2"></i>Missing
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiReport.missing_technologies_or_keywords.map(
                      (tech: string, index: number) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 shadow-sm`}
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actionable Tips */}
            {aiReport?.actionable_summary?.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`${bgColorSecondary} rounded-xl shadow-md p-6 border ${borderColor}`}
              >
                <h3
                  className={`text-xl font-semibold ${textColorPrimary} mb-3 flex items-center`}
                >
                  <i className="fas fa-lightbulb text-purple-400 mr-2"></i>Tips For
                  Improvement
                </h3>
                <ul className="list-none space-y-2">
                  {aiReport.actionable_summary.map((tip: string, index: number) => (
                    <li
                      key={index}
                      className={`flex items-start ${textColorSecondary} text-sm`}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full ${primaryGradient} text-white flex items-center justify-center font-bold text-xs mr-2`}
                      >
                        {index + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              variants={itemVariants}
              className={`text-center rounded-xl shadow-md p-6 ${primaryGradient} text-white`}
            >
              <h3 className="text-xl font-semibold mb-3">
                Ready to Polish Your Resume?
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Enhance your job application with our advanced analysis.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-full shadow-md text-${primaryGradient} bg-red-500 hover:bg-red-800 cursor-pointer transition-colors duration-300`}
              >
                Explore Premium Features <i className="fas fa-arrow-right ml-2"></i>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;