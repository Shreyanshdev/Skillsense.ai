// src/components/FixedBottomIcons/FixedBottomIcons.tsx
// Renders fixed icons at the bottom-left, visible when sidebar is collapsed on desktop

'use client'; // Needs client-side features

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store'; // Update path if needed
import { toggleTheme } from '@/redux/slices/themeSlice'; // Update path if needed
import { FaCog, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa'; // Icons

interface FixedBottomIconsProps {
    isSidebarOpen: boolean; // State from AppLayout indicating if the sidebar is fully open (mobile or desktop hover)
}

const FixedBottomIcons: React.FC<FixedBottomIconsProps> = ({ isSidebarOpen }) => {
    const theme = useSelector((state: RootState) => state.theme.theme); // Get theme
    const dispatch = useDispatch(); // For theme toggle

    // Placeholder handlers for icons
    const handleSettingsClick = () => {
        alert('Settings clicked!');
        // Implement actual settings logic or routing
    };

    const handleThemeToggle = () => {
        dispatch(toggleTheme()); // Dispatch Redux action
    };

    const handleLogoutClick = () => {
        alert('Logout clicked!');
        // Implement actual logout logic or routing
    };

    return (
        // Fixed position, bottom-left, z-index
        // Visible on lg+ screens AND when sidebar is NOT open (mobile or desktop hover)
        <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: isSidebarOpen ? 0 : 1 }} // Fade in/out based on sidebar state
             transition={{ duration: 0.3 }}
             className={`fixed bottom-4 left-4 z-30 flex-col items-center space-y-4 transition-opacity duration-300
                         hidden lg:flex ${isSidebarOpen ? 'pointer-events-none' : ''}`} // Hide on mobile, hide clicks when fading out
        >
            {/* Settings Icon */}
            <button
               onClick={handleSettingsClick}
               className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
               aria-label="Settings"
            >
               <FaCog size={20} />
            </button>
            {/* Theme Toggle Icon */}
             <button
               onClick={handleThemeToggle}
               className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
               aria-label="Toggle theme"
           >
               {theme === 'dark' ? <FaSun size={20} className="text-yellow-400" /> : <FaMoon size={20} className="text-blue-600" />}
           </button>
            {/* Logout Icon */}
            <button
               onClick={handleLogoutClick}
               className={`p-2 rounded-full transition-colors text-red-500 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                aria-label="Logout"
            >
                <FaSignOutAlt size={20} />
            </button>
        </motion.div>
    );
};

export default FixedBottomIcons;
