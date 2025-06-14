"use client";

import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FiMoon, FiSun, FiMenu, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleTheme } from "@/redux/slices/themeSlice";
import router, { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class concatenation

const navItemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 10, stiffness: 150 } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -20, scaleY: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scaleY: 0.95,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1,
      delay: 0.1,
    },
  },
};

const dropdownItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit: { opacity: 0, y: -10, transition: { type: "spring", stiffness: 200, damping: 20 } },
};


// Updated NavbarProps for the render prop pattern
interface NavbarProps {
  children: (visibleState: boolean) => React.ReactNode; // This is the key change for render prop
  className?: string;
  heroHeight: number;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  theme: string;
}

const hamburgerPath = "M4 6h16M4 12h16m-7 6h7"; // Hamburger state path
  const crossPath = "M6 18L18 6M6 6l12 12"; // Cross state path


export const NavbarWrapper = ({ children, className, heroHeight }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll(); // Listens to global scroll
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Activates when 70% of hero section is scrolled, adjust as needed
    if (latest > heroHeight * 0.7) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 cursor-pointer z-40 w-full", className)} // Navbar fixed at top-0
    >
      {/* Call the children function with the 'visible' state */}
      {children(visible)}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible, theme }: NavBodyProps) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ?
           isDark
            ? "0 0 24px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.3), 0 0 4px rgba(0, 0, 0, 0.4), 0 16px 68px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "calc(100% - 2rem)" : "100%", // Adjusted width to keep consistent padding/margin
        y: visible ? 10 : 0, // Slight drop for effect
        borderRadius: visible ? "0.75rem" : "0", // Add some rounded corners when visible
        backgroundColor: visible
          ? isDark
            ? "rgba(17, 24, 39, 0.8)" // dark:bg-gray-900/80
            : "rgba(255, 255, 255, 0.8)" // bg-white/80
          : "transparent", // Initial transparent background
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-[60] mx-auto flex w-full max-w-7xl flex-row items-center justify-between self-start px-6 py-3 transition-colors duration-300",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

// --- Particle Component for Logo ---
const Particle = ({ id, size, delay, theme }: { id: number; size: number; delay: number; theme: string }) => (
  <motion.span
    key={`particle-${id}`}
    className={`absolute rounded-full bg-sky-400/30 ${theme === 'dark' ? 'opacity-70' : 'opacity-40'}`}
    style={{ width: `${size}px`, height: `${size}px` }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      y: [0, -15 + id * 2, 0],
      x: [0, 10 - id * 1.5, 0],
      scale: [0.8, 1.2, 0.8],
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

// --- Main Nav2 Component ---
interface Nav2Props {
  heroHeight: number; // Prop to receive hero section height
}

const Nav2: React.FC<Nav2Props> = ({ heroHeight }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('tools'); // Default active section
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  // Effect for particle animation and cursor tracking
  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Function to handle scroll and update active section (simplified for demo)
  const handleNavLinkClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false); // Close mobile menu on nav item click
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ensure the click is outside the navbar wrapper itself
      if (isMenuOpen && !(event.target as HTMLElement).closest('.navbar-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Calculate tilt for logo animation
  const calculateTilt = () => {
    if (!isMounted) return {};
    const { innerWidth: width, innerHeight: height } = window;
    const tiltX = (cursorPos.y - height / 2) / 40;
    const tiltY = (width / 2 - cursorPos.x) / 40;
    return { rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" as const };
  };

  // Handlers for Login/SignUp buttons
  const handleLoginClick = () => {
    router.push('/login'); // Assuming you have a /login route
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  const handleSignUpClick = () => {
    router.push('/signup'); // Assuming you have a /signup route
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <NavbarWrapper heroHeight={heroHeight} className="navbar-container">
      {(visibleState) => ( // Render prop: visibleState is true when scrolled past hero threshold
        <NavBody visible={visibleState} theme={theme} className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div variants={navItemVariants}>
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push('/')}
              onHoverStart={() => setIsHoveringLogo(true)}
              onHoverEnd={() => setIsHoveringLogo(false)}
              whileHover={{ scale: 1.05 }}
              animate={isMounted ? calculateTilt() : {}}
              transition={{ type: 'spring', stiffness: 80 }}
            >
              {isMounted && Array.from({ length: 10 }, (_, id) => (
                <Particle key={id} id={id} size={Math.random() * 20 + 10} delay={Math.random() * 2} theme={theme} />
              ))}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-sky-600 to-blue-800' : 'bg-gradient-to-br from-sky-400 to-blue-600'}`}
                animate={{ rotate: isHoveringLogo ? 360 : 0, scale: isHoveringLogo ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <span className="text-white font-bold text-lg">SS</span>
              </motion.div>
              <motion.span
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600"
                animate={{ filter: `drop-shadow(0 0 ${isHoveringLogo ? 8 : 0}px rgba(56, 182, 255, 0.7))` }}
                transition={{ duration: 0.3 }}
              >
                SkillSense<span className="text-blue-400 animate-pulse">.AI</span>
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation Items and Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {['tools', 'pricing', 'blog'].map((section) => (
              <motion.a
                key={section}
                href={`#${section}`}
                onClick={() => handleNavLinkClick(section)}
                className={cn(
                  "relative py-1 transition-colors",
                  visibleState || theme === 'dark' // If scrolled OR dark theme, use neutral colors
                    ? 'text-neutral-600 dark:text-neutral-300 hover:text-sky-500'
                    : 'text-gray-900 hover:text-sky-500' // Initial light theme, use darker text
                )}
                onHoverStart={() => {}} // Placeholder for potential hover effects
                onHoverEnd={() => {}}   // Placeholder for potential hover effects
              >
                {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                {activeSection === section && (
                  <motion.span
                    layoutId="underline" // Ensures smooth animation between active items
                    className={cn(
                      "absolute left-0 bottom-0 h-[2px] w-full rounded-full",
                      visibleState ? (theme === 'dark' ? 'bg-sky-500' : 'bg-sky-500') : 'bg-gray-900' // Underline color changes with theme and scroll
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    exit={{ width: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}

            <button
              onClick={() => dispatch(toggleTheme())}
              className={cn(
                "p-2 rounded-full transition-colors cursor-pointer",
                visibleState || theme === 'dark' // If scrolled OR dark theme, use white/dark hover
                  ? 'hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100 text-gray-900' // Initial light theme, use light hover
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {/* Login Button (Desktop) */}
            <motion.button
              onClick={handleLoginClick}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer",
                !visibleState && theme === 'light' // Initial light theme: dark button on light hero
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : !visibleState && theme === 'dark' // Initial dark theme: light button on dark hero
                  ? 'bg-white text-gray-900 hover:bg-gray-200'
                  : theme === 'dark' // Scrolled dark theme: transparent border button
                  ? 'bg-transparent text-white border border-gray-700 hover:bg-gray-700'
                  : 'bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100' // Scrolled light theme: transparent border button
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>

            {/* Sign Up Button (Desktop) */}
            <motion.button
              onClick={handleSignUpClick}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer",
                !visibleState && theme === 'light' // Initial light theme: dark button on light hero
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : !visibleState && theme === 'dark' // Initial dark theme: light button on dark hero
                  ? 'bg-white text-gray-900 hover:bg-gray-200'
                  : theme === 'dark' // Scrolled dark theme: transparent border button
                  ? 'bg-transparent text-white border border-gray-700 hover:bg-gray-700'
                  : 'bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100' // Scrolled light theme: transparent border button
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className={visibleState || theme === 'dark' ? 'text-white' : 'text-gray-900'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? "x" : "menu"}
                  initial={{ rotate: isMenuOpen ? -90 : 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: isMenuOpen ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <FiX className="w-6 h-6" />
                  ) : (
                    <FiMenu className="w-6 h-6" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "md:hidden absolute right-0 top-full mt-4 w-48 p-4 rounded-xl shadow-xl origin-top-right border",
                  theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/95 border-gray-200'
                )}
              >
                <nav className="flex flex-col space-y-2">
                  {/* Mobile Nav Links */}
                  {['tools', 'pricing', 'Blog'].map((section, i) => (
                    <motion.div key={section} custom={i} variants={dropdownItemVariants}>
                      <a
                        href={`#${section}`}
                        onClick={() => handleNavLinkClick(section)}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                          activeSection === section
                            ? 'bg-sky-500 text-white'
                            : (theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                        )}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                        {activeSection === section && (
                          <motion.span
                            layoutId="dropdown-underline"
                            className="absolute left-0 bottom-0 h-[2px] bg-white w-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            exit={{ width: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </a>
                    </motion.div>
                  ))}
                  {/* Login Button (Mobile) */}
                  <motion.div variants={dropdownItemVariants} custom={4}>
                    <button
                      onClick={handleLoginClick}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      Login
                    </button>
                  </motion.div>
                  {/* Sign Up Button (Mobile) */}
                  <motion.div variants={dropdownItemVariants} custom={5}>
                    <button
                      onClick={handleSignUpClick}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        theme === 'dark' ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-sky-500 text-white hover:bg-sky-600'
                      )}
                    >
                      Sign Up
                    </button>
                  </motion.div>
                </nav>
                <div className="mt-4 border-t pt-4">
                  {/* Theme Toggle (Mobile) */}
                  <motion.button
                    onClick={() => {
                      dispatch(toggleTheme());
                      setIsMenuOpen(false); // Close menu after toggling theme
                    }}
                    className="w-full text-left py-2 flex items-center justify-between"
                    variants={dropdownItemVariants}
                    custom={6}
                  >
                    <span>Toggle Theme</span>
                    {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NavBody>
      )}
    </NavbarWrapper>
  );
};

export default Nav2;