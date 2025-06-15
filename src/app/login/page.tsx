'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { FiArrowRight, FiMail, FiLock, FiSun, FiMoon } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // Import toast for user feedback

// Assume GlobalBackground component exists at this path
import GlobalBackground from '@/components/Landing/GlobalBackground';

// --- Type Definitions ---
// Define the expected structure of a successful login response
interface LoginSuccessResponse {
  success: boolean;
  token: string;
  message?: string; // Optional message on success
}

// Define the expected structure of a login error response
interface LoginErrorResponse {
  success: boolean;
  message?: string; // Error message from the API
}

// Define the overall shape of the response from the login API
type LoginApiResponse = LoginSuccessResponse | LoginErrorResponse;
// --- End Type Definitions ---


export default function LoginPage() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for displaying form-level error

  // Framer Motion Variants (no changes needed here, keeping for completeness)
  const skillsenseTextVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80,
        delay: 0.8,
      },
    },
    hover: {
      rotateY: 5,
      rotateX: -5,
      filter: ["brightness(1)", "brightness(1.5)", "brightness(1.0)"],
      transition: { duration: 0.5, ease: "easeInOut", filter: { repeat: Infinity, duration: 3, ease: "linear" } },
      perspective: 1000,
    },
  };

  const formCardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 100,
        delay: 0.4,
      },
    },
  };

  const formItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const inputVariants: Variants = {
    rest: {
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
      boxShadow: '0 0 0 0 rgba(0,0,0,0)',
    },
    hover: {
      borderColor: isDark ? '#38BDF8' : '#3B82F6',
      boxShadow: isDark ? '0 0 15px rgba(56, 189, 248, 0.4)' : '0 0 15px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.2 },
    },
    focus: {
      borderColor: isDark ? '#38BDF8' : '#3B82F6',
      boxShadow: isDark ? '0 0 20px rgba(56, 189, 248, 0.6)' : '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.3 },
    },
  };

  // Handle form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null); // Clear previous errors

    if (!email || !password) {
      const msg = 'Please enter both email and password.';
      setError(msg);
      toast.error(msg); // Show toast for immediate feedback
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Assert the type of data returned from the API
      const data: LoginApiResponse = await res.json();

      if (res.ok && data.success) {
        // Type guard to ensure data is LoginSuccessResponse
        if ('token' in data) {
          console.log('Login successful:', data);
          localStorage.setItem('token', data.token);
          toast.success(data.message || 'Login successful!'); // User-friendly success toast
          router.replace('/dashboard');
        } else {
            // This case should ideally not be reached if the backend correctly sends 'token' on success
            const msg = 'Login succeeded but response missing token. Please contact support.';
            console.error(msg, data);
            setError(msg);
            toast.error(msg);
        }
      } else {
        // Type guard to ensure data is LoginErrorResponse
        if ('message' in data) {
            console.error('Login failed:', data.message);
            const errorMessage = data.message || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage); // Show toast for login failures
        } else {
            const msg = 'Login failed with unknown error. Please try again.';
            console.error('Login failed with unexpected response:', data);
            setError(msg);
            toast.error(msg);
        }
      }
    } catch (err) {
      console.error('Login API error:', err);
      // More descriptive error messages for network issues vs. API errors
      let errorMessage = 'An unexpected error occurred during login. Please try again later.';

      // Basic check for common network errors (though fetch doesn't throw for 4xx/5xx)
      // For network connection issues (e.g., server offline), fetch will throw an error.
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
      } else if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage); // Show toast for all catch-all errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <GlobalBackground isDark={isDark} />

      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => dispatch(toggleTheme())}
        className={`absolute top-8 right-8 p-3 rounded-full shadow-md cursor-pointer
          ${isDark ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-100'}
          transition-colors duration-300 transform hover:scale-105`}
      >
        {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </motion.button>

      <div className='grid lg:grid-cols-2'>
        {/* SkillSense.AI background element */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1/2 hidden lg:flex flex-col items-center justify-center overflow-hidden z-10`}
        >
          <div className={`absolute inset-0 opacity-20 ${isDark ? 'bg-grid-pattern-dark' : 'bg-grid-pattern-light'}`}></div>

          <motion.h1
            className="text-7xl xl:text-8xl font-extrabold leading-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 drop-shadow-2xl"
            variants={skillsenseTextVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            SkillSense<span className="text-blue-400 animate-pulse">.AI</span>
          </motion.h1>
          <motion.p
            className={`mt-6 text-center text-xl max-w-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} opacity-95`}
            variants={skillsenseTextVariants}
            initial="hidden"
            animate="visible"
            transition={{
              opacity: {
                type: "spring",
                damping: 15,
                stiffness: 80,
                delay: 0.8
              },
              y: {
                type: "spring",
                damping: 15,
                stiffness: 80,
                delay: 1.1
              }
            }}
          >
            Your future, powered by intelligent insights.
          </motion.p>
        </div>

        {/* Login Form (the main, centered, single column "raindrop" card) */}
        <motion.div
          className={`w-full max-w-md p-8 sm:p-12 flex flex-col justify-center relative z-20 mx-auto
            rounded-[4rem] transition-all duration-300 lg:left-160
            ${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/70 border-gray-200'}
            backdrop-filter backdrop-blur-xl
            ${isDark ? 'shadow-glow-form-dark' : 'shadow-glow-form-light'}
            `}
          initial="hidden"
          animate="visible"
          variants={formCardVariants}
          whileHover="hover"
          whileInView="hover"
          viewport={{ once: false, amount: 0.2 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: 'center' }}
        >
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className={`top-8 mb-3 -mt-2 left-8 px-3 text-center py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-md cursor-pointer
                ${isDark ? ' text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                transition-colors duration-300 transform hover:scale-105`}
          >
            ← Back to home
          </motion.button>
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} drop-shadow-md`}
            >
              Sign in to your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className={`mt-2 text-md ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Access your personalized dashboard and insights
            </motion.p>
          </div>

          {/* Google Sign In */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.02, boxShadow: isDark ? '0 5px 20px rgba(234, 179, 8, 0.2)' : '0 5px 20px rgba(66, 133, 244, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            className={`mt-8 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-medium shadow-md cursor-pointer
              ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              } transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-gray-600' : 'focus:ring-gray-300'}`}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </motion.button>

          <div className={`flex items-center mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <span className="px-3 text-sm">or</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>

          {/* Login Form */}
          <motion.form
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
            className="mt-6 space-y-4"
            onSubmit={handleLogin}
          >
            {/* Email Field */}
            <motion.div variants={formItemVariants}>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <motion.div
                className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} overflow-hidden`}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
                variants={inputVariants}
              >
                <span className={`inline-flex items-center px-3 rounded-l-xl ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                } text-sm`}>
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl text-sm
                    ${isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                    } border-none focus:ring-0 outline-none`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={formItemVariants}>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <motion.div
                className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} overflow-hidden`}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
                variants={inputVariants}
              >
                <span className={`inline-flex items-center px-3 rounded-l-xl ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                } text-sm`}>
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl text-sm
                    ${isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                    } border-none focus:ring-0 outline-none`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>

              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <a
                  href="/reset"
                  className={`text-sm font-medium transition-colors duration-200 cursor-pointer
                    ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                >
                  Forgot password?
                </a>
              </div>
            </motion.div>

            {/* Display Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 text-center mt-4"
              >
                {error}
              </motion.p>
            )}

            {/* Continue Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 30px rgba(56, 189, 248, 0.4)' : '0 10px 30px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-md font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                ${isDark
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                }`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <FiArrowRight className="w-4 h-4 ml-1" />}
            </motion.button>

            {/* Signup Link */}
            <p className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Don&apos;t have an account?{' '}
              <a
                href="/signup"
                className={`font-medium transition-colors duration-200 cursor-pointer
                  ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                Create one
              </a>
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}