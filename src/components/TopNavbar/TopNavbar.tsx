// src/components/TopNavbar/TopNavbar.tsx
'use client';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FaPlus } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';

interface TopNavbarProps {
    toggleMobileSidebar: () => void;
    // Add className and style to the props interface
    className?: string; // Make className optional
    style?: React.CSSProperties; // Make style optional and use React.CSSProperties type
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleMobileSidebar, className, style }) => {
    const theme = useSelector((state: RootState) => state.theme.theme);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className={`fixed top-0 left-0 w-full  flex items-center justify-between h-16 px-4
                ${theme === 'dark'
                    ? 'bg-gray-900'
                    : 'bg-white'}
                transition-colors duration-300`}
        >
            {/* Left Section - SkillSense.AI Logo and Mobile Sidebar Toggle (Hamburger) */}
            <div className="flex items-center gap-4">
                {/* Mobile Hamburger Icon (visible on small screens) */}
                <motion.button
                    onClick={toggleMobileSidebar}
                    className={`lg:hidden p-2 rounded-lg transition-colors duration-200
                        ${theme === 'dark'
                            ? 'hover:bg-gray-700/50 text-gray-300'
                            : 'hover:bg-gray-200/50 text-gray-600'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle mobile sidebar"
                >
                    <FiMenu className="w-6 h-6" />
                </motion.button>

                {/* SkillSense.AI Text Logo with Slogan */}
                <motion.div
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <span className={`text-2xl font-extrabold whitespace-nowrap leading-none
                        ${theme === 'dark'
                            ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-transparent bg-clip-text'
                            : 'bg-gradient-to-r from-blue-700 to-indigo-900 text-transparent bg-clip-text'
                        }`}>
                        SkillSense.AI
                    </span>
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`text-xs sm:text-sm font-medium whitespace-nowrap mt-0.5
                            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Decode Skills, Develop Success
                    </motion.span>
                </motion.div>
            </div>

            {/* Right Section - Upgrade Button */}
            <div className="flex items-center gap-4">
                <motion.button
                    className={`hidden sm:flex items-center px-5 py-2.5 rounded-full gap-2 font-semibold text-sm
                        bg-gradient-to-br from-indigo-500 to-purple-600 text-white
                        shadow-lg shadow-indigo-500/30
                        hover:from-indigo-600 hover:to-purple-700
                        hover:shadow-xl hover:shadow-indigo-600/40
                        transition-all duration-300 ease-in-out cursor-pointer`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaPlus className="text-base" /> {/* Slightly larger icon for impact */}
                    <span className="leading-none">Upgrade</span> {/* Ensure text doesn't affect icon alignment */}
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default TopNavbar;