// src/components/TopNavbar/TopNavbar.tsx
'use client';

import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { FaQuestionCircle, FaPlus, FaMoon, FaSun } from 'react-icons/fa';

interface TopNavbarProps {
    toggleSidebar: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const dispatch = useDispatch();

    return (
        <motion.nav
            className={`fixed top-0 w-full z-30 flex items-center justify-between px-4 h-16 backdrop-blur-lg
                ${theme === 'dark' 
                    ? 'bg-gray-800/30 border-b border-gray-700' 
                    : 'bg-white/30 border-b border-gray-200'}`}
        >
            {/* Left Section - Sidebar Toggle */}
            <motion.button
                onClick={toggleSidebar}
                className={`p-3 rounded-xl ${
                    theme === 'dark' 
                        ? 'hover:bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-200/50 text-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <motion.div
                        className={`w-5 h-0.5 rounded-full ${
                            theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'
                        }`}
                        animate={{
                            rotate: [0, 180],
                            y: [-0.25, 0.25]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: 'mirror'
                        }}
                    />
                </div>
            </motion.button>

            {/* Right Section - Buttons */}
            <div className="flex items-center gap-4">
                <motion.button
                    className={`flex items-center px-4 py-2 rounded-xl gap-2 transition-colors
                        ${theme === 'dark'
                            ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaPlus className="text-lg" />
                    <span className="text-sm font-medium">New Analysis</span>
                </motion.button>

                <motion.button
                    className={`flex items-center px-4 py-2 rounded-xl gap-2
                        ${theme === 'dark'
                            ? 'bg-sky-800/30 text-sky-300 hover:bg-sky-700/50'
                            : 'bg-sky-100 text-sky-600 hover:bg-sky-200'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaQuestionCircle className="text-lg" />
                    <span className="text-sm font-medium">Get Analysis</span>
                </motion.button>

                
            </div>
        </motion.nav>
    );
};

export default TopNavbar;