'use client';

import { motion, AnimatePresence, Variant, Variants } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,         // Dashboard
  FiBarChart2,    // Evaluation
  FiTarget,       // Goal Tracker
  FiCreditCard,   // Billing
  FiSettings,     // Settings
  FiLogOut,       // Logout
  FiUser,         // User profile icon
  FiMoon, FiSun,  // Theme toggle
  FiChevronLeft,  // Collapse sidebar
  FiChevronRight, // Expand sidebar
  FiX             // Mobile close button
} from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  onSidebarWidthChange: (width: number) => void;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isDesktop: boolean;
  userEmail: string; // Add userEmail prop
  userName: string;  // Add userName prop
  loadingUser: boolean; // Add loadingUser prop
}

const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: <FiHome /> },
  { id: 'evaluation', name: 'Evaluation', icon: <FiBarChart2 /> },
  { id: 'goals', name: 'Goal Tracker', icon: <FiTarget /> },
  { id: 'billing', name: 'Billing', icon: <FiCreditCard /> },
];

const skillsenseTextVariants : Variants = {
  hidden: { opacity: 0, x: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 80,
      delay: 0.8,
    },
  },
  hover: { // Tilt and Shine on hover
    rotateY: 5,
    rotateX: -5,
    filter: ["brightness(1)", "brightness(1.5)", "brightness(1.0)"], // Shine effect
    transition: { duration: 0.5, ease: "easeInOut", filter: { repeat: Infinity, duration: 3, ease: "linear" } },
    perspective: 1000, // For 3D effect
  },
};

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  toggleMobileSidebar,
  onSidebarWidthChange,
  isPinned,
  setIsPinned,
  isDesktop,
  userEmail,
  userName,
  loadingUser,
}) => {
  const theme = useSelector((s: RootState) => s.theme.theme);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [isLocallyHovered, setIsLocallyHovered] = useState(false);
  const isOpen = (isDesktop && (isPinned || isLocallyHovered)) || isMobileOpen;

  const SIDEBAR_WIDTH_OPEN = 256;
  const SIDEBAR_WIDTH_CLOSED = 90;

  const updateSidebarWidth = useCallback(() => {
    const newWidth = isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;
    onSidebarWidthChange(newWidth);
  }, [isOpen, onSidebarWidthChange]);

  useEffect(() => {
    updateSidebarWidth();
  }, [isOpen, updateSidebarWidth]);

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned && isDesktop) {
      setIsLocallyHovered(false);
    }
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 overflow-hidden
    ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700' : 'bg-white/60 border-gray-200'}
    backdrop-filter backdrop-blur-lg
    border-r
    transition-transform duration-300 ease-in-out
    ${isDesktop ? '' : (isMobileOpen ? 'translate-x-0' : '-translate-x-full')}
    ${isDesktop ? 'shadow-lg' : 'shadow-2xl'}
  `;

  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };

  // Helper to get initials for the avatar
  const getUserInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMobileSidebar}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={sidebarClasses}
        initial={{ width: SIDEBAR_WIDTH_CLOSED }}
        animate={{ width: isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => isDesktop && !isPinned && setIsLocallyHovered(true)}
        onMouseLeave={() => isDesktop && !isPinned && setIsLocallyHovered(false)}
      >
        <div className="flex flex-col h-full pt-6 pb-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center px-4 mb-8">
            <motion.div
              className={`flex items-center ${isOpen ? 'justify-between w-full' : 'justify-center w-full'}`}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen && (
                <motion.h1
                className="text-2xl xl:text-xl sm:text-xl ml-3 font-extrabold leading-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-2xl"
                variants={skillsenseTextVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                SkillSense<span className="text-blue-400 ">.AI</span>
              </motion.h1>
              )}

              {(isMobileOpen || isDesktop) && (
                <motion.button
                  onClick={isDesktop ? togglePin : toggleMobileSidebar}
                  whileHover={{ scale: 1.1, rotate: isDesktop && isOpen ? -180 : (isDesktop ? 180 : 0) }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    p-2 rounded-full transition-colors duration-200 ml-auto
                    ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                    ${isDesktop && isPinned ? (theme === 'dark' ? 'text-sky-400' : 'text-blue-600') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}
                    text-xl
                  `}
                  aria-label={isDesktop ? (isPinned ? 'Collapse sidebar' : 'Expand sidebar') : 'Close sidebar'}
                >
                  {isDesktop ? (isOpen ? <FiChevronLeft /> : <FiChevronRight />) : <FiX />}
                </motion.button>
              )}
            </motion.div>
          </div>

          <div className="px-4 space-y-2 flex-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}`}
                passHref
              >
                <motion.div
                  className={`
                    group flex items-center
                    ${isOpen ? 'justify-start px-4 py-3' : 'justify-center p-3'}
                    rounded-2xl transition-all duration-300 relative overflow-hidden
                    ${
                      pathname.includes(item.id)
                        ? `${theme === 'dark' ? 'bg-sky-900/40 text-sky-400' : 'bg-sky-100 text-sky-700'} `
                        : `${theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-100'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`
                    }
                    ${isOpen ? '' : 'w-full'}
                  `}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {pathname.includes(item.id) && (
                      <motion.div
                          layoutId="active-pill"
                          className={`absolute inset-0 rounded-2xl -z-1 opacity-70
                              ${theme === 'dark' ? 'bg-gradient-to-r from-sky-700/30 to-blue-800/30' : 'bg-gradient-to-r from-sky-200/50 to-blue-200/50'}
                          `}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 50 }}
                      />
                  )}
                  <motion.span
                    className={`text-2xl shrink-0 z-10 ${pathname.includes(item.id) ? 'text-current' : ''}`}
                  >
                    {item.icon}
                  </motion.span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={textVariants}
                        className={`ml-4 text-base font-medium whitespace-nowrap overflow-hidden z-10`}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Profile & Actions */}
          <div className={`mt-auto px-4 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-3">
              {/* User Info - Display fetched data or loading placeholders */}
              <motion.div
                className={`flex items-center gap-3 py-3 rounded-2xl transition-colors duration-200
                          ${isOpen ? 'justify-start px-4' : 'justify-center p-3'}
                          ${theme === 'dark' ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gray-100 hover:bg-gray-200'}
                          cursor-pointer`}
                whileHover={{ scale: isOpen ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                  {loadingUser ? (
                    <div className="animate-pulse bg-gray-400/50 w-full h-full rounded-full"></div>
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {getUserInitials(userName)}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={textVariants}
                      className="flex-1 overflow-hidden"
                    >
                      {loadingUser ? (
                        <>
                          <div className="h-4 bg-gray-300/50 animate-pulse rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-300/50 animate-pulse rounded w-1/2"></div>
                        </>
                      ) : (
                        <>
                          <p className={`text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                            {userName || 'Loading User...'}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                            {userEmail || 'Loading Email...'}
                          </p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Settings, Theme Toggle, Logout Buttons */}
              {[
                { id: 'settings', name: 'Settings', icon: <FiSettings />, color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600', onClick: () => { /* Handle settings logic */ } },
                { id: 'theme', name: 'Switch Theme', icon: theme === 'dark' ? <FiMoon /> : <FiSun />, color: theme === 'dark' ? 'text-amber-300' : 'text-sky-600', onClick: () => dispatch(toggleTheme()) },
                { id: 'logout', name: 'Logout', icon: <FiLogOut />, color: theme === 'dark' ? 'text-red-400' : 'text-red-500',
                  onClick: async () => {
                    try {
                      const res = await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                      console.log('Logout status:', res.status);
                      const text = await res.text();
                      console.log('Raw response body:', text.slice(0, 200));

                      if (res.headers.get('content-type')?.includes('application/json')) {
                        const data = JSON.parse(text);
                        if (res.ok) {
                          console.log('Logout successful:', data.message);
                          window.location.href = '/login';
                        } else {
                          console.error('Logout failed:', data.message);
                        }
                      } else {
                        console.error('Expected JSON but got HTML/text:', text);
                        if (res.ok) {
                           window.location.href = '/login';
                        }
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }
                }
              ].map(btn => (
                <motion.button
                  key={btn.id}
                  onClick={btn.onClick}
                  className={`
                    w-full flex items-center py-3 rounded-2xl gap-3 transition-colors duration-200 cursor-pointer
                    ${isOpen ? 'justify-start px-4' : 'justify-center p-3'}
                    ${theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-100'}
                  `}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span className={`text-xl shrink-0 ${btn.color}`}>
                    {btn.icon}
                  </motion.span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={textVariants}
                        className={`text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis
                                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                                    ${btn.id === 'logout' ? 'text-red-500' : ''}`}
                      >
                        {btn.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Add PropTypes for validation
Sidebar.propTypes = {
  isMobileOpen: PropTypes.bool.isRequired,
  toggleMobileSidebar: PropTypes.func.isRequired,
  onSidebarWidthChange: PropTypes.func.isRequired,
  isPinned: PropTypes.bool.isRequired,
  setIsPinned: PropTypes.func.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  userEmail: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  loadingUser: PropTypes.bool.isRequired,
};

export default Sidebar;