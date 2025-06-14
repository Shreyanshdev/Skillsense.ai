// src/app/billing/page.tsx (or wherever your billing component resides)

'use client';

import React from 'react';
import { PricingTable } from '@clerk/nextjs';
import AppLayout from '@/components/Layout/AppLayout'; // Import your AppLayout
import { useSelector } from 'react-redux'; // To access theme state
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion'; // For animations
import PricingSection from '@/components/Landing/PricingSection';



function BillingPage() { 
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    // Wrap the billing page content with AppLayout
    <AppLayout>
          <PricingSection isDark={theme === 'dark'} />
    </AppLayout>
  );
}

export default BillingPage;