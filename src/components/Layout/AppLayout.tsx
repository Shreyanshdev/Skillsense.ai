// app/layout.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import TopNavbar from '@/components/TopNavbar/TopNavbar';
import Sidebar from '@/components/Sidebar/Sidebar'; // Your upgraded sidebar component

// Separate Bubbles component (assuming it's here as you provided)
const Bubbles = ({ theme }: { theme: string }) => {
    const bubbles = useMemo(
      () =>
        Array.from({ length: 10 }).map(() => {
          const size = Math.random() * 100 + 50;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const xInitial = Math.random() * 100;
          const xAnimate = Math.random() * 100 - 50;
          const duration = 10 + Math.random() * 10;
          const delay = Math.random() * 5;
          return { size, left, top, xInitial, xAnimate, duration, delay };
        }),
      []
    );
    return (
      <>
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: bubble.xInitial }}
            animate={{ y: [0, -100, -200, -300], x: [0, bubble.xAnimate], opacity: [1, 0.8, 0.5, 0] }}
            transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay }}
            className={`absolute rounded-full ${
              theme === 'dark' ? 'bg-sky-900/20 border border-sky-800/30' : 'bg-sky-200/50 border border-sky-300/50'
            }`}
            style={{ width: `${bubble.size}px`, height: `${bubble.size}px`, left: `${bubble.left}%`, top: `${bubble.top}%` }}
          />
        ))}
      </>
    );
};

const NoSSR_Bubbles = dynamic(() => Promise.resolve(Bubbles), { ssr: false });

// Define constant widths for clarity and consistency
const SIDEBAR_WIDTH_OPEN = 256; // Tailwinds w-64 is 256px
const SIDEBAR_WIDTH_CLOSED = 64; // Tailwinds w-16 is 64px, adjusting to your sidebar's default
const TOP_NAVBAR_HEIGHT_PX = 64; // Assuming TopNavbar has a height of h-16 (64px)

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  // States for Sidebar management
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [currentSidebarWidth, setCurrentSidebarWidth] = useState(SIDEBAR_WIDTH_CLOSED);

  // State to determine if it's a desktop view
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Callback for Sidebar to report its current width
  const handleSidebarWidthChange = useCallback((width: number) => {
    setCurrentSidebarWidth(width);
  }, []);

  // --- LOGIC FOR MAIN CONTENT POSITIONING ---
  const mainContentXOffset = useMemo(() => {
    if (!isDesktop) {
      return 0; // On mobile, main content stays at x=0 (sidebar overlays)
    }
    return currentSidebarWidth;
  }, [isDesktop, currentSidebarWidth]);

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Animated Background Bubbles */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <NoSSR_Bubbles theme={theme} />
      </div>

      {/* Main Layout Container (Sidebar + Main Content) */}
      <div className="flex relative z-10 h-screen">
        {/* Sidebar Component */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(false)}
          onSidebarWidthChange={handleSidebarWidthChange}
          isPinned={isSidebarPinned}
          setIsPinned={setIsSidebarPinned}
          isDesktop={isDesktop}
        />

        {/* Main Content Area */}
        <motion.main
          animate={{ x: mainContentXOffset }}
          initial={{ x: isDesktop ? SIDEBAR_WIDTH_CLOSED : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex-1 relative flex flex-col" // Added flex flex-col here to stack navbar and content
          style={{
            width: isDesktop ? `calc(100% - ${currentSidebarWidth}px)` : '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100vh',
          }}
        >
            {/* Top Navbar */}
            <TopNavbar
              toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
              // Add Tailwind classes directly here for fixed positioning and z-index
              className="fixed top-0 left-0 w-full z-50"
              style={{
                // Adjust left property dynamically based on sidebar state
                left: isDesktop ? `${currentSidebarWidth}px` : '0',
                width: isDesktop ? `calc(100% - ${currentSidebarWidth}px)` : '100%',
              }}
            />

            {/* Inner content wrapper with responsive padding and adjusted top padding */}
            <div
              className="flex-grow overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
              style={{ paddingTop: `${TOP_NAVBAR_HEIGHT_PX}px` }} // Add padding to account for fixed navbar
            >
                {children}
            </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;