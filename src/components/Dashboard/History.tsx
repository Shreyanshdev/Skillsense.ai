'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { FaSearch, FaSpinner, FaWindowRestore } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import api from '@/services/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { Map, FileText, Bot, ClipboardCheck } from 'lucide-react';

const PAGE_SIZE = 15;

interface HistoryItem {
  id: number;
  recordId: string;
  content: any;
  userEmail: string;
  createdAt: string;
  aiAgentType: string;
  metadata: any;
}

export const History = () => {
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const sectionBgClass = isDark ? 'bg-gradient-to-br from-gray-900 via-transparent to-gray-900' : 'bg-gradient-to-br from-white via-blue-50 to-sky-100';
  const sectionBorderClass = isDark ? 'border-gray-700/50' : 'border-gray-300/50';
  const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const sectionShadowClass = 'shadow-2xl backdrop-blur-xl';
  const primaryButtonGradient = 'bg-gradient-to-r from-sky-500 to-blue-600';
  const primaryButtonShadow = 'shadow-md hover:shadow-blue-500/50';

  const getTypeLabel = (type: string) =>
    type.replace('/', '')
        .replace('Ai', '')
        .replace('Agent', '')
        .replace('career-roadmap-generator', 'Roadmap')
        .replace('resume-analyzer', 'Resume')
        .replace('cover-letter-generator', 'Cover Letter')
        .replace('final-report', 'Evaluation');

  const getAgentInfo = (type: string, content: any, id: string) => {
    let icon = <Bot size={20} className="text-blue-400" />;
    let link = '#';
    let title = 'AI Interaction';
    let desc = 'View details';

    switch (type) {
      case '/ai-chat':
        link = `/ai-chat/${id}`;
        title = 'Career Chat AI';
        desc = content?.[0]?.content?.slice(0, 50) + '...';
        break;
      case '/ai-resume-analyzer':
        link = `/ai-resume-analyzer/${id}`;
        icon = <FileText size={20} className="text-red-400" />;
        title = 'Resume Analysis';
        desc = content?.metadata?.fileName || 'Resume analysis';
        break;
      case '/ai-roadmap-generator':
        link = `/ai-roadmap-generator/${id}`;
        icon = <Map size={20} className="text-orange-400" />;
        title = content?.flowRoadmap?.roadmapTitle || 'Roadmap';
        desc = content?.flowRoadmap?.description?.split('\n')[0] + '...' || 'Career path.';
        break;
      case '/cover-letter-generator':
        link = `/cover-letter-generator/${id}`;
        icon = <ClipboardCheck size={20} className="text-yellow-400" />;
        title = 'Cover Letter';
        desc = content?.metadata?.jobTitle || 'Generated cover letter.';
        break;
      case '/final-report':
        link = `/final-report/${id}`;
        icon = <ClipboardCheck size={20} className="text-green-400" />;
        title = 'Evaluation Result';
        desc = content?.summary || 'Evaluation summary';
        break;
      default:
        break;
    }

    return { icon, linkPath: link, title, description: desc };
  };

  const getHistory = async (offset: number, append: boolean) => {
    append ? setLoadingMore(true) : setLoadingHistory(true);
    try {
      const res = await api.get('/history', { params: { limit: PAGE_SIZE, offset } });
      const newData = res.data as HistoryItem[];
      const sortedData = [...newData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserHistory(prev => append ? [...prev, ...sortedData] : sortedData);
      setCurrentPage(offset + PAGE_SIZE);
      setHasMore(newData.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoadingHistory(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    getHistory(0, false);
  }, []);

  const emptyBoxVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`p-6 md:p-8 rounded-2xl ${sectionShadowClass} ${sectionBgClass} border ${sectionBorderClass}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <motion.h2 className={`text-2xl font-bold mb-1 ${textColorPrimary}`}>History Overview</motion.h2>
          <motion.p className={`text-sm ${textColorSecondary}`}>Your recent AI interactions & outputs</motion.p>
        </div>
        <div className="flex w-full md:w-1/2 gap-2">
          <div className="relative flex-1">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by type or title"
              className={`w-full rounded-xl border ${sectionBorderClass} px-4 py-2 text-sm ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'} focus:ring-2 focus:ring-sky-500`}
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500" />
          </div>
          <button
            onClick={() => { setSearchTerm(''); getHistory(0, false); }}
            className={`px-3 py-2 rounded-xl text-sm text-white ${primaryButtonGradient} ${primaryButtonShadow}`}
          >
            {loadingHistory ? <FaSpinner className="animate-spin" /> : <FaWindowRestore />}
          </button>
        </div>
      </div>

      {loadingHistory ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-2xl text-sky-400" />
        </div>
      ) : userHistory.length === 0 ? (
        <motion.div
          variants={emptyBoxVariants}
          initial="hidden"
          animate="visible"
          className={`mt-8 p-6 rounded-xl border text-center ${sectionBorderClass} ${isDark ? 'bg-gray-900/40' : 'bg-white/40'}`}
        >
          <Image src="/idea.png" width={80} height={80} alt="empty" className="mx-auto mb-4 animate-pulse-slow" />
          <p className={`text-lg font-semibold ${textColorPrimary}`}>No History Yet</p>
          <p className={`text-sm mt-1 mb-4 ${textColorSecondary}`}>Start using AI tools to see your journey appear here.</p>
          <button className={`px-5 py-2 rounded-full text-white text-sm ${primaryButtonGradient} ${primaryButtonShadow}`}>Start Now</button>
        </motion.div>
      ) : (
        <div className="mt-6 space-y-4">
          {userHistory.filter(item => {
            const { title, description } = getAgentInfo(item.aiAgentType, item.content, item.recordId);
            const typeLabel = getTypeLabel(item.aiAgentType);
            return (
              title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              typeLabel.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }).map(item => {
            const { icon, linkPath, title, description } = getAgentInfo(item.aiAgentType, item.content, item.recordId);
            const label = getTypeLabel(item.aiAgentType);

            return (
              <Link href={linkPath} key={item.id} className={`block rounded-xl p-4 border ${sectionBorderClass} ${isDark ? 'bg-gray-800/60 hover:bg-gray-700/60' : 'bg-white hover:bg-gray-100'} transition-all`}>
                <div className="flex flex-col md:flex-row justify-between gap-2 items-start md:items-center">
                  <div className="flex items-start gap-3">
                    {icon}
                    <div>
                      <h3 className={`font-semibold text-base ${textColorPrimary}`}>{title}</h3>
                      <p className={`text-sm ${textColorSecondary}`}>{description}</p>
                      <p className="text-xs mt-1 text-sky-400">{label}</p>
                    </div>
                  </div>
                  <p className={`text-sm ${textColorSecondary}`}>{format(new Date(item.createdAt), 'PPpp')}</p>
                </div>
              </Link>
            );
          })}
          {hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={() => getHistory(currentPage, true)}
                disabled={loadingMore}
                className={`px-6 py-2 rounded-full text-sm text-white ${primaryButtonGradient} ${primaryButtonShadow} ${loadingMore ? 'opacity-60' : ''}`}
              >
                {loadingMore ? <><FaSpinner className="animate-spin" /> Loading...</> : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};