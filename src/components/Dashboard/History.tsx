// src/components/Dashboard/History.tsx
'use client';

import React, { useEffect, useState } from 'react'; // Removed useMemo
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi'; // Removed FiSearch
import { FaSpinner } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import Link from 'next/link';
import { format } from 'date-fns';
import { Layers, Map, FileText, Bot, ClipboardCheck } from 'lucide-react';

const PAGE_SIZE = 15; // Number of items to load per request

// Define a type for your history item for better type safety
interface HistoryItem {
  id: number;
  recordId: string;
  content: any;
  userEmail: string;
  createdAt: string; // Ensure this is a string parsable by new Date()
  aiAgentType: string;
  metadata: any;
}

export const History = () => {
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true); // Initial full load spinner
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // Spinner for "Load More" button
  const [currentPage, setCurrentPage] = useState<number>(0); // Page offset for pagination
  const [hasMore, setHasMore] = useState<boolean>(true); // Whether there are more items to load
  // Removed: const [searchTerm, setSearchTerm] = useState<string>('');

  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    // Initial load
    getHistory(0, false); // Start from offset 0, not appending
  }, []);

  const getHistory = async (offset: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingHistory(true);
    }

    try {
      // Assuming your API endpoint supports limit and offset for pagination
      const result = await axios.get('/api/history', {
        params: {
          limit: PAGE_SIZE,
          offset: offset,
        },
      });

      const newItems: HistoryItem[] = result.data as any;

      setUserHistory(prevHistory => {
        const combined = append ? [...prevHistory, ...newItems] : newItems;
        // Sort explicitly by createdAt in descending order (latest first)
        // Ensure createdAt is a valid date string
        return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      setCurrentPage(offset + PAGE_SIZE);
      setHasMore(newItems.length === PAGE_SIZE); // If we received less than PAGE_SIZE, there are no more items

    } catch (error) {
      console.error("Failed to fetch history:", error);
      // Optionally, show a toast or error message
      setHasMore(false); // Stop trying to load more on error
    } finally {
      setLoadingHistory(false);
      setLoadingMore(false);
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      getHistory(currentPage, true); // Load next page, append to existing
    }
  };

  // Helper function to get agent-specific info for display (Moved to top as per previous fix)
  const getAgentInfo = (agentType: string, content: any, recordId: string) => {
    let linkPath = '';
    let icon = <Bot size={20} className="text-blue-400" />;
    let title = 'AI Interaction';
    let description = 'View details';

    switch (agentType) {
      case '/ai-chat':
        linkPath = `/ai-chat/${recordId}`;
        icon = <Bot size={20} className="text-blue-400" />;
        title = 'AI Career Q&A Chat';
        description = content?.[0]?.content?.substring(0, 50) + (content?.[0]?.content?.length > 50 ? '...' : '') || 'Conversation with AI.';
        break;
      case '/ai-resume-analyzer':
        linkPath = `/ai-resume-analyzer/${recordId}`;
        icon = <FileText size={20} className="text-orange-400" />;
        title = 'AI Resume Analysis';
        description = content?.metadata?.fileName || 'Analysis of your resume.';
        break;
      case '/ai-roadmap-generator':
        linkPath = `/ai-roadmap-generator/${recordId}`;
        icon = <Map size={20} className="text-green-400" />;
        title = content?.flowRoadmap?.roadmapTitle || 'AI Career Roadmap';
        description = content?.flowRoadmap?.description ? content.flowRoadmap.description.split('\n')[0] + '...' : 'Generated career path.';
        break;
      case '/cover-letter-generator':
        linkPath = `/cover-letter-generator/${recordId}`;
        icon = <ClipboardCheck size={20} className="text-purple-400" />;
        title = 'Cover Letter Generation';
        description = content?.metadata?.jobTitle || 'Generated a personalized cover letter.';
        break;
      case '/final-report':
        linkPath = `/final-report/${recordId}`;
        icon = <ClipboardCheck size={20} className="text-indigo-400" />;
        title = 'Evaluation Result';
        description = content?.summary || 'Detailed evaluation report.';
        break;
      default:
        linkPath = `#`;
        icon = <Layers size={20} className="text-gray-400" />;
        title = 'Unknown AI Tool';
        description = 'An interaction with an AI tool.';
        break;
    }
    return { linkPath, icon, title, description };
  };

  // Removed: const filteredHistory = useMemo(() => { ... });


  // Theme-based colors for the section container
  const sectionBgClass = isDark ? 'bg-gray-800/60' : 'bg-white/60';
  const sectionBorderClass = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const sectionShadowClass = 'shadow-2xl backdrop-blur-md';
  const primaryButtonGradient = 'bg-gradient-to-r from-sky-500 to-blue-600';
  const primaryButtonShadow = 'shadow-lg hover:shadow-blue-500/50';

  // Variants for the empty state box
  const emptyBoxVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-2xl ${sectionShadowClass} transition-colors duration-300 ${sectionBgClass} border ${sectionBorderClass}`}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`font-bold text-2xl mb-2 ${textColorPrimary}`}
      >
        Previous History
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-lg mb-6 ${textColorSecondary}`}
      >
        What you've previously worked on can be found here.
      </motion.p>

      {/* Removed Search Field UI */}

      {loadingHistory ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[150px]">
          <FaSpinner className={`animate-spin text-4xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`mt-4 ${textColorSecondary}`}>Loading history...</p>
        </div>
      ) : userHistory.length === 0 ? ( // Simplified empty state condition
        <motion.div
          variants={emptyBoxVariants}
          initial="hidden"
          animate="visible"
          className={`flex flex-col items-center justify-center p-8 rounded-lg border ${isDark ? 'border-gray-700/50 bg-gray-850/40' : 'border-gray-200/50 bg-gray-50/40'} backdrop-blur-sm`}
        >
          <Image
            src={'/idea.png'}
            alt={'idea bulb'}
            width={90}
            height={90}
            className='mx-auto my-5 opacity-80 animate-pulse-slow'
          />
          <h3 className={`text-xl font-semibold mb-2 ${textColorPrimary}`}>
            You don't have any history yet!
          </h3>
          <p className={`text-base text-center mb-4 ${textColorSecondary}`}>
            Start exploring our AI tools to generate your first career insights.
          </p>
          <motion.button
            onClick={() => { /* Add navigation or action to start using tools */ }}
            whileHover={{ scale: 1.05, boxShadow: isDark ? '0 0 15px rgba(59,130,246,0.6)' : '0 0 15px rgba(139,92,246,0.6)' }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-x-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out cursor-pointer
                       ${primaryButtonGradient} ${primaryButtonShadow}`}
          >
            Start Working on Something <FiArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 overflow-x-auto"
        >
          <div className="min-w-[500px] md:min-w-full">
            {/* Table Header */}
            <div className={`grid grid-cols-[1fr_2fr_1.5fr_1fr] md:grid-cols-[1.5fr_2fr_1.5fr_1fr] gap-4 p-4 rounded-t-lg font-semibold ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} ${textColorPrimary} text-sm md:text-base`}>
              <div className="hidden md:block">Type</div>
              <div>Title / Description</div>
              <div>Generated At</div>
              <div className="text-right">Action</div>
            </div>

            {/* History Items */}
            {userHistory.map((historyItem) => { // Changed from filteredHistory to userHistory
              const { linkPath, icon, title, description } = getAgentInfo(historyItem.aiAgentType, historyItem.content, historyItem.recordId);
              const hasSpecialBorder = [
                '/career-roadmap-generator',
                '/ai-resume-analyzer',
                '/cover-letter-generator',
                '/final-report'
              ].includes(historyItem.aiAgentType);

              return (
                <Link href={linkPath} key={historyItem.id} passHref>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`grid grid-cols-[1fr_2fr_1.5fr_1fr] md:grid-cols-[1.5fr_2fr_1.5fr_1fr] gap-4 p-4 mb-3 rounded-lg
                                ${isDark ? 'bg-gray-800/70 hover:bg-gray-700/70 border-gray-700' : 'bg-white/70 hover:bg-gray-100/70 border-gray-200'}
                                shadow-md transition-all duration-200 cursor-pointer group
                                ${hasSpecialBorder ? (isDark ? 'border-blue-500 border-2 shadow-blue-500/20' : 'border-blue-400 border-2 shadow-blue-400/20') : ''} `}
                  >
                    {/* Type - only visible on medium screens and up */}
                    <div className="hidden md:flex items-center gap-2">
                      {icon}
                      <span className={`${textColorSecondary} text-sm`}>
                        {(historyItem.aiAgentType ?? '').replace('/', '').replace('Ai', '').replace('Agent', '').replace('career-roadmap-generator', 'Roadmap').replace('resume-analyzer', 'Resume').replace('cover-letter-generator', 'Cover Letter').replace('final-report', 'Evaluation')}
                      </span>
                    </div>

                    {/* Title / Description */}
                    <div>
                      <h3 className={`font-semibold ${textColorPrimary}`}>{title}</h3>
                      <p className={`text-sm ${textColorSecondary} line-clamp-1`}>{description}</p>
                      <div className="md:hidden mt-1 flex items-center gap-2">
                          {icon}
                          <span className={`${textColorSecondary} text-xs`}>
                              {(historyItem.aiAgentType ?? '').replace('/', '').replace('Ai', '').replace('Agent', '').replace('career-roadmap-generator', 'Roadmap').replace('resume-analyzer', 'Resume').replace('cover-letter-generator', 'Cover Letter').replace('final-report', 'Evaluation')}
                          </span>
                      </div>
                    </div>

                    {/* Generated At */}
                    <div>
                      <p className={`${textColorSecondary} text-sm`}>
                        {format(new Date(historyItem.createdAt), 'MMM dd,yyyy HH:mm')}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end items-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center gap-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                                   ${isDark ? 'bg-blue-600 text-white group-hover:bg-blue-500' : 'bg-blue-500 text-white group-hover:bg-blue-600'}
                                   ${primaryButtonShadow}`}
                      >
                        View <FiArrowRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Load More Button - Now always visible if hasMore */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <motion.button
                onClick={handleLoadMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loadingMore}
                className={`inline-flex items-center gap-x-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out cursor-pointer
                           ${primaryButtonGradient} ${primaryButtonShadow}
                           ${loadingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loadingMore ? (
                  <>
                    <FaSpinner className="animate-spin" /> Loading More...
                  </>
                ) : (
                  <>
                    Load More <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};