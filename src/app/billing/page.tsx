// src/app/billing/page.tsx (or wherever your billing component resides)

'use client';

import React from 'react';
import { PricingTable } from '@clerk/nextjs';
import AppLayout from '@/components/Layout/AppLayout'; // Import your AppLayout
import { useSelector } from 'react-redux'; // To access theme state
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion'; // For animations

function BillingPage() { 
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    // Wrap the billing page content with AppLayout
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`
          flex flex-col items-center min-h-[calc(100vh-4rem-64px)] // Adjust min-height to account for TopNavbar and Sidebar
          py-8 px-4 sm:px-6 lg:px-8 // Responsive padding
          ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} // Text color based on theme
        `}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-bold text-3xl sm:text-4xl mb-4 text-center"
        >
          Choose Your Plan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`text-lg mb-12 max-w-xl text-center
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          `}
        >
          Select a subscription bundle to get full access to all AI Tools.
        </motion.p>

        {/* Clerk's PricingTable component */}
        {/* Note: Styling of PricingTable itself depends on Clerk's customization options.
            Ensure your Clerk dashboard's branding settings are configured to match your theme. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-5xl" // Constrain width for better presentation on large screens
        >
          <PricingTable />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}

export default BillingPage;