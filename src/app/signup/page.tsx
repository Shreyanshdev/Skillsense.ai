'use client';

import { motion, Variants } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux'; 
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { FiArrowRight, FiUser, FiMail, FiLock, FiCheckCircle, FiXCircle, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi'; 
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalBackground from '@/components/Landing/GlobalBackground'; 
import toast from 'react-hot-toast'; // Import toast
import React from 'react';
import axios, { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';



export default function OnboardingPage() {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const router = useRouter();
    const dispatch = useDispatch(); // Initialize useDispatch
    const isDark = theme === 'dark';

    const [otp, setOtp] = useState('');
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [errors, setErrors] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      if (errors[name as keyof typeof errors]) {
        setErrors({ ...errors, [name]: '' });
      }
    };
  
    const toggleShowPassword = () => setShowPassword(prev => !prev);
  
    const sendOTP = async () => {
      if (!formData.email) {
        setErrors({ ...errors, email: 'Email is required' });
        return;
      }
      setLoading(true);
      try {
        interface SendOtpResponse {
            success: boolean;
            message?: string;
        }

        const { data }: { data: SendOtpResponse } = await axios.post('/api/auth/send-otp', { email: formData.email });
        if ((data as { success: boolean }).success) {
          setIsOTPSent(true);
          setOtpError(false);
          setIsOTPVerified(false);
          setErrors({ ...errors, email: '' });
        } else {
          setErrors({ ...errors, email: data.message || 'An error occurred' });
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (axios.isAxiosError(err)) {
            setErrors({ ...errors, email: err.response?.data?.message || 'Failed to send OTP' });
          } else {
            setErrors({ ...errors, email: 'An unexpected error occurred' });
          }
        } else {
          setErrors({ ...errors, email: 'An unexpected error occurred' });
        }
      } finally {
        setLoading(false);
      }
    };
  
    const verifyOTP = async () => {
      if (!otp) {
        setErrors({ ...errors, otp: 'OTP is required' });
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.post('/api/auth/verify-otp', { email: formData.email, otp });
        interface SignupResponse {
          success: boolean;
          message?: string;
        }

        if ((data as SignupResponse).success) {
          setIsOTPVerified(true);
          setOtpError(false);
          setErrors({ ...errors, otp: '' });
        } else {
          setErrors({ ...errors, otp: (data as { message: string }).message });
          setOtpError(true);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrors({ ...errors, otp: err.response?.data?.message || 'Verification failed' });
        } else {
          setErrors({ ...errors, otp: 'Verification failed' });
        }
        setOtpError(true);
      } finally {
        setLoading(false);
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors = {
        name: formData.name ? '' : 'Name is required',
        email: formData.email ? '' : 'Email is required',
        password: formData.password ? '' : 'Password is required',
        confirmPassword: formData.confirmPassword === formData.password ? '' : 'Passwords do not match',
        otp: isOTPVerified ? '' : 'Please verify OTP'
      };
      setErrors(newErrors);
      if (Object.values(newErrors).some(Boolean)) return;
  
      setLoading(true);
      try {
        const payload = {
          username: formData.name,
          email: formData.email,
          password: formData.password
        };
        const { data } = await axios.post('/api/auth/signup', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        interface SignupResponse {
          success: boolean;
          errors?: Record<string, string>;
        }

        if ((data as SignupResponse).success) {
          // Add this line for the success toast
          toast.success('Account created successfully! Please login.', {
            duration: 4000, // Duration in milliseconds
            position: 'top-center', // Position of the toast
            style: {
              background: '#363636',
              color: '#fff',
            },
            iconTheme: {
              primary: '#10B981', // Green checkmark
              secondary: '#fff',
            },
          });
          router.push('/login');
        } else {
          const errorsData = data as { errors?: Record<string, string> };
          setErrors({ ...errors, ...errorsData.errors });
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            setErrors({ ...errors, email: err.response?.data?.message || 'Signup failed' });
        } else {
            setErrors({ ...errors, email: 'An unexpected error occurred' });
        }
        if (axios.isAxiosError(err)) {
            toast.error(err.response?.data?.message || 'Signup failed. Please try again.', {
              duration: 4000,
              position: 'top-center',
            });
        } // Close the catch block properly
      } finally {
        setLoading(false);
      }
    };

    // --- Framer Motion Variants ---

    // Framer Motion Variants for the "SkillSense.AI" text in the left panel
    const skillsenseTextVariants :Variants = {
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
      hover: { // Tilt and Shine on hover
        rotateY: 5,
        rotateX: -5,
        filter: ["brightness(1)", "brightness(1.5)", "brightness(1.0)"], // Shine effect
        transition: { duration: 0.5, ease: "easeInOut", filter: { repeat: Infinity, duration: 3, ease: "linear" } },
        perspective: 1000,
      },
    };

    // Framer Motion Variants for the signup form card itself
    const formCardVariants:Variants = {
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

    // Framer Motion Variants for form elements (staggered entrance)
    const formItemVariants:Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    // Framer Motion Variants for input fields (hover and focus effect)
    const inputVariants = {
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
  
    return (
        
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
              <GlobalBackground isDark={isDark}></GlobalBackground>
                {/* Back to Home Button */}
                

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

                {/* SkillSense.AI background element */}
                <div
                    className={`absolute left-0 top-0 bottom-0 w-1/2 hidden lg:flex flex-col items-center justify-center  overflow-hidden z-10`}
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
                        transition={{opacity: {
                          type: "spring",
                          damping: 15,
                          stiffness: 80,
                          delay: 0.8 // Opacity animates with this delay
                        },
                        y: {
                          type: "spring",
                          damping: 15,
                          stiffness: 80,
                          delay: 1.1 // 'y' animates with this delay
                        } }}
                    >
                        Your future, powered by intelligent insights.
                    </motion.p>
                </div>

                {/* Sign Up Form (the main, centered, single column "raindrop" card) */}
                <motion.div
                    className={`w-full max-w-md p-8 sm:p-12 flex flex-col justify-center relative z-20 mx-auto
                        rounded-[4rem] transition-all duration-300 lg:left-90
                        ${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/70 border-gray-200'}
                        backdrop-filter backdrop-blur-xl
                        ${isDark ? 'shadow-glow-form-dark' : 'shadow-glow-form-light'}
                        `}
                    initial="hidden"
                    animate="visible"
                    variants={formCardVariants}
                    whileHover="hover"
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
                    className={`top-8 mb-3 -mt-2 left-8 px-3 text-centre py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-md cursor-pointer
                        ${isDark ? ' text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                        transition-colors duration-300 transform hover:scale-105`}
                >
                    ← Back to home
                  </motion.button>
                    <div className="text-center ">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} drop-shadow-md`}
                        >
                            Create your account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className={`mt-2 text-md ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                            Get personalized career insights and roadmap
                        </motion.p>
                    </div>

                    {/* Google Sign Up */}
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

                    {/* Signup Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
                        className="mt-6 space-y-4"
                    >
                        {/* Name Field */}
                        <motion.div variants={formItemVariants}>
                            <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                            <motion.div
                                className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} ${errors.name ? 'border-red-500' : ''} overflow-hidden`}
                                initial="rest"
                                whileHover="hover"
                                whileFocus="focus"
                                variants={inputVariants}
                            >
                                <span className={`inline-flex items-center px-3 rounded-l-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} text-sm`}><FiUser className="w-4 h-4" /></span>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`flex-1 block w-full px-3 py-2 text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-0 outline-none`} />
                            </motion.div>
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </motion.div>

                        {/* Email Field with OTP */}
                        <motion.div variants={formItemVariants}>
                            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                            <div className="flex gap-2">
                                <motion.div
                                    className={`flex rounded-xl shadow-sm flex-1 ${isDark ? 'border-gray-600' : 'border-gray-300'} ${errors.email ? 'border-red-500' : ''} overflow-hidden`}
                                    initial="rest"
                                    whileHover="hover"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                >
                                    <span className={`inline-flex items-center px-3 rounded-l-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} text-sm`}><FiMail className="w-4 h-4" /></span>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={isOTPSent} className={`flex-1 block w-full px-3 py-2 text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-0 outline-none`} />
                                </motion.div>
                                <motion.button type="button" onClick={sendOTP} disabled={isOTPSent || loading}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer
                                        ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-50 transition-colors`}>
                                    {loading && !isOTPSent ? 'Sending...' : 'Send OTP'}
                                </motion.button>
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </motion.div>

                        {/* OTP Section */}
                        {isOTPSent && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} variants={formItemVariants}>
                                <label htmlFor="otp" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Enter OTP</label>
                                <div className="flex gap-2 items-center">
                                    <motion.input type="text" id="otp" value={otp} onChange={e => { setOtp(e.target.value); if (errors.otp) setErrors({ ...errors, otp: '' }) }} maxLength={6} placeholder="Enter 6-digit OTP"
                                        className={`flex-1 rounded-xl shadow-sm px-3 py-2 text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border ${errors.otp ? 'border-red-500' : ''} focus:ring-0 outline-none`}
                                        initial="rest"
                                        whileHover="hover"
                                        whileFocus="focus"
                                        variants={inputVariants}
                                    />
                                    <motion.button type="button" onClick={verifyOTP} disabled={isOTPVerified || loading}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer
                                            ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors disabled:opacity-50`}>
                                        {loading && !isOTPVerified ? 'Verifying...' : 'Verify'}{isOTPVerified && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><FiCheckCircle className="w-4 h-4" /></motion.span>}
                                    </motion.button>
                                </div>
                                {(otpError || errors.otp) && <motion.div initial={{ x: -10 }} animate={{ x: [0, 10, -10, 0] }} transition={{ duration: 0.3 }} className="mt-2 flex items-center gap-1 text-red-500 text-sm"><FiXCircle className="w-4 h-4" />{errors.otp || 'Invalid OTP. Please try again.'}</motion.div>}
                            </motion.div>
                        )}

                        {/* Password Field */}
                        <motion.div variants={formItemVariants}>
                            <label
                                htmlFor="password"
                                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Password
                            </label>
                            <motion.div
                                className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} ${errors.password ? 'border-red-500' : ''} overflow-hidden`}
                                initial="rest"
                                whileHover="hover"
                                whileFocus="focus"
                                variants={inputVariants}
                            >
                                <span
                                    className={`inline-flex items-center px-3 rounded-l-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} text-sm`}
                                >
                                    <FiLock className="w-4 h-4" />
                                </span>

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`flex-1 block w-full px-3 py-2 text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-0 outline-none`}
                                />

                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    className={`inline-flex items-center px-3 rounded-r-xl focus:outline-none cursor-pointer
                                        ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} transition-colors`}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </motion.div>

                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div variants={formItemVariants}>
                            <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                            <motion.div
                                className={`flex rounded-xl shadow-sm border ${isDark ? 'border-gray-600' : 'border-gray-300'} ${errors.confirmPassword ? 'border-red-500' : ''} overflow-hidden`}
                                initial="rest"
                                whileHover="hover"
                                whileFocus="focus"
                                variants={inputVariants}
                            >
                                <span className={`inline-flex items-center px-3 rounded-l-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} text-sm`}><FiLock className="w-4 h-4" /></span>
                                <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`flex-1 block w-full px-3 py-2 text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-0 outline-none`} />
                            </motion.div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                        </motion.div>

                        {/* Display Error Message */}
                        {(errors.name || errors.email || errors.password || errors.confirmPassword || errors.otp) &&
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-500 text-center mt-4"
                            >
                                {errors.name || errors.email || errors.password || errors.confirmPassword || errors.otp}
                            </motion.p>
                        }


                        {/* Continue Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02, boxShadow: isDark ? '0 10px 30px rgba(56, 189, 248, 0.4)' : '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-md font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                                ${isDark
                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                                }`}
                        >
                            {loading ? 'Creating account...' : 'Continue'}
                            {!loading && <FiArrowRight className="w-4 h-4 ml-1" />}
                        </motion.button>

                        {/* Login Link */}
                        <p className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Already have an account?{' '}
                            <a href="/login" className={`font-medium transition-colors duration-200 cursor-pointer
                                ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>Sign in</a>
                        </p>
                    </motion.form>
                </motion.div>

                
            </div>

    );
}