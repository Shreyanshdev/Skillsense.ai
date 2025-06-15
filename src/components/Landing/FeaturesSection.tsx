'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useViewportScroll, useSpring, useTransform, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
// import GlobalBackground from './GlobalBackground'; // Remove or comment out if you don't want a background from this component
// BrandScroll, TestimonialSection, PricingSection, Footer are not in this file, so they are not directly affected by this change.

interface Feature {
  title: string;
  description: string;
  imageSrc: string;
  ctaLink: string;
}


interface FeatureSectionProps {
  isDark: boolean; // Prop to control theme
  onGetStarted :() => void; // Callback for "Get Started" button
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ isDark , onGetStarted }) => {
 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // This state might be for an internal background effect, if GlobalBackground is removed, it might not be used.
  
  // State for scroll-based visibility
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionInView, setSectionInView] = useState(false); // Tracks if section is currently intersecting
  const [hasAppearedOnce, setHasAppearedOnce] = useState(false); // Ensures entrance animation only plays once on first view

  const features: Feature[] = [
    {
      title: 'AI-Driven Career Guide',
      description: 'Make smarter career decisions with tailored advice and real-time market insights. Our AI provides personalized roadmaps based on your skills, interests, and market demands, helping you navigate your career path with confidence.',
      imageSrc: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      ctaLink: '#',
    },
    {
      title: 'Interview Evaluation',
      description: 'Get a detailed report on your interview performance and areas for improvement. Our system analyzes your responses, body language, and communication style, providing actionable feedback to help you ace your next interview.',
      imageSrc: 'https://images.pexels.com/photos/5439381/pexels-photo-5439381.jpeg?auto=compress&cs=tinysrgb&w=800',
      ctaLink: '#',
    },
    {
      title: 'AI Career Chat',
      description: 'Chat with an AI agent to get instant answers about career paths and industry trends. Get real-time advice on salary expectations, job market outlooks, and necessary skills for various industries, available 24/7.',
      imageSrc: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      ctaLink: '#',
    },
    {
      title: 'Resume Analyzer',
      description: 'Comprehensive analysis of your resume, identifying strengths and optimization opportunities. Ensure your resume passes ATS scans and highlights your best assets to stand out from the crowd and land your dream job.',
      imageSrc: '/resum.png',
      ctaLink: '#',
    },
    {
      title: 'Personalized Learning Paths',
      description: 'Customized learning recommendations to fill skill gaps and prepare you for future career challenges. Access curated courses and resources tailored to your goals and accelerate your professional growth.',
      imageSrc: '/personal.png',
      ctaLink: '#',
    },
    {
      title: 'Job Market Insights',
      description: 'Stay ahead with real-time data on job availability, salary trends, and industry growth. Make informed decisions about your next career move with comprehensive data-driven insights and market analysis.',
      imageSrc: '/testReport.png',
      ctaLink: '#',
    },
  ];

  // Mouse position for background effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const nextFeature = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  }, [features.length]);

  const prevFeature = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  }, [features.length]);

  const goToFeature = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  const currentFeature = features?.[currentIndex];

  // --- Scroll-Based Visibility and Animation ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionInView(true);
            setHasAppearedOnce(true); // Mark that it has appeared
          } else {
            // Check if section is completely out of view above or below
            // If it's below the viewport (scrolled past), set to false
            if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
                 setSectionInView(false);
            }
          }
        });
      },
      { threshold: 0.1 } // Section is considered "in view" if 10% is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Define Framer Motion variants for section
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 100, transition: { duration: 0.6, ease: "easeOut" } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Variants for staggered children animations
  const containerVariants : Variants= {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger text elements
        delayChildren: 0.3, // Delay start of children animations
      },
    },
  };

  const itemVariants : Variants= {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring", // Use spring for a bouncier feel
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const imageHoverVariants = {
    hover: { scale: 1.05, boxShadow: isDark ? "0 0 40px rgba(56, 189, 248, 0.4)" : "0 0 40px rgba(0, 123, 255, 0.3)" },
    initial: { scale: 1, boxShadow: "none" },
  };


  return (
    <motion.section
      ref={sectionRef}
      id="tools"

      className="relative min-h-screen overflow-hidden py-24" // Removed background classes
      variants={sectionVariants}
      initial="hidden" // Always start hidden for scroll effect
      animate={sectionInView ? "visible" : "hidden"} // Animate based on intersection observer
    >

      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"} // Only animate if in view
        >
          <motion.div className="flex items-center justify-center gap-2 mb-6" variants={itemVariants}>
            <Sparkles className={`w-5 h-5 animate-pulse ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
            <motion.p className={`text-sm font-medium tracking-wider uppercase ${isDark ? 'text-sky-400' : 'text-blue-500'}`}>
              AI-POWERED FEATURES
            </motion.p>
            <motion.div className={`w-12 h-px ${isDark ? 'bg-gradient-to-r from-sky-400 to-transparent' : 'bg-gradient-to-r from-blue-500 to-transparent'}`}
              initial={{ width: 0 }} animate={{ width: '3rem' }} transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>

          <motion.h2
            className={`text-5xl lg:text-6xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
            variants={containerVariants} 
          >
            <motion.span className="inline-block mr-3" variants={itemVariants}>Transform</motion.span>
            <motion.span className="inline-block mr-3" variants={itemVariants}>Your</motion.span>
            <motion.span
              className={`bg-clip-text text-transparent italic inline-block ${isDark ? 'bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500'}`}
              variants={itemVariants}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }} // Gradient shift animation
              transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: "linear" }}
            >
              Career
            </motion.span>
          </motion.h2>

          <motion.p
            className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            variants={itemVariants}
          >
            Discover our suite of AI-powered tools designed to accelerate your professional growth
          </motion.p>
        </motion.div>

        {/* Main Feature Display */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Content */}
          <motion.div
            key={currentIndex} // Key changes to re-trigger animation on feature change
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants} // Use container variants for text content animation
          >
            <div className="space-y-6">
              <motion.div className="flex items-center gap-3" variants={itemVariants}>
                <motion.div className={`w-2 h-2 rounded-full animate-pulse-dot ${isDark ? 'bg-sky-400' : 'bg-blue-500'}`} />
                <motion.span className={`text-sm font-medium tracking-wider uppercase ${isDark ? 'text-sky-400' : 'text-blue-500'}`}>
                  FEATURE {String(currentIndex + 1).padStart(2, '0')}
                </motion.span>
              </motion.div>

              <motion.h3 className={`text-4xl lg:text-5xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`} variants={itemVariants}>
                {currentFeature?.title}
              </motion.h3>

              <motion.p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`} variants={itemVariants}>
                {currentFeature?.description}
              </motion.p>

              <motion.div className="flex items-center gap-4 pt-4" variants={itemVariants}>
                <motion.button
                  className={`group relative flex items-center justify-center w-14 h-14 rounded-full overflow-hidden
                    ${isDark ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}
                  whileHover={{ scale: 1.1, boxShadow: isDark ? "0px 0px 15px rgba(56, 189, 248, 0.7)" : "0px 0px 15px rgba(0, 123, 255, 0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={onGetStarted} // Call the passed callback on click
                >
                  <motion.div
                    className={`absolute inset-0 rounded-full transition-opacity duration-300 cursor-pointer
                      ${isDark ? 'bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100' : 'bg-gradient-to-r from-blue-500 to-indigo-600 opacity-100 group-hover:opacity-0'}`}
                  />
                  <ArrowRight className={`w-6 h-6 transition-all duration-300 relative z-10 cursor-pointer
                    ${isDark ? 'text-black group-hover:text-white' : 'text-white group-hover:text-white'}`} />
                </motion.button>
                <div className="space-y-1">
                  <span className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Explore feature
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap className={`w-3 h-3 animate-pulse ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    <span className={`text-xs ${isDark ? 'text-sky-400' : 'text-blue-500'}`}>
                      AI-Enhanced
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Feature Image */}
          <motion.div
            key={`image-${currentIndex}`} // Key changes to re-trigger animation on feature change
            className="relative"
            initial="hidden"
            animate="visible"
            variants={imageHoverVariants} // Use image-specific variant
            whileHover="hover"
          >
            <div className={`relative overflow-hidden rounded-2xl p-1
              ${isDark ? 'bg-gradient-to-br from-sky-400/20 to-blue-500/20' : 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20'}`}>
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={currentFeature?.imageSrc}
                  alt={currentFeature?.title}
                  width={800}
                  height={600}
                  className="w-full h-96 object-cover"
                />

                {/* Overlay effects - Theme Aware */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <motion.div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  ${isDark ? 'bg-gradient-to-br from-sky-400/10 to-blue-500/10' : 'bg-gradient-to-br from-blue-400/10 to-indigo-500/10'}`} />

                {/* Floating elements - Theme Aware */}
                <motion.div className={`absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse-dot ${isDark ? 'bg-sky-400' : 'bg-blue-400'}`} />
                <motion.div className={`absolute bottom-4 left-4 w-2 h-2 rounded-full animate-pulse-dot`} style={{ animationDelay: '0.5s', background: isDark ? '#6366f1' : '#d946ef' }} />
              </div>
            </div>

            {/* Glow effect - Theme Aware */}
            <motion.div
              className={`absolute -inset-4 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${isDark ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20' : 'bg-gradient-to-r from-blue-400/20 to-indigo-500/20'}`}
            />
          </motion.div>
        </div>

        {/* Navigation Controls */}
        <motion.div
          className="flex items-center justify-center gap-8 mb-12 "
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
        >
          <motion.button
            onClick={prevFeature}
            className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer
              ${isDark ? 'bg-gray-800/50 border border-sky-400/30 hover:bg-sky-400/20 hover:border-sky-400/60' : 'bg-blue-100/50 border border-blue-300/30 hover:bg-blue-300/20 hover:border-blue-300/60'}`}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-sky-400 group-hover:text-white' : 'text-blue-500 group-hover:text-blue-700'}`} />
          </motion.button>

          {/* Progress indicators */}
          <div className="flex items-center gap-3">
            {features.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToFeature(index)}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 cursor-pointer
                  ${index === currentIndex
                    ? isDark ? 'bg-sky-400' : 'bg-blue-500'
                    : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-200 hover:bg-blue-300'
                  }`}
                animate={index === currentIndex ? { scale: 1.25 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {index === currentIndex && (
                  <motion.div
                    className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-sky-400' : 'bg-blue-500'}`}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{ opacity: [1, 0], scale: [0, 2] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={nextFeature}
            className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer
              ${isDark ? 'bg-gray-800/50 border border-sky-400/30 hover:bg-sky-400/20 hover:border-sky-400/60' : 'bg-blue-100/50 border border-blue-300/30 hover:bg-blue-300/20 hover:border-blue-300/60'}`}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-sky-400 group-hover:text-white' : 'text-blue-500 group-hover:text-blue-700'}`} />
          </motion.button>
        </motion.div>

        {/* Feature Stats */}
        <motion.div
          className="flex items-center justify-center gap-12"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.2 } },
          }}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
        >
          {[
            { number: '6+', label: 'AI Features' },
            { number: '99%', label: 'Accuracy Rate' },
            { number: '24/7', label: 'Availability' }
          ].map((stat) => (
            <motion.div key={stat.label} className="text-center group cursor-pointer" whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <motion.div className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white group-hover:text-sky-400' : 'text-gray-900 group-hover:text-blue-500'}`}>
                {stat.number}
              </motion.div>
              <motion.div className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {stat.label}
              </motion.div>
              <motion.div className={`w-0 h-px mx-auto mt-1 transition-all duration-500 ${isDark ? 'bg-sky-400 group-hover:w-full' : 'bg-blue-500 group-hover:w-full'}`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeatureSection;