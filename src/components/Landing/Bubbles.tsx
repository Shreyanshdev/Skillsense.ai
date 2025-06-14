// src/components/landing/Bubbles.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BubblesProps {
  isDark: boolean; // Use isDark directly for theme consistency
}

const Bubbles: React.FC<BubblesProps> = ({ isDark }) => {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 10 }).map(() => {
        const size = Math.random() * 100 + 50;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const xInitial = Math.random() * 100;
        const xAnimate = Math.random() * 100 - 50;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;
        return { size, left, top, xInitial, xAnimate, duration, delay };
      }),
    []
  );

  return (
    <>
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, x: bubble.xInitial }}
          animate={{ y: [0, -100, -200, -300], x: [0, bubble.xAnimate], opacity: [1, 0.8, 0.5, 0] }}
          transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay }}
          className={`absolute rounded-full ${
            isDark ? 'bg-sky-900/20 border border-sky-800/30' : 'bg-sky-200/50 border border-sky-300/50'
          }`}
          style={{ width: `${bubble.size}px`, height: `${bubble.size}px`, left: `${bubble.left}%`, top: `${bubble.top}%` }}
        />
      ))}
    </>
  );
};

export default Bubbles;