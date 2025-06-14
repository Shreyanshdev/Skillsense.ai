// src/components/Dashboard/AiToolCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion'; // Added useMotionValue, useTransform
import { FiArrowRight } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ResumeUploadDialog } from '@/components/Dashboard/ResumeUpload'; // Assuming this is correct path to the dialog
import { RoadmapGenerateDialog } from './RoapMap';

interface AiToolCardProps {
  name: string;
  desc: string;
  icon: string;
  buttonText: string;
  path: string;
}

type AiToolProps = {
  tool: AiToolCardProps;
};

export const AiToolCard = ({ tool }: AiToolProps) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const router = useRouter();

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false);
  const [generatedRecordId, setGeneratedRecordId] = useState<string | null>(null);

  // Motion values for subtle mouse interaction
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  // Theme-based colors for the card
  const cardBgClass = isDark ? 'bg-gray-800/80' : 'bg-white/80'; // Slightly more transparent
  const cardHoverBgClass = isDark ? 'hover:bg-gray-700/90' : 'hover:bg-white/90';
  const cardBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const textColorPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textColorSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const iconBgClass = isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-100 text-sky-700'; // Slightly more prominent icon background
  const primaryButtonGradient = 'bg-gradient-to-r from-sky-500 to-blue-600';
  const primaryButtonShadow = 'shadow-lg hover:shadow-blue-500/50'; // More intense blue shadow on hover

  // New: Futuristic glowing border
  const borderGradient = isDark
    ? 'border-transparent group-hover:border-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' // Blue glow
    : 'border-transparent group-hover:border-violet-400 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]'; // Violet glow

  const onClickButton = async () => {
    if (tool.path === '/ai-resume-analyzer') {
      setIsUploadDialogOpen(true);
      return;
    }
    if(tool.path === '/ai-roadmap-generator') {
      setIsRoadmapDialogOpen(true);
      return;
    }


    const newRecordId = uuidv4();
    try {
      const result = await axios.post('/api/history', {
        recordId: newRecordId,
        content: [],
        aiAgentType: tool.path,
      });
      console.log("Initial history record created for tool:", result.data);
      router.push(tool.path + "/" + newRecordId);
    } catch (error) {
      console.error("Error creating initial history record or navigating:", error);
    }
  };

  const handleAnalysisSuccess = (recordId: string) => {
    setGeneratedRecordId(recordId);
    setIsUploadDialogOpen(false);
    router.push(`${tool.path}/${recordId}`);
  };

  const handleRoadmapGenerationSuccess = (roadmapId: string) => {
    setGeneratedRecordId(roadmapId);
    setIsRoadmapDialogOpen(false);
    router.push(`/ai-roadmap-generator/${roadmapId}`); // Navigate to the generated roadmap page
  };

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          scale: 1.03,
          boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.6)' : '0 12px 24px rgba(0,0,0,0.2)',
          rotateX: 0, // Reset these during initial hover to allow dynamic later
          rotateY: 0,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000, rotateX, rotateY }} // Apply perspective for 3D effect
        className={`group flex flex-col p-6 rounded-2xl transition-all duration-300 ease-out border ${cardBorderClass} ${cardBgClass} ${cardHoverBgClass} h-full overflow-hidden relative
                    ${borderGradient}`} // Add group for hover effect on children, and the glowing border
      >
        {/* Subtle background glow/animation on hover */}
        <motion.div
          className={`absolute inset-0 z-0 rounded-2xl transition-opacity duration-300
            ${isDark ? 'bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-transparent' : 'bg-gradient-to-br from-blue-100/10 via-purple-100/10 to-transparent'}
          `}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{ x, y }} // Background also reacts to mouse for depth
        />

        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-lg mb-4 ${iconBgClass}`}>
          <Image src={tool.icon} alt={tool.name} width={28} height={28} />
        </div>

        <h2 className={`relative z-10 text-xl font-semibold mb-2 ${textColorPrimary}`}>
          {tool.name}
        </h2>
        <p className={`relative z-10 text-base mb-4 flex-1 ${textColorSecondary}`}>
          {tool.desc}
        </p>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: isDark ? '0 0 15px rgba(59,130,246,0.6)' : '0 0 15px rgba(139,92,246,0.6)', // Button specific glow
          }}
          whileTap={{ scale: 0.95 }}
          className={`relative z-10 inline-flex items-center justify-center gap-x-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-300 ease-out cursor-pointer
                     ${primaryButtonGradient} ${primaryButtonShadow}`}
          onClick={onClickButton}
        >
          {tool.buttonText} <FiArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      <ResumeUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onAnalyzeSuccess={handleAnalysisSuccess}
      />

      <RoadmapGenerateDialog
      isOpen={isRoadmapDialogOpen}
      onClose={() => setIsRoadmapDialogOpen(false)}
      onGenerateSuccess={handleRoadmapGenerationSuccess}
    />
    </>
  );
};