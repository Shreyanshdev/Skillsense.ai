// src/components/RoadmapDisplay/TurboNode.tsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { FlowNodeData } from '@/types/roadmap'; // Adjust path as needed
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface TurboNodeProps {
  data: FlowNodeData;
}

const TurboNode: React.FC<TurboNodeProps> = ({ data }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const nodeBgClass = isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200';
  const textColorClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const subTextColorClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const handleBgClass = isDark ? 'bg-blue-500' : 'bg-blue-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 rounded-xl shadow-lg backdrop-blur-md min-w-[200px] max-w-[280px]
                  ${nodeBgClass} border ${textColorClass}`}
      style={{
        boxShadow: isDark ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} className={`${handleBgClass} w-3 h-3 border-none`} />

      <div className="flex items-center mb-2">
        <Lightbulb size={20} className="text-yellow-400 mr-2" />
        <h3 className="font-semibold text-lg">{data.title}</h3>
      </div>
      <p className={`${subTextColorClass} text-sm mb-3 line-clamp-3`}>
        {data.description}
      </p>
      {data.link && (
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Learn More <ExternalLink size={14} className="ml-1" />
        </a>
      )}

      <Handle type="source" position={Position.Bottom} className={`${handleBgClass} w-3 h-3 border-none`} />
    </motion.div>
  );
};

export default memo(TurboNode);