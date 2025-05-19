'use client';

import { motion } from 'framer-motion';
import {  useState ,useMemo , useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Navbar from '@/components/NavBar';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaBrain, FaChartLine, FaUserGraduate } from 'react-icons/fa';


// Separate Bubbles component for client-only rendering
const Bubbles = ({ theme }: { theme: string }) => {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 10 }).map(() => {
        const size = Math.random() * 100 + 50;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const xInitial = Math.random() * 100;
        const xAnimate = Math.random() * 100 - 50;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;
        return { size, left, top, xInitial, xAnimate, duration, delay };
      }),
    []
  );
  return (
    <>
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, x: bubble.xInitial }}
          animate={{ y: [0, -100, -200, -300], x: [0, bubble.xAnimate], opacity: [1, 0.8, 0.5, 0] }}
          transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay }}
          className={`absolute rounded-full ${
            theme === 'dark' ? 'bg-sky-900/20 border border-sky-800/30' : 'bg-sky-200/50 border border-sky-300/50'
          }`}
          style={{ width: `${bubble.size}px`, height: `${bubble.size}px`, left: `${bubble.left}%`, top: `${bubble.top}%` }}
        />
      ))}
    </>
  );
};

// Dynamically load Bubbles on client only
const NoSSR_Bubbles = dynamic(() => Promise.resolve(Bubbles), { ssr: false });


export default function LandingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
  const theme = useSelector((state: RootState) => state.theme.theme);


  // Feature cards data
  const features = [
    {
      icon: <FaBrain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Get instant insights into your skills and career potential"
    },
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: "Personalized Roadmap",
      description: "Step-by-step guidance tailored just for you"
    },
    {
      icon: <FaUserGraduate className="w-6 h-6" />,
      title: "Skill Gap Detection",
      description: "Know exactly what to learn to reach your goals"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 -z-10 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900'
              : 'bg-gradient-to-br from-sky-50 to-blue-50'
          }`}
        />
        
        {/* Floating bubbles */}
        <NoSSR_Bubbles theme={theme} />

        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-4xl font-bold tracking-tight sm:text-6xl ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Supercharge Your Career with <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">AI</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`mt-6 text-lg leading-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              SkillSense.AI analyzes your resume, skills, and goals to create a personalized career roadmap that gets you hired faster.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <motion.button
                onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => router.push('/login'), 1500);
                  }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-x-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-sky-500/30 transition-all"
              >
                Get Started <FiArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-x-2 rounded-full px-6 py-3 text-sm font-semibold ${
                  theme === 'dark'
                    ? 'text-white bg-gray-800 hover:bg-gray-700'
                    : 'text-gray-900 bg-white hover:bg-gray-100'
                } shadow-lg transition-all`}
              >
                <FiArrowRight className="w-4 h-4" /> See How It Works
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mx-auto max-w-2xl lg:text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold tracking-tight sm:text-4xl ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Everything you need to advance your career
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className={`mt-6 text-lg leading-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Our AI-powered platform gives you the tools and insights to identify and develop the skills employers want.
            </motion.p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col rounded-2xl p-6 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:bg-gray-50'
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    theme === 'dark' ? 'bg-sky-900/50' : 'bg-sky-100'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className={`mt-6 text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`mt-2 flex-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center text-sm font-medium ${
                      theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
                    }`}>
                      Learn more <FiArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className={`py-24 sm:py-32 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Trusted by students worldwide
            </h2>
          </motion.div>
          
          {/* Testimonial cards */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: "Sarah K.",
                role: "Computer Science Student",
                content: "SkillSense helped me identify the exact skills I needed to land my dream internship at Google!",
                delay: 0
              },
              {
                name: "Michael T.",
                role: "Recent Graduate",
                content: "The personalized learning path cut my job search time in half. Got 3 offers in 2 months!",
                delay: 0.1
              },
              {
                name: "Priya M.",
                role: "Career Changer",
                content: "At 35, I thought it was too late to switch to tech. SkillSense proved me wrong!",
                delay: 0.2
              }
            ].map((testimonial) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: testimonial.delay }}
                viewport={{ once: true }}
                className={`flex flex-col rounded-2xl p-8 ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                } shadow-lg`}
              >
                <div className="flex items-center gap-x-4">
                  <div className={`h-12 w-12 flex items-center justify-center rounded-full ${
                    theme === 'dark' ? 'bg-sky-900/50' : 'bg-sky-100'
                  }`}>
                    <span className="text-lg font-medium">{
                      testimonial.name.charAt(0)
                    }</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className={`mt-6 flex-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  "{testimonial.content}"
                </p>
                <div className="mt-6 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? 'text-amber-400' : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="absolute -left-16 -top-16 -z-10">
            <div className={`h-32 w-32 rounded-full ${
              theme === 'dark' ? 'bg-sky-900/20' : 'bg-sky-100'
            } blur-3xl`} />
          </div>
          <div className="absolute -right-16 -bottom-16 -z-10">
            <div className={`h-32 w-32 rounded-full ${
              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
            } blur-3xl`} />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`mx-auto max-w-2xl rounded-3xl p-8 text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-xl`}
          >
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to transform your career?
            </h2>
            <p className={`mx-auto mt-6 max-w-xl text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of students who accelerated their careers with SkillSense.AI
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-x-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-sky-500/30 transition-all"
              >
                Get Started Free <FiArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-x-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-full border-2 ${
                      theme === 'dark' ? 'border-gray-800' : 'border-white'
                    }`}
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10})`,
                      backgroundSize: 'cover',
                      zIndex: 5 - i
                    }}
                  />
                ))}
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Join 5,000+ students today
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}