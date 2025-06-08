// src/components/Sidebar/Sidebar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaChartLine,
  FaBullseye,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaAmazonPay,
} from 'react-icons/fa';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import {v4 as uuidv4} from 'uuid'; // Importing uuid for unique keys


interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  onSidebarWidthChange: (width: number) => void;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isDesktop: boolean;
}

const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: <FaHome /> },
  { id: 'evaluation', name: 'Evaluation', icon: <FaChartLine /> },
  { id: 'goals', name: 'Goal Tracker', icon: <FaBullseye /> },
  // Consider replacing with more suitable AI icons
  
  { id: 'billing' , name:'Billing' , icon:<FaAmazonPay />},
];

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  toggleMobileSidebar,
  onSidebarWidthChange,
  isPinned,
  setIsPinned,
  isDesktop,
}) => {
  const theme = useSelector((s: RootState) => s.theme.theme);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [isLocallyHovered, setIsLocallyHovered] = useState(false);
  const isOpen = isPinned || isLocallyHovered || isMobileOpen;

  const updateSidebarWidth = useCallback(() => {
    const newWidth = isOpen ? 256 : 64;
    onSidebarWidthChange(newWidth);
  }, [isOpen, onSidebarWidthChange]);

  useEffect(() => {
    updateSidebarWidth();
  }, [isOpen, updateSidebarWidth]);

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsLocallyHovered(false);
    }
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 overflow-hidden
    ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
    border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
    transition-transform duration-300 ease-in-out
    ${isDesktop ? '' : (isMobileOpen ? 'translate-x-0' : '-translate-x-full')}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={sidebarClasses}
        initial={{ width: 64 }}
        animate={{ width: isOpen ? 256 : 64 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => isDesktop && !isPinned && setIsLocallyHovered(true)}
        onMouseLeave={() => isDesktop && !isPinned && setIsLocallyHovered(false)}
      >
        <div className="flex flex-col h-full pt-4 pb-4 overflow-y-auto custom-scrollbar">
          {/* Top Section: Header with Pin/Close Button */}
          <div className="flex items-center justify-end px-4 py-3 mb-6">
            {/* Pin/Close Button (only visible when sidebar is open and on desktop) */}
            {isOpen && isDesktop && (
              <motion.button
                onClick={togglePin}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  p-2 rounded-full transition-colors duration-200
                  ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  ${isPinned ? (theme === 'dark' ? 'text-sky-400' : 'text-blue-600') : 'text-gray-400'}
                  text-lg
                `}
                aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              >
                {isPinned ? <FiX /> : <FiMenu />}
              </motion.button>
            )}

            {/* Close button for mobile sidebar when open */}
            {isMobileOpen && !isDesktop && (
              <motion.button
                onClick={toggleMobileSidebar}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full text-xl ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiX />
              </motion.button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="px-2 space-y-1 flex-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={`
                  group flex items-center
                  ${isOpen ? 'px-3 py-3 mx-2 justify-start' : 'p-3 justify-center mx-0'}
                  rounded-xl transition-all duration-200
                  ${
                    pathname.includes(item.id)
                      ? `${theme === 'dark' ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-100 text-sky-700'} `
                      : `${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`
                  }
                `}
              >
                <motion.span
                  className={`text-2xl p-2 shrink-0 ${pathname.includes(item.id) ? 'text-current' : ''}`}
                  whileHover={{ scale: 1.1 }}
                >
                  {item.icon}
                </motion.span>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`ml-2 text-sm font-medium whitespace-nowrap overflow-hidden`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>

          {/* Profile & Actions (Moved to bottom and styled consistently) */}
          <div className={`mt-auto pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="px-2 space-y-2">
              {/* User Info (Conditional based on isOpen) */}
              <motion.div
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200
                          ${isOpen ? 'justify-start' : 'justify-center'}
                          ${theme === 'dark' ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gray-100 hover:bg-gray-200'}
                          cursor-pointer`}
                whileHover={{ scale: isOpen ? 1.02 : 1 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 overflow-hidden"
                    >
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                        John Doe
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                        john@skillsense.ai
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Settings, Theme Toggle, Logout Buttons */}
              {[
                { id: 'settings', name: 'Settings', icon: <FaCog />, color: theme === 'dark' ? 'text-gray-400' : 'text-gray-600', onClick: () => { /* Handle settings logic */ } },
                { id: 'theme', name: 'Switch Theme', icon: theme === 'dark' ? <FiMoon /> : <FiSun />, color: theme === 'dark' ? 'text-amber-300' : 'text-sky-600', onClick: () => dispatch(toggleTheme()) },
                { id: 'logout', name: 'Logout', icon: <FaSignOutAlt />, color: theme === 'dark' ? 'text-red-400' : 'text-red-500', 
                  onClick: async () => {
                    try {
                      const res = await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                  
                      // DEBUG:
                      console.log('Logout status:', res.status);
                      console.log('Content-Type:', res.headers.get('content-type'));
                      const text = await res.text();
                      console.log('Raw response body:', text.slice(0, 200)); 
                  
                      // only parse JSON if it’s actually JSON
                      if (res.headers.get('content-type')?.includes('application/json')) {
                        const data = JSON.parse(text);
                        if (res.ok) {
                          console.log('Logout successful:', data.message);
                          window.location.href = '/login';
                        } else {
                          console.error('Logout failed:', data.message);
                        }
                      } else {
                        console.error('Expected JSON but got HTML');
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
                    w-full flex items-center py-3 rounded-xl gap-3 transition-colors duration-200
                    ${isOpen ? 'justify-start px-3' : 'justify-center'}
                    ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
                  `}
                  whileHover={{ scale: isOpen ? 1.02 : 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span className={`text-xl shrink-0 ${btn.color}`}>
                    {btn.icon}
                  </motion.span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis
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

export default Sidebar;