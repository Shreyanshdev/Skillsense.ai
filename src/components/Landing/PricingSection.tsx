'use client'; // Crucial for Next.js Client Components

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import { Check, X, Zap, Crown, Rocket, Star, ArrowRight, Sparkles } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  excludedFeatures?: string[];
  popular: boolean;
  premium: boolean;
  icon: React.ReactNode;
  gradient: string; // Gradient for dark mode background/accents
  lightGradient?: string; // NEW: Gradient for light mode background/accents
  buttonText: string;
  badge?: string;
}

interface PricingSectionProps {
  isDark: boolean; // Prop to control theme
}

const PricingSection: React.FC<PricingSectionProps> = ({ isDark }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasAnimated, setHasAnimated] = useState(false); // To ensure entrance animations run only once

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: isAnnual ? 0 : 0,
      period: 'Forever Free',
      description: 'Perfect for getting started with AI-powered career tools',
      features: [
        'Basic Resume Analysis',
        'AI Career Chat (10 messages/day)',
        'Job Market Insights',
        'Basic Interview Tips',
        'Community Access'
      ],
      excludedFeatures: [
        'Advanced Resume Optimization',
        'Unlimited AI Chat',
        'Personal Career Roadmap',
        'Interview Simulation',
        'Priority Support'
      ],
      popular: false,
      premium: false,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-gray-600 to-gray-700', // Dark mode gradient
      lightGradient: 'from-gray-300 to-gray-400', // Light mode gradient
      buttonText: 'Get Started Free'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: isAnnual ? 29 : 39,
      originalPrice: isAnnual ? 39 : 49,
      period: isAnnual ? '/month (billed annually)' : '/month',
      description: 'Ideal for job seekers and career changers',
      features: [
        'Advanced Resume Analysis & Optimization',
        'Unlimited AI Career Chat',
        'Personalized Career Roadmap',
        'Interview Simulation & Feedback',
        'Skill Gap Analysis',
        'ATS Resume Optimization',
        'Salary Negotiation Guide',
        'Priority Email Support'
      ],
      popular: true,
      premium: false,
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-sky-500 to-blue-600', // Dark mode gradient
      lightGradient: 'from-blue-500 to-indigo-600', // Light mode gradient (vibrant blue)
      buttonText: 'Start Professional',
      badge: 'Most Popular'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: isAnnual ? 99 : 129,
      originalPrice: isAnnual ? 129 : 159,
      period: isAnnual ? '/month (billed annually)' : '/month',
      description: 'For professionals seeking premium career acceleration',
      features: [
        'Everything in Professional',
        '1-on-1 Career Coaching Sessions',
        'Executive Resume Writing',
        'LinkedIn Profile Optimization',
        'Personal Branding Strategy',
        'Network Building Guidance',
        'Interview Guarantee Program',
        '24/7 Priority Support',
        'Custom Learning Paths',
        'Industry Expert Connections'
      ],
      popular: false,
      premium: true,
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600', // Dark mode gradient
      lightGradient: 'from-fuchsia-500 to-rose-600', // Light mode gradient (vibrant pink/red)
      buttonText: 'Go Enterprise',
      badge: 'Premium'
    }
  ];

  // Animation variants (these remain universal, colors handled by theme prop)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1, // Stagger children animations
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  useEffect(() => {
    setHasAnimated(true); // Ensures entrance animations run only once

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id='pricing'  className={`relative py-24 overflow-hidden ${isDark ? 'bg-transparent' : 'bg-white'}`}>
      {/* Background elements - Conditional based on isDark */}
      <div className={`absolute inset-0 ${isDark ? 'bg-transparent' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        {/* Mouse-based radial gradient */}
        <div
          className={`absolute inset-0 transition-all duration-1000`}
          style={{
            background: isDark
              ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.08) 0%, transparent 50%)`
              : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(100, 150, 255, 0.08) 0%, transparent 50%)`
          }}
        ></div>

        {/* Animated background orbs */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-float-slow ${isDark ? 'bg-sky-400/3' : 'bg-blue-300/10'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float-slow ${isDark ? 'bg-blue-500/3' : 'bg-purple-300/10'}`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern (opacity still applies) */}
      <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-[0.03]'}`}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? `radial-gradient(circle at center, rgba(56, 189, 248, 0.3) 1px, transparent 1px)`
              : `radial-gradient(circle at center, rgba(100, 150, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="flex items-center justify-center gap-2 mb-6" variants={itemVariants}>
            <Rocket className={`w-5 h-5 animate-pulse ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
            <p className={`font-medium text-sm tracking-wider uppercase ${isDark ? 'text-sky-400' : 'text-blue-600'}`}>
              PRICING PLANS
            </p>
            <div className={`w-12 h-px ${isDark ? 'bg-gradient-to-r from-sky-400 to-transparent' : 'bg-gradient-to-r from-blue-600 to-transparent'}`}></div>
          </motion.div>

          <h2 className={`text-4xl lg:text-5xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <motion.span className="inline-block" variants={itemVariants}>Choose</motion.span>{' '}
            <motion.span className="inline-block" variants={itemVariants}>Your</motion.span>{' '}
            <motion.span
              className={`bg-clip-text text-transparent italic inline-block ${isDark ? 'bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700'}`}
              variants={itemVariants}
            >
              Success
            </motion.span>{' '}
            <motion.span className="inline-block" variants={itemVariants}>Plan</motion.span>
          </h2>

          <motion.p className={`text-lg max-w-2xl mx-auto mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} variants={itemVariants}>
            Unlock your career potential with our AI-powered tools and personalized guidance
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            className="flex items-center justify-center gap-4"
            initial="hidden"
            animate={hasAnimated ? "visible" : "hidden"}
            variants={itemVariants}
          >
            <span className={`text-sm font-medium transition-colors duration-300 ${
              !isAnnual
                ? isDark ? 'text-white' : 'text-gray-900'
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isAnnual
                  ? isDark ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700'
                  : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className={`absolute top-1 w-5 h-5 bg-white rounded-full ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              ></motion.div>
            </button>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              isAnnual
                ? isDark ? 'text-white' : 'text-gray-900'
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Annual
            </span>
            {isAnnual && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="ml-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full animate-pulse"
                >
                  Save 25%
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="relative group"
              variants={itemVariants}
              whileHover={{ scale: 1.03, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`px-4 py-1 rounded-full text-xs font-bold text-white ${
                    plan.popular
                      ? isDark ? 'bg-gradient-to-r from-sky-400 to-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700'
                      : isDark ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-fuchsia-600 to-rose-700'
                  } animate-pulse`}>
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Card */}
              <motion.div
                className={`relative h-full backdrop-blur-xl rounded-3xl p-8 border overflow-hidden
                  ${isDark
                    ? `bg-gradient-to-br from-gray-800/50 to-gray-900/50 ${plan.popular ? 'border-sky-400/50 shadow-lg shadow-sky-400/20' : plan.premium ? 'border-purple-400/50 shadow-lg shadow-purple-400/20' : 'border-gray-700/50 hover:border-sky-400/30'}`
                    : `bg-gradient-to-br from-white/80 to-gray-100/80 ${plan.popular ? 'border-blue-300 shadow-lg shadow-blue-200' : plan.premium ? 'border-fuchsia-300 shadow-lg shadow-fuchsia-200' : 'border-gray-300 hover:border-blue-300'}`
                  }`}
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-10'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    plan.popular
                      ? (isDark ? 'from-sky-400/20 to-blue-500/20' : 'from-blue-400/20 to-indigo-500/20')
                      : plan.premium
                      ? (isDark ? 'from-purple-400/20 to-pink-500/20' : 'from-fuchsia-400/20 to-rose-500/20')
                      : (isDark ? 'from-gray-400/20 to-gray-500/20' : 'from-gray-300/20 to-gray-400/20')
                  }`}></div>
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 ${isDark ? 'bg-white/5' : 'bg-gray-200/50'}`}></div>
                </div>

                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-r ${isDark ? plan.gradient : plan.lightGradient} text-white`}
                      whileHover={{ rotate: 5 }}
                    >
                      {plan.icon}
                    </motion.div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      {plan.originalPrice && (
                        <span className={`text-2xl line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>${plan.originalPrice}</span>
                      )}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={plan.price}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`text-5xl font-bold inline-block ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          ${plan.price}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.period}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.popular
                            ? (isDark ? 'bg-sky-400/20 text-sky-400' : 'bg-blue-600/10 text-blue-600')
                            : plan.premium
                            ? (isDark ? 'bg-purple-400/20 text-purple-400' : 'bg-fuchsia-600/10 text-fuchsia-600')
                            : (isDark ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-300/30 text-gray-700')
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </div>
                    ))}

                    {plan.excludedFeatures?.map((feature, featureIndex) => (
                      <div key={`excluded-${featureIndex}`} className="flex items-start gap-3 opacity-50">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-gray-600/20 text-gray-500">
                          <X className="w-3 h-3" />
                        </div>
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-white overflow-hidden relative ${
                      plan.popular
                        ? (isDark ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-400/30' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-400/30')
                        : plan.premium
                        ? (isDark ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-lg shadow-purple-400/30' : 'bg-gradient-to-r from-fuchsia-600 to-rose-700 hover:from-fuchsia-500 hover:to-rose-600 shadow-lg shadow-fuchsia-400/30')
                        : (isDark ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600' : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700') // Updated light mode for basic plan button
                    }`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? '' : 'hidden'}`}></div> {/* Hide glow in light mode for simpler look */}
                    <span className="relative flex items-center justify-center gap-2">
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </motion.button>
                </div>

                {/* Glow effect for cards - Conditional based on isDark */}
                <div className={`absolute -inset-4 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? (
                  plan.popular
                    ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20'
                    : plan.premium
                    ? 'bg-gradient-to-r from-purple-400/20 to-pink-500/20'
                    : 'bg-gradient-to-r from-gray-400/20 to-gray-500/20'
                ) : 'hidden'}`}></div> {/* Hidden in light mode */}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${isDark ? 'bg-gradient-to-r from-green-400/20 to-emerald-500/20 border-green-400/30' : 'bg-green-100 border-green-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-green-500'}`}>
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>30-Day Money-Back Guarantee</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
          variants={itemVariants}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className={`w-4 h-4 animate-pulse ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h3>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Can I switch plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "Our Starter plan is completely free forever. You can also try Professional or Enterprise with our 30-day money-back guarantee."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className={`rounded-2xl p-6 border hover:border-sky-400/30 ${isDark ? 'bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700/30' : 'bg-white shadow-sm border-gray-200 hover:border-blue-400'}`}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h4>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;