'use client';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const links = [
    {
      name: "Features",
      items: ["AI Analysis", "Career Roadmap", "Skill Assessment", "Job Matching"]
    },
    {
      name: "Resources",
      items: ["Blog", "Guides", "Webinars", "Help Center"]
    },
    {
      name: "Company",
      items: ["About Us", "Careers", "Privacy Policy", "Terms of Service"]
    }
  ];

  const socialLinks = [
    {
      icon: <FiGithub className="w-5 h-5" />,
      href: "#"
    },
    {
      icon: <FiTwitter className="w-5 h-5" />,
      href: "#"
    },
    {
      icon: <FiLinkedin className="w-5 h-5" />,
      href: "#"
    },
    {
      icon: <FiMail className="w-5 h-5" />,
      href: "#"
    }
  ];

  return (
    <footer className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                SkillSense<span className="text-sky-500">.AI</span>
              </h2>
              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                The AI-powered career companion that helps you identify, develop, and showcase the skills employers want.
              </p>
            </motion.div>
            
            {/* Social links */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-6 flex space-x-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  whileHover={{ y: -2 }}
                  href={social.href}
                  className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm`}
                >
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {social.icon}
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {links.map((section, index) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {section.name}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a 
                      href="#" 
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`mt-12 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
        />

        {/* Bottom section */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
          >
            © {new Date().getFullYear()} SkillSense.AI. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-4 md:mt-0 flex space-x-6"
          >
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
              Privacy Policy
            </a>
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
              Terms of Service
            </a>
            <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
              Cookies
            </a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}