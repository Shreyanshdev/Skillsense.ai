'use client';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FiArrowRight, FiUser, FiMail, FiLock, FiCheckCircle, FiXCircle ,FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';


export default function OnboardingPage() {
    const theme = useSelector((state: RootState) => state.theme.theme);
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
    const router = useRouter();
  
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
        const { data }: { data: any } = await axios.post('/api/auth/send-otp', { email: formData.email });
        if ((data as { success: boolean }).success) {
          setIsOTPSent(true);
          setOtpError(false);
          setIsOTPVerified(false);
          setErrors({ ...errors, email: '' });
        } else {
          setErrors({ ...errors, email: data.message });
        }
      } catch (err: any) {
        setErrors({ ...errors, email: err.response?.data?.message || 'Failed to send OTP' });
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
        if ((data as any).success) {
          setIsOTPVerified(true);
          setOtpError(false);
          setErrors({ ...errors, otp: '' });
        } else {
          setErrors({ ...errors, otp: (data as any).message });
          setOtpError(true);
        }
      } catch (err: any) {
        setErrors({ ...errors, otp: err.response?.data?.message || 'Verification failed' });
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
        if ((data as any).success) router.push('/dashboard');
        else setErrors({ ...errors, ...(data as any).errors });
      } catch (err: any) {
        setErrors({ ...errors, email: err.response?.data?.message || 'Signup failed' });
      } finally {
        setLoading(false);
      }
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
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create your account</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Get personalized career insights and roadmap</motion.p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`mt-6 w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}>
            <FcGoogle className="w-5 h-5" /> Continue with Google
          </motion.button>
          <div className={`flex items-center mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}><div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} /><span className="px-3 text-sm">or</span><div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} /></div>
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-6 space-y-4">

            {/* Name Field */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
              <div className={`flex rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} ${errors.name ? 'border-red-500' : ''}`}>
                <span className={`inline-flex items-center px-3 rounded-l-md ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'} text-sm`}><FiUser className="w-4 h-4" /></span>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`flex-1 block w-full px-3 py-2 text-sm ${theme==='dark'? 'bg-gray-700 text-white placeholder-gray-400': 'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-blue-500 focus:border-blue-500`} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>


            {/* Email Field with OTP */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark'? 'text-gray-300':'text-gray-700'}`}>Email</label>
              <div className="flex gap-2">
                <div className={`flex rounded-md shadow-sm flex-1 ${theme==='dark'? 'bg-gray-700':'bg-white'} border ${theme==='dark'?'border-gray-600':'border-gray-300'} ${errors.email?'border-red-500':''}`}>
                  <span className={`inline-flex items-center px-3 rounded-l-md ${theme==='dark'? 'bg-gray-600 text-gray-300':'bg-gray-100 text-gray-500'} text-sm`}><FiMail className="w-4 h-4" /></span>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={isOTPSent} className={`flex-1 block w-full px-3 py-2 text-sm ${theme==='dark'? 'bg-gray-700 text-white placeholder-gray-400':'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-blue-500 focus:border-blue-500`} />
                </div>
                <button type="button" onClick={sendOTP} disabled={isOTPSent||loading} className={`px-4 rounded-lg text-sm font-medium ${theme==='dark'? 'bg-blue-600 hover:bg-blue-700 text-white':'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-50 transition-colors`}>{loading&&!isOTPSent?'Sending...':'Send OTP'}</button>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>


            {/* OTP Section */}
            {isOTPSent && (<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="mt-4">
              <label htmlFor="otp" className={`block text-sm font-medium mb-1 ${theme==='dark'? 'text-gray-300':'text-gray-700'}`}>Enter OTP</label>
              <div className="flex gap-2 items-center">
                <input type="text" id="otp" value={otp} onChange={e=>{setOtp(e.target.value); if(errors.otp) setErrors({...errors,otp:''})}} maxLength={6} placeholder="Enter 6-digit OTP" className={`flex-1 rounded-md shadow-sm px-3 py-2 text-sm ${theme==='dark'? 'bg-gray-700 text-white border-gray-600':'bg-white text-gray-900 border-gray-300'} border ${errors.otp?'border-red-500':''} focus:ring-blue-500 focus:border-blue-500`} />
                <button type="button" onClick={verifyOTP} disabled={isOTPVerified||loading} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${theme==='dark'? 'bg-blue-600 hover:bg-blue-700 text-white':'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors disabled:opacity-50`}>{loading&&!isOTPVerified?'Verifying...':'Verify'}{isOTPVerified&&<motion.span initial={{scale:0}} animate={{scale:1}}><FiCheckCircle className="w-4 h-4"/></motion.span>}</button>
              </div>
              {(otpError||errors.otp)&&<motion.div initial={{x:-10}} animate={{x:[0,10,-10,0]}} transition={{duration:0.3}} className="mt-2 flex items-center gap-1 text-red-500 text-sm"><FiXCircle className="w-4 h-4"/>{errors.otp||'Invalid OTP. Please try again.'}</motion.div>}
            </motion.div>)}


            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Password
              </label>
              <div
                className={`flex rounded-md shadow-sm ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                } ${errors.password ? 'border-red-500' : ''}`}
              >
                <span
                  className={`inline-flex items-center px-3 rounded-l-md ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                  } text-sm`}
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
                  className={`flex-1 block w-full px-3 py-2 text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } border-none focus:ring-blue-500 focus:border-blue-500`}
                />

                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className={`inline-flex items-center px-3 rounded-r-md focus:outline-none ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                  }`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>

              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>


            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${theme==='dark'? 'text-gray-300':'text-gray-700'}`}>Confirm Password</label>
              <div className={`flex rounded-md shadow-sm ${theme==='dark'? 'bg-gray-700':'bg-white'} border ${theme==='dark'? 'border-gray-600':'border-gray-300'} ${errors.confirmPassword?'border-red-500':''}`}>
                <span className={`inline-flex items-center px-3 rounded-l-md ${theme==='dark'? 'bg-gray-600 text-gray-300':'bg-gray-100 text-gray-500'} text-sm`}><FiLock className="w-4 h-4"/></span>
                <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`flex-1 block w-full px-3 py-2 text-sm ${theme==='dark'? 'bg-gray-700 text-white placeholder-gray-400':'bg-white text-gray-900 placeholder-gray-500'} border-none focus:ring-blue-500 focus:border-blue-500`} />
              </div>
              {errors.confirmPassword&&<p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>


            {/* Continue Button */}
            <motion.button  type="submit"  disabled={loading} whileHover={{scale:1.02}} whileTap={{scale:0.98}} className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-medium text-white shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50">{loading?'Creating account...':'Continue'} <FiArrowRight className="w-4 h-4"/></motion.button>
            <p className={`mt-4 text-center text-sm ${theme==='dark'? 'text-gray-400':'text-gray-500'}`}>Already have an account? <a href="/login" className={`font-medium ${theme==='dark'? 'text-blue-400 hover:text-blue-300':'text-blue-600 hover:text-blue-500'}`}>Sign in</a></p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
