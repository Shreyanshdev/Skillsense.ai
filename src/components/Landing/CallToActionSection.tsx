// src/components/landing/CallToActionSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

interface CallToActionSectionProps {
  isDark: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ isDark }) => {
  return (
    <section className="py-24 sm:py-32">
      <div className="relative max-w-7xl mx-auto px-6 overflow-hidden">
        <div className="absolute -left-16 -top-16 -z-10">
          <div className={`h-32 w-32 rounded-full ${
            isDark ? 'bg-sky-900/20' : 'bg-sky-100'
          } blur-3xl`} />
        </div>
        <div className="absolute -right-16 -bottom-16 -z-10">
          <div className={`h-32 w-32 rounded-full ${
            isDark ? 'bg-blue-900/20' : 'bg-blue-100'
          } blur-3xl`} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`mx-auto max-w-2xl rounded-3xl p-8 text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}
        >
          <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to transform your career?
          </h2>
          <p className={`mx-auto mt-6 max-w-xl text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of students who accelerated their careers with SkillSense.AI
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-x-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-sky-500/30 transition-all"
            >
              Get Started Free <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-x-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-full border-2 ${
                    isDark ? 'border-gray-800' : 'border-white'
                  }`}
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10})`,
                    backgroundSize: 'cover',
                    zIndex: 5 - i
                  }}
                />
              ))}
            </div>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Join 5,000+ students today
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;