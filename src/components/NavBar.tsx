'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiMoon, FiSun, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';  // Update the path if needed
import { toggleTheme } from '@/redux/slices/themeSlice';  // Update the path if needed

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateTilt = () => {
    if (!isMounted) return {};
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const tiltX = (cursorPos.y - centerY) / 30;
    const tiltY = (centerX - cursorPos.x) / 30;
    return { rotateX: tiltX, rotateY: tiltY };
  };

  const isActive = (path: string) => pathname === path;

  const Particle = ({ id, size, delay }: { id: number; size: number; delay: number }) => (
    <motion.span
      key={`particle-${id}`}
      className={`absolute rounded-full bg-sky-400/30 ${theme === 'dark' ? 'opacity-70' : 'opacity-40'}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      initial={{ opacity: 0 }}
      animate={{
        y: [0, -15, 0],
        x: [0, 10, 0],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 3 + id * 1.5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  const particles = [
    { id: 1, size: 4, delay: 0.5 },
    { id: 2, size: 3, delay: 1 },
    { id: 3, size: 5, delay: 1.5 },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 10 }}
      className={`fixed top-0 w-full z-50 py-3 px-6 backdrop-blur-lg border-b ${
        theme === 'dark'
          ? 'bg-gray-900/90 border-gray-800 shadow-[0_0_15px_rgba(56,182,255,0.1)]'
          : 'bg-white/90 border-gray-200 shadow-[0_0_15px_rgba(56,182,255,0.2)]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          className="flex items-center space-x-2 cursor-pointer relative"
          onClick={() => router.push('/')}
          onHoverStart={() => setIsHoveringLogo(true)}
          onHoverEnd={() => setIsHoveringLogo(false)}
          whileHover={{ scale: 1.05 }}
          animate={isMounted ? calculateTilt() : {}}
          transition={{ type: 'spring', stiffness: 50 }}
        >
          {isMounted &&
            particles.map((particle) => (
              <Particle key={particle.id} id={particle.id} size={particle.size} delay={particle.delay} />
            ))}

          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-sky-600 to-blue-800'
                : 'bg-gradient-to-br from-sky-400 to-blue-600'
            }`}
            animate={{
              rotate: isHoveringLogo ? 360 : 0,
              scale: isHoveringLogo ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="text-white font-bold text-lg">SS</span>
          </motion.div>

          <motion.span
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600"
            animate={{
              textShadow: isHoveringLogo
                ? '0 0 10px rgba(56, 182, 255, 0.7)'
                : '0 0 0px rgba(56, 182, 255, 0)',
            }}
            transition={{ duration: 0.3 }}
          >
            SkillSense<span className="text-blue-400 animate-pulse">.AI</span>
          </motion.span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/career-path', label: 'Career Path' },
            { href: '/learning-goals', label: 'Learning' },
            { href: '/resume-feedback', label: 'Resume' },
          ].map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                href={item.href}
                className={`relative px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30'
                    : `text-gray-700 hover:bg-sky-100 dark:hover:bg-gray-800 dark:text-gray-300 ${
                        theme === 'dark' ? 'hover:text-sky-300' : 'hover:text-sky-600'
                      }`
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="navActiveIndicator"
                    className="absolute inset-0 rounded-full bg-sky-500 z-[-1]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {isLoading && (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center"
            >
              <FaRobot className="h-5 w-5 text-amber-400 mr-1" />
              <span className="text-xs text-amber-400">Analyzing</span>
            </motion.div>
          )}

          <motion.button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full ${
              theme === 'dark'
                ? 'bg-gray-800 text-amber-300 hover:bg-gray-700'
                : 'bg-sky-100 text-sky-600 hover:bg-sky-200'
            }`}
            whileHover={{ scale: 1.1, rotate: theme === 'dark' ? -10 : 10 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
          </motion.button>

          <motion.div className="hidden md:flex space-x-3">
            <motion.button
              onClick={() => router.push('/signup')}
              className={`px-4 py-2 rounded-full font-medium flex items-center ${
                theme === 'dark'
                  ? 'bg-gray-800 text-sky-400 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-sky-600 hover:bg-sky-50 border border-sky-200'
              }`}
              whileHover={{ scale: 1.05, x: [0, -3, 0, 3, 0] }}
              whileTap={{ scale: 0.95 }}
            >
              <FiUserPlus className="mr-2" /> Sign Up
            </motion.button>
            <motion.button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => router.push('/login'), 1500);
              }}
              className="px-4 py-2 rounded-full font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-sky-500/30 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLogIn className="mr-2" /> Log In
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
