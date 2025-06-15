'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import React from 'react';
import GlobalBackground from '@/components/Landing/GlobalBackground'; // Assuming this component exists and handles background

export default function ResetPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Framer Motion Variants for input fields (hover and focus effect)
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

  const handleSendOtp = async () => {
    setLoading(true);
    if (!email) {
      alert('Please enter your email.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('otp');
        alert(data.message || 'OTP sent to your email.');
      } else {
        alert(data.message || 'Failed to send OTP. Please check your email and try again.');
      }
    } catch (error) {
      console.error('Send OTP API error:', error);
      alert('An error occurred while sending OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    if (!otp) {
      alert('Please enter the OTP.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok && data?.userId) {
        setUserId(data.userId);
        setStep('reset');
        alert(data.message || 'OTP verified. You can now set your new password.');
      } else {
        alert(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Verify OTP API error:', error);
      alert('An error occurred while verifying OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    if (!newPassword || !confirmPassword) {
      alert('Please enter and confirm your new password.');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Password reset successfully!');
        router.push('/login');
      } else {
        alert(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset Password API error:', error);
      alert('An error occurred while resetting password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const stepVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
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
        delay: 0.2,
      },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <GlobalBackground isDark={isDark} /> {/* Ensure GlobalBackground supports isDark prop */}

      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/')}
        className={`absolute top-8 left-8 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-md cursor-pointer
          ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
          transition-colors duration-300 transform hover:scale-105`}
      >
        ← Back to home
      </motion.button>

      <motion.div
        className={`w-full max-w-md p-8 sm:p-10 flex flex-col justify-center relative z-10 mx-auto
          rounded-[2rem] transition-all duration-300
          ${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/70 border-gray-200'}
          backdrop-filter backdrop-blur-xl
          ${isDark ? 'shadow-glow-form-dark' : 'shadow-glow-form-light'}
        `}
        initial="hidden"
        animate="visible"
        variants={formCardVariants}
        whileHover={{
          scale: 1.01,
          boxShadow: isDark ? '0 0 30px rgba(56, 189, 248, 0.3)' : '0 0 30px rgba(59, 130, 246, 0.2)',
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.99 }}
        style={{ transformOrigin: 'center' }}
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} drop-shadow-md`}
          >
            Reset Your Password
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`mt-2 text-md ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Don't worry, we'll help you get back in.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.form
              key="email-step"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-8 space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
            >
              <div>
                <label htmlFor="email-reset" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
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
                    id="email-reset"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl text-sm
                      ${isDark
                        ? 'bg-gray-700 text-white placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500'
                      } border-none focus:ring-0 outline-none`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 30px rgba(56, 189, 248, 0.4)' : '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-md font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  ${isDark
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                  }`}
                disabled={loading || !email}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                {!loading && <FiArrowRight className="w-4 h-4 ml-1" />}
              </motion.button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form
              key="otp-step"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-8 space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}
            >
              <div>
                <label htmlFor="otp" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter Verification Code (OTP)
                </label>
                <motion.div
                  className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} overflow-hidden`}
                  initial="rest"
                  whileHover="hover"
                  whileFocus="focus"
                  variants={inputVariants}
                >
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-xl text-sm
                      ${isDark
                        ? 'bg-gray-700 text-white placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500'
                      } border-none focus:ring-0 outline-none text-center tracking-widest`}
                    placeholder="_ _ _ _ _ _"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </motion.div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 30px rgba(56, 189, 248, 0.4)' : '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-md font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  ${isDark
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                  }`}
                disabled={loading || !otp}
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                {!loading && <FiArrowRight className="w-4 h-4 ml-1" />}
              </motion.button>
            </motion.form>
          )}

          {step === 'reset' && (
            <motion.form
              key="reset-step"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-8 space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
            >
              {/* New Password */}
              <div>
                <label htmlFor="new-password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
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
                    name="new-password"
                    id="new-password"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl text-sm
                      ${isDark
                        ? 'bg-gray-700 text-white placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500'
                      } border-none focus:ring-0 outline-none`}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </motion.div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password
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
                    name="confirm-password"
                    id="confirm-password"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl text-sm
                      ${isDark
                        ? 'bg-gray-700 text-white placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500'
                      } border-none focus:ring-0 outline-none`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </motion.div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 30px rgba(56, 189, 248, 0.4)' : '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-md font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  ${isDark
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                  }`}
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
                {!loading && <FiArrowRight className="w-4 h-4 ml-1" />}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Remember your password?{' '}
          <a
            href="/login"
            className={`font-medium transition-colors duration-200 cursor-pointer
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
          >
            Sign in
          </a>
        </motion.p>

      </motion.div>
    </div>
  );
}