import { motion } from 'framer-motion';
import React from 'react';

export const ProgressBar = ({
  value,
  className,
  indicatorClass
}: {
  value: number
  className?: string
  indicatorClass?: string
}) => (
  <div className={`relative overflow-hidden rounded-full ${className}`}>
    <div className="absolute inset-0 bg-gray-200/30 dark:bg-gray-700/30" />
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className={`relative h-full rounded-full ${indicatorClass}`}
    />
  </div>
);