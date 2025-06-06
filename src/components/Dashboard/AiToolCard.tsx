// src/components/Dashboard/AiToolCard.tsx

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi'; // For the button icon
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface AiToolCardProps {
  name: string;
  desc: string;
  icon: string;
  buttonText: string; // Renamed from 'button' to 'buttonText' for clarity
  path: string;
}

type AiToolProps = {
  tool: AiToolCardProps;
};

export const AiToolCard = ({ tool }: AiToolProps) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: theme === 'dark' ? '0 10px 15px rgba(0,0,0,0.3)' : '0 10px 15px rgba(0,0,0,0.1)' }}
      className={`flex flex-col p-6 rounded-2xl transition-all duration-300 ease-out shadow-md
                  ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg mb-4
                       ${theme === 'dark' ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
        <Image src={tool.icon} alt={tool.name} width={28} height={28} /> {/* Smaller icon size for card */}
      </div>

      <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {tool.name}
      </h2>
      <p className={`text-base mb-4 flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {tool.desc}
      </p>

      <Link href={tool.path} passHref>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-x-2 rounded-full
                     bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white
                     shadow-lg hover:shadow-sky-500/30 transition-all duration-300 ease-out cursor-pointer"
        >
          {tool.buttonText} <FiArrowRight className="w-4 h-4" />
        </motion.button>
      </Link>
    </motion.div>
  );
};