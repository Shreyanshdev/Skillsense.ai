'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

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

      // Read the response body ONCE, regardless of success or failure
      const data = await res.json(); // Assuming server *always* sends JSON response

      if (res.ok) {
        setStep('otp');
        alert(data.message || 'OTP sent to your email.'); // Use message from server if available
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

      // Read the response body ONCE
      const data = await res.json();

      if (res.ok && data?.userId) {
        setUserId(data.userId);
        setStep('reset');
        alert(data.message || 'OTP verified. You can now set your new password.'); // Use server message
      } else {
        alert(data.message || 'Invalid OTP. Please try again.'); // Use server message
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

      // Read the response body ONCE
      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Password reset successfully!'); // Use server message
        router.push('/login');
      } else {
        alert(data.message || 'Failed to reset password. Please try again.'); // Use server message
      }
    } catch (error) {
      console.error('Reset Password API error:', error);
      alert('An error occurred while resetting password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Reset Password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Follow the steps to reset your password
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
                className="mt-6 space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
              >
                <div>
                  <label htmlFor="email-reset" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <div className={`flex rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <span className={`inline-flex items-center px-3 rounded-l-md ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                    } text-sm`}>
                      <FiMail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email-reset"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                      } border-none focus:ring-1`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-medium text-white shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                  {!loading && <FiArrowRight className="w-4 h-4" />}
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
                className="mt-6 space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}
              >
                <div>
                  <label htmlFor="otp" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Enter OTP
                  </label>
                  <div className={`flex rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <input
                      type="text"
                      name="otp"
                      id="otp"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                      } border-none focus:ring-1`}
                      placeholder="e.g., 123456"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                      maxLength={6}
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-medium text-white shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !otp}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  {!loading && <FiArrowRight className="w-4 h-4" />}
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
                className="mt-6 space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
              >
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Password
                  </label>
                  <div className={`flex rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <span className={`inline-flex items-center px-3 rounded-l-md ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                    } text-sm`}>
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                      } border-none focus:ring-1`}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirm New Password
                  </label>
                  <div className={`flex rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <span className={`inline-flex items-center px-3 rounded-l-md ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                    } text-sm`}>
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                      } border-none focus:ring-1`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-medium text-white shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                  {!loading && <FiArrowRight className="w-4 h-4" />}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Remember your password?{' '}
            <a
              href="/login"
              className={`font-medium ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Sign in
            </a>
          </motion.p>

        </motion.div>
      </div>
    </div>
  );
}