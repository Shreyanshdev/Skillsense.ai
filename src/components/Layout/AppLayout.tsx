'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar/Sidebar';
import GlobalBackground from '@/components/Landing/GlobalBackground';
import { FiMenu } from 'react-icons/fi';
import React from 'react';
import api from '@/services/api'; // Adjust path if needed

// Separate Bubbles component - Remains the same
// const Bubbles = ({ theme }: { theme: string }) => {
//     const bubbles = useMemo(
//       () =>
//         Array.from({ length: 10 }).map(() => {
//           const size = Math.random() * 100 + 50;
//           const left = Math.random() * 100;
//           const top = Math.random() * 100;
//           const xInitial = Math.random() * 100;
//           const xAnimate = Math.random() * 100 - 50;
//           const duration = 10 + Math.random() * 10;
//           const delay = Math.random() * 5;
//           return { size, left, top, xInitial, xAnimate, duration, delay };
//         }),
//       []
//     );
//     return (
//       <>
//         {bubbles.map((bubble, i) => (
//           <motion.div
//             key={i}
//             initial={{ y: 0, x: bubble.xInitial }}
//             animate={{ y: [0, -100, -200, -300], x: [0, bubble.xAnimate], opacity: [1, 0.8, 0.5, 0] }}
//             transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay }}
//             className={`absolute rounded-full ${
//               theme === 'dark' ? 'bg-sky-900/20 border border-sky-800/30' : 'bg-sky-200/50 border border-sky-300/50'
//             }`}
//             style={{ width: `${bubble.size}px`, height: `${bubble.size}px`, left: `${bubble.left}%`, top: `${bubble.top}%` }}
//           />
//         ))}
//       </>
//     );
// };
// const NoSSR_Bubbles = dynamic(() => Promise.resolve(Bubbles), { ssr: false });

const SIDEBAR_WIDTH_OPEN = 256;
const SIDEBAR_WIDTH_CLOSED = 90;

interface UserAuthInfo {
  email: string;
  username: string;
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  // State to hold user info
  const [userAuthInfo, setUserAuthInfo] = useState<UserAuthInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Effect to fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<UserAuthInfo>('/user-info');
          setUserAuthInfo(response.data);
        } catch (error: any) {
          console.error('Error fetching user info:', error);
        }finally {
        setLoadingUser(false);
      }
    };
    fetchUserInfo();
  }, []); 

  // Effect to apply/remove 'dark' class to the HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [currentSidebarWidth, setCurrentSidebarWidth] = useState(SIDEBAR_WIDTH_CLOSED);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setIsSidebarPinned(true);
      } else {
        setIsSidebarPinned(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setCurrentSidebarWidth(isSidebarPinned ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED);
    } else {
      setCurrentSidebarWidth(0);
    }
  }, [isDesktop, isSidebarPinned]);

  const mainContentXOffset = useMemo(() => {
    if (!isDesktop) {
      return 0;
    }
    return currentSidebarWidth;
  }, [isDesktop, currentSidebarWidth]);

  return (
    
      <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50/50'} transition-colors duration-300`}>
        <GlobalBackground isDark={theme === 'dark'}></GlobalBackground>
        <div className="fixed inset-0 overflow-hidden z-0">
          {/* <NoSSR_Bubbles theme={theme} /> */}
        </div>

        <div className="flex relative z-10 h-screen">
          {/* Sidebar Component - Pass userAuthInfo and loading state */}
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            toggleMobileSidebar={() => setIsMobileSidebarOpen(false)}
            onSidebarWidthChange={setCurrentSidebarWidth}
            isPinned={isSidebarPinned}
            setIsPinned={setIsSidebarPinned}
            isDesktop={isDesktop}
            userEmail={userAuthInfo?.email || ''} // Pass email
            userName={userAuthInfo?.username || ''} // Pass username
            loadingUser={loadingUser} // Pass loading state
          />

          <motion.main
            animate={{ x: mainContentXOffset }}
            initial={{ x: isDesktop ? SIDEBAR_WIDTH_CLOSED : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex-1 relative flex flex-col"
            style={{
              width: isDesktop ? `calc(100% - ${currentSidebarWidth}px)` : '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100vh',
            }}
          >
              {!isDesktop && (
                  <motion.button
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className={`absolute top-4 left-4 p-2 rounded-full z-30 shadow-md
                          ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}
                          transition-colors duration-300`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      aria-label="Open sidebar menu"
                  >
                      <FiMenu className="w-6 h-6" />
                  </motion.button>
              )}
              
              <div
                className="flex-grow overflow-y-auto"
                style={{ paddingTop: '0px' }}
              >
                  {children}
              </div>
          </motion.main>
        </div>
      </div>
  );
};

export default AppLayout;