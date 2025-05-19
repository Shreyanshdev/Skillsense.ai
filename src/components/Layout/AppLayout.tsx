// app/layout.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import TopNavbar from '@/components/TopNavbar/TopNavbar';
import Sidebar from '@/components/Sidebar/Sidebar';

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

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(64);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <NoSSR_Bubbles theme={theme} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <TopNavbar toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(false)}
          onHover={setSidebarWidth}
        />

        <main 
          className="transition-all duration-300 ease-in-out pt-16"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;