'use client';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Make sure this path is correct for your Redux store
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'; // Removed FiTwitter if not used
import { ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Import react-hot-toast for notifications
import React from 'react';

export default function Footer() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [email, setEmail] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading indicator
  const isDark = theme === 'dark';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading
    toast.loading('Subscribing...', { id: 'newsletterToast' }); // Show loading toast

    try {
      const response = await fetch('/api/newsletter', { // API endpoint to be created
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Successfully subscribed!', { id: 'newsletterToast' });
        setEmail(''); // Clear the input field on success
      } else {
        toast.error(data.message || 'Subscription failed. Please try again.', { id: 'newsletterToast' });
      }
    } catch (error) {
      console.error('Error submitting newsletter:', error);
      toast.error('An unexpected error occurred.', { id: 'newsletterToast' });
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const links = [
    { name: 'Features', items: ['AI Analysis', 'Career Roadmap', 'Skill Assessment', 'Job Matching'] },
    { name: 'Resources', items: ['Blog', 'Guides', 'Webinars', 'Help Center'] },
    { name: 'Company', items: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'] }
  ];

  // Your specific social media links
  const socialLinks = [
    { icon: <FiGithub className="w-5 h-5" />, href: 'https://github.com/Shreyanshdev' },
    { icon: <FiLinkedin className="w-5 h-5" />, href: 'https://www.linkedin.com/in/shreyansh-gupta-680025276/' },
    // { icon: <FiTwitter className="w-5 h-5" />, href: '#' },
    { icon: <FiMail className="w-5 h-5" />, href: 'mailto:vasuzx890@gmail.com' } // Direct mailto link
  ];

  return (
    <footer className="transition-colors duration-300">
      <motion.div className="max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
        {/* Newsletter Section */}
        <div className={`border-b  py-16 ${isDark ? 'border-gray-800' : 'border-gray-300'} ${!isDark ? 'bg-gray-100' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-sky-400 animate-pulse" />
                <p className="text-sky-400 font-medium text-sm tracking-wider uppercase">STAY UPDATED</p>
              </div>
              <h2 className={`text-3xl lg:text-4xl font-bold ${isDark ? 'text-white': 'text-black'}  mb-4`}>Get the Latest Career Insights</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Subscribe to our newsletter for exclusive career tips, AI updates, and success stories delivered to your inbox.</p>
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`flex-1 px-4 py-3 ${isDark ? 'bg-gray-800/50 border border-gray-700 text-white focus:bg-gray-800/80' :'bg-gray-100 border border-gray-300 text-gray-900 focus:bg-white' }  rounded-xl  placeholder-gray-400 focus:outline-none focus:border-sky-400  transition-all duration-300`}
                    required
                    disabled={isSubmitting} // Disable input while submitting
                  />
                  <button
                    type="submit"
                    className="group bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    disabled={isSubmitting} // Disable button while submitting
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Top Section */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              SkillSense<span className="text-sky-500">.AI</span>
            </h2>
            <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              The AI-powered career companion that helps you identify, develop, and showcase the skills employers want.
            </p>
            <div className={`mt-6 flex space-x-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank" // Open in new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/50 hover:bg-gray-100/50'} shadow-sm`}
                >
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {links.map((section, idx) => (
            <div key={section.name} className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-sky-400' : 'text-gray-900'}`}>{section.name}</h3>
              <ul className="mt-4 space-y-3">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`mt-12 border-t transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />

        {/* Bottom Section */}
        <div className={`mt-8 flex flex-col md:flex-row justify-between items-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} SkillSense.AI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>Privacy Policy</a>
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-900'} transition-colors`}>Terms of Service</a>
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-900'} transition-colors`}>Cookies</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}