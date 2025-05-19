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
} from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  onHover: (width: number) => void;
}

const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: <FaHome /> },
  { id: 'evaluation', name: 'Evaluation', icon: <FaChartLine /> },
  { id: 'goals', name: 'Goal Tracker', icon: <FaBullseye /> },
];

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  toggleMobileSidebar,
  onHover,
}) => {
  const theme = useSelector((s: RootState) => s.theme.theme);
  const dispatch = useDispatch();
  const pathname = usePathname();

  // track hover state
  const [isHovered, setIsHovered] = useState(false);

  // determine if we're on desktop (>=1024px) after mount
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth >= 1024);
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // inform parent of width changes
  useEffect(() => {
    onHover(isHovered ? 256 : 64);
  }, [isHovered, onHover]);

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`
          fixed top-0 left-0 h-full z-50
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}
        initial={{ width: 64 }}
        animate={{
          width: isMobileOpen ? 256 : isHovered ? 256 : 64,
          x: isMobileOpen
            ? 0
            : isDesktop
            ? 0
            : -256,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => isDesktop && setIsHovered(true)}
        onMouseLeave={() => isDesktop && setIsHovered(false)}
      >
        <div className="flex flex-col h-full pt-16 overflow-y-auto">
          {/* Logo Section */}
          <motion.div
            className={`
              mb-2 py-6 flex justify-center
              ${isHovered || isMobileOpen ? 'px-4' : 'px-0'}
            `}
            animate={{ scale: isHovered || isMobileOpen ? 1 : 0.8 }}
          >
            <div
              className="
                w-12 h-12 rounded-2xl flex items-center justify-center
                bg-gradient-to-r from-sky-400 to-blue-600 shadow-lg
                cursor-pointer
              "
            >
              <motion.span
                className="text-white font-bold text-xl"
                animate={{
                  rotate: isHovered || isMobileOpen ? 360 : 0,
                }}
                transition={{ duration: 1.5, loop: Infinity }}
              >
                SS
              </motion.span>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={`
                  group flex items-center
                  ${
                    isHovered || isMobileOpen
                      ? 'px-3 py-3 mx-2 justify-start'
                      : 'p-3 justify-center mx-0'
                  }
                  rounded-xl transition-all
                  ${
                    pathname.includes(item.id)
                      ? 'bg-gradient-to-r from-sky-50/50 to-blue-50/50 border border-sky-100'
                      : theme === 'dark'
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                <motion.span
                  className={`
                    text-2xl p-2
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                    ${pathname.includes(item.id) ? 'text-sky-500' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {item.icon}
                </motion.span>
                <AnimatePresence>
                  {(isHovered || isMobileOpen) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`
                        ml-2 text-sm font-medium
                        ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                      `}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>

          {/* Profile & Actions */}
          <div className="mt-auto border-t">
            <div className="p-4 space-y-4">
              {/* User Info */}
              <motion.div
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <AnimatePresence>
                  {(isHovered || isMobileOpen) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1"
                    >
                      <p
                        className={`
                          text-sm font-medium
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                        `}
                      >
                        John Doe
                      </p>
                      <p
                        className={`
                          text-xs
                          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                        `}
                      >
                        john@skillsense.ai
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Settings */}
              <motion.button
                className={`
                  w-full flex
                  ${
                    isHovered || isMobileOpen
                      ? 'justify-start px-3'
                      : 'justify-center'
                  }
                  items-center py-3 rounded-xl gap-3
                  ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
                `}
                whileHover={{ x: 5 }}
              >
                <FaCog
                  className={`
                    text-xl
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}
                />
                {(isHovered || isMobileOpen) && (
                  <span className="text-sm">Settings</span>
                )}
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                onClick={() => dispatch(toggleTheme())}
                className={`
                  w-full flex items-center
                  ${
                    isHovered || isMobileOpen
                      ? 'justify-start px-3'
                      : 'justify-center'
                  }
                  py-3 rounded-xl gap-3
                  ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
                `}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? -10 : 10 }}
                  transition={{ type: 'spring' }}
                >
                  {theme === 'dark' ? (
                    <FiMoon className="text-xl text-amber-300" />
                  ) : (
                    <FiSun className="text-xl text-sky-600" />
                  )}
                </motion.div>
                {(isHovered || isMobileOpen) && (
                  <span className="text-sm">Switch Theme</span>
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                className={`
                  w-full flex
                  ${
                    isHovered || isMobileOpen
                      ? 'justify-start px-3'
                      : 'justify-center'
                  }
                  items-center py-3 rounded-xl gap-3
                  ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
                `}
                whileHover={{ x: 5 }}
              >
                <FaSignOutAlt
                  className={`
                    text-xl
                    ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}
                  `}
                />
                {(isHovered || isMobileOpen) && (
                  <span className="text-sm text-red-500">Logout</span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
