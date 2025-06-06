// src/app/dashboard/page.tsx (or wherever your Dashboard component resides)

'use client'; // This is important for client-side functionality and hooks

import React from 'react';
import { WelcomeBanner } from '@/components/Dashboard/WelcomeBanner';
import AppLayout from '@/components/Layout/AppLayout'; // Assuming this handles the main layout and theme provider
import { AiTools } from '@/components/Dashboard/AiTools';
import { History } from '@/components/Dashboard/History';
import { useSelector } from 'react-redux'; // Assuming Redux for theme state
import { RootState } from '@/redux/store'; // Adjust path as per your Redux store setup
import { motion } from 'framer-motion';

function Dashboard() {
  const theme = useSelector((state: RootState) => state.theme.theme); // Get theme from Redux

  return (
    // The main container for the dashboard content, adapting to theme
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* AppLayout should ideally contain the Navbar and theme context */}
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8 space-y-8" // Max-width container with padding and spacing
        >
          <WelcomeBanner />
          <AiTools />
          <History />
          {/* Add more components or sections as needed */}
        </motion.div>
      </AppLayout>
    </div>
  );
}

export default Dashboard;