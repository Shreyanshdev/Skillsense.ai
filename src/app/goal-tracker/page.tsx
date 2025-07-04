// src/app/goal-tracker/page.tsx
'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import GoalSetup from '@/components/Goal-tracker/GoalSetup';

// Placeholder component for your Goal Tracker content
const GoalTrackerContent = () => {
     const theme = useSelector((state: RootState) => state.theme.theme);
    return (
        <div className={`p-8 rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800/80 text-gray-100' : 'bg-white/80 text-gray-800'} backdrop-blur-lg`}>
            <h2 className="text-2xl font-bold mb-4">Goal Tracker (Coming Soon)</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                This is where your goal tracking features will go.
            </p>
        </div>
    );
};


export default function GoalTrackerPage() {
  
  return (
    <AppLayout>
      <GoalSetup isDark/>
    </AppLayout>
  );
}
