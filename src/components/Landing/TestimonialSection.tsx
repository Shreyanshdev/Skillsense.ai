'use client'; // This directive is crucial for Next.js to treat it as a Client Component

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Use Next.js Image component for optimization
import { ChevronLeft, ChevronRight, Star, Quote, Users, Award } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  companyLogo?: string; // Not currently used, but kept for interface consistency
  achievement: string;
}

interface TestimonialSectionProps {
  isDark: boolean; // Prop to control theme for styling
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior Software Engineer',
      company: 'Google',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The AI-powered career guidance completely transformed my job search. I went from struggling to get interviews to landing my dream role at Google in just 3 months. The personalized roadmap and interview preparation were game-changers.',
      rating: 5,
      achievement: 'Landed dream job at Google'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'Product Manager',
      company: 'Meta',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The resume analyzer identified gaps I never noticed. After implementing the AI suggestions, my interview callback rate increased by 400%. The platform\'s insights are incredibly accurate and actionable.',
      rating: 5,
      achievement: '400% increase in callbacks'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      company: 'Netflix',
      avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The AI chat assistant was like having a personal career coach available 24/7. It helped me negotiate a 40% salary increase and transition into data science from a completely different field.',
      rating: 5,
      achievement: '40% salary increase'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Engineering Manager',
      company: 'Amazon',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The skill gap analysis was eye-opening. It showed me exactly what I needed to learn to advance to a management role. Within 6 months, I was promoted to Engineering Manager at Amazon.',
      rating: 5,
      achievement: 'Promoted to Manager'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'UX Designer',
      company: 'Apple',
      avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The interview evaluation feature helped me identify and fix my weak points. I practiced with the AI feedback and aced my Apple interview. The detailed analysis was incredibly valuable.',
      rating: 5,
      achievement: 'Aced Apple interview'
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'DevOps Engineer',
      company: 'Microsoft',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'From bootcamp graduate to Microsoft engineer in 8 months. The personalized learning path and career roadmap made the impossible possible. This platform is a career game-changer.',
      rating: 5,
      achievement: 'Bootcamp to Microsoft'
    }
  ];

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Navigation functions
  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  const currentTestimonial = testimonials?.[currentIndex];

  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      {/* Background elements removed - parent component will provide background */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 transition-opacity duration-500">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-blue-600'}`} />
            <p className={`font-medium text-sm tracking-wider uppercase ${isDark ? 'text-sky-400' : 'text-blue-600'}`}>
              SUCCESS STORIES
            </p>
            <div className={`w-12 h-px ${isDark ? 'bg-gradient-to-r from-sky-400 to-transparent' : 'bg-gradient-to-r from-blue-600 to-transparent'}`}></div>
          </div>

          <h2 className={`text-4xl lg:text-5xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="inline-block">What</span>{' '}
            <span className="inline-block">Our</span>{' '}
            <span
              className={`bg-clip-text text-transparent inline-block ${isDark ? 'bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600'}`}
            >
              Users
            </span>{' '}
            <span className="inline-block">Say</span>
          </h2>

          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Real stories from professionals who transformed their careers with our AI-powered platform
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="max-w-4xl mx-auto mb-16 relative h-[600px] sm:h-[500px] flex items-center justify-center">
          {/* Animate based on currentIndex change */}
          <div
            key={currentIndex} // Key changes to re-trigger transition on testimonial change
            className="absolute w-full transition-all duration-700 ease-in-out transform opacity-0 scale-95" // Default exit state
            style={{
              // Inline styles for basic transition. On mount, scale and opacity will animate.
              // When key changes, old element fades/scales out, new one fades/scales in.
              opacity: 1,
              transform: 'scale(1) translate(-50%, -50%)',
              top: '50%',
              left: '50%',
              width: '100%',
              height: 'auto',
              maxWidth: '90%',
              
            }}
          >
            {/* Quote Icon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Main Card */}
            <div
              className={`relative backdrop-blur-xl rounded-3xl p-8 sm:p-12 border overflow-hidden transition-all duration-300
                ${isDark ? 'bg-gray-800/50 border-sky-400/20' : 'bg-white/70 border-blue-600/20'}
                hover:${isDark ? 'border-sky-400/40 shadow-xl shadow-sky-400/10' : 'border-blue-600/40 shadow-xl shadow-blue-600/10'}`}
            >
              {/* Background Pattern within card */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-sky-400/20 to-blue-500/20' : 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20'}`}></div>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 ${isDark ? 'bg-sky-400/10' : 'bg-blue-400/10'}`}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-12 -translate-x-12 ${isDark ? 'bg-blue-400/10' : 'bg-purple-400/10'}`}></div>
              </div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(currentTestimonial?.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className={`text-xl sm:text-2xl leading-relaxed text-center mb-8 font-light ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  "{currentTestimonial?.content}"
                </blockquote>

                {/* User Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-sky-400/30">
                      <Image
                        src={currentTestimonial?.avatar || ''} // Ensure src is not undefined
                        alt={currentTestimonial?.name || 'User Avatar'}
                        width={150} // Optimized for Next.js Image
                        height={150} // Optimized for Next.js Image
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <h4 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentTestimonial?.name}</h4>
                    <p className={`font-medium mb-1 ${isDark ? 'text-sky-400' : 'text-blue-600'}`}>{currentTestimonial?.role}</p>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentTestimonial?.company}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20' : 'bg-gradient-to-r from-blue-400/20 to-indigo-500/20'}`}>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">{currentTestimonial?.achievement}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <button
            onClick={prevTestimonial}
            className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer
              ${isDark ? 'bg-gray-800/50 border border-sky-400/30 hover:bg-sky-400/20 hover:border-sky-400/60' : 'bg-blue-100/50 border border-blue-300/30 hover:bg-blue-300/20 hover:border-blue-300/60'}`}
          >
            <ChevronLeft className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-sky-400 group-hover:text-white' : 'text-blue-500 group-hover:text-blue-700'}`} />
          </button>

          {/* Progress indicators */}
          <div className="flex items-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? isDark ? 'bg-sky-400 scale-125' : 'bg-blue-500 scale-125'
                    : isDark ? 'bg-gray-600 hover:bg-gray-500 hover:scale-110' : 'bg-blue-200 hover:bg-blue-300 hover:scale-110'
                }`}
              >
                {/* Ping animation for active dot */}
                {index === currentIndex && (
                  <div className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-sky-400' : 'bg-blue-500'}`} />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer
              ${isDark ? 'bg-gray-800/50 border border-sky-400/30 hover:bg-sky-400/20 hover:border-sky-400/60' : 'bg-blue-100/50 border border-blue-300/30 hover:bg-blue-300/20 hover:border-blue-300/60'}`}
          >
            <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-sky-400 group-hover:text-white' : 'text-blue-500 group-hover:text-blue-700'}`} />
          </button>
        </div>

        {/* Testimonial Grid for Mobile (kept simple without complex animations) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:hidden">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div key={testimonial.id} className={`backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 group
                ${isDark ? 'bg-gray-800/30 border-sky-400/10 hover:border-sky-400/30' : 'bg-white/50 border-blue-600/10 hover:border-blue-600/30'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className={`w-12 h-12 rounded-full object-cover border-2 ${isDark ? 'border-sky-400/30' : 'border-blue-600/30'}`}
                />
                <div>
                  <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</h4>
                  <p className={`${isDark ? 'text-sky-400' : 'text-blue-600'} text-xs`}>{testimonial.company}</p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{testimonial.content.substring(0, 120)}..."
              </p>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-green-400 text-xs">{testimonial.achievement}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16">
          {[
            { number: '50K+', label: 'Success Stories', icon: '🎯' },
            { number: '95%', label: 'Success Rate', icon: '📈' },
            { number: '4.9/5', label: 'Average Rating', icon: '⭐' },
            { number: '24/7', label: 'AI Support', icon: '🤖' }
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-pointer">
              <div className={`text-3xl mb-2 group-hover:scale-125 transition-transform duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stat.icon}
              </div>
              <div className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white group-hover:text-sky-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                {stat.number}
              </div>
              <div className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {stat.label}
              </div>
              <div className={`w-0 h-px mx-auto mt-2 transition-all duration-500 ${isDark ? 'bg-sky-400 group-hover:w-full' : 'bg-blue-600 group-hover:w-full'}`}></div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default TestimonialSection;