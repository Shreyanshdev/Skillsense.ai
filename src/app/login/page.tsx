'use client';

import { useState } from 'react'; // Import useState
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FiArrowRight, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginPage() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const router = useRouter(); // Initialize router

  // State for form inputs and loading/error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for displaying errors

  // Handle form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true); // Start loading state
    setError(null); // Clear previous errors

    // Basic client-side validation
    if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json(); // Parse the JSON response
      console.log(data) 

      if (res.ok && data.success) {
        // Login successful
        console.log('Login successful:', data);
        // Store the token (e.g., in localStorage)
        localStorage.setItem('token', data.token);
        // You might also dispatch a Redux action here to update auth state

        // Redirect to dashboard or home page
        router.replace('/evaluation'); // Adjust the redirect path as needed

      } else {
        // Login failed
        console.error('Login failed:', data.message);
        setError(data.message || 'Login failed. Please try again.'); // Display error message from API
      }

    } catch (error: any) {
      console.error('Login API error:', error);
      setError('An error occurred during login. Please try again later.'); // Display generic error message
    } finally {
      setLoading(false); // End loading state
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
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Sign in to your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Access your personalized dashboard and insights
            </motion.p>
          </div>

          {/* Google Sign In */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } transition-colors`}
            // Add onClick handler for Google Sign In here
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </motion.button>

          <div className={`flex items-center mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <span className="px-3 text-sm">or</span>
            <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 space-y-4"
            onSubmit={handleLogin} // Attach the submit handler
          >
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  id="email"
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  } border-none focus:ring-1`}
                  placeholder="you@example.com"
                  value={email} // Bind value to state
                  onChange={(e) => setEmail(e.target.value)} // Update state on change
                  required // Add HTML validation
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
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
                  name="password"
                  id="password"
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  } border-none focus:ring-1`}
                  placeholder="••••••••"
                  value={password} // Bind value to state
                  onChange={(e) => setPassword(e.target.value)} // Update state on change
                  required // Add HTML validation
                />
              </div>


            {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <a
                  href="/reset"
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Forgot password?
                </a>
              </div>
            </div>

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
              type="submit" // Use type="submit" to trigger form onSubmit
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-medium text-white shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading} // Disable button while loading
              //onClick={() => router.push('/evaluation')} // Redirect to evaluation page on click
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </motion.button>

            {/* Signup Link */}
            <p className={`mt-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Don&apos;t have an account?{' '}
              <a
                href="/signup" // Adjust signup path as needed
                className={`font-medium ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-500'
                }`}
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