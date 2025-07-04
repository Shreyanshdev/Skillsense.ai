"use client";

import React from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const TopContent :React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isDark = theme === 'dark';
  return (
    <div className={`flex items-center justify-between p-4 ${isDark ? ''  : ''} `}>
        <h1 className={`text-xl flex  items-center gap-4 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className={`w-16 h-16 rounded-full bg-gray-300 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
            </div>
            Your Name
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>@username</span>
            
        </h1>
        <div className="flex items-center space-x-4">
            <button className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
            Edit Profile
            </button>
            <button className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
            Settings
            </button>
        </div>
    </div>

  )
}

export default TopContent