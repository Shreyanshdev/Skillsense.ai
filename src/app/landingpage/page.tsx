// src/app/landingpage/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Navbar from '@/components/Landing/Nav2';
import HeroSection from '@/components/Landing/HeroSection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import TestimonialSection from '@/components/Landing/TestimonialSection';
import BrandScroll from '@/components/Landing/BrandScroll';
import GlobalBackground from '@/components/Landing/GlobalBackground';
import PricingSection from '@/components/Landing/PricingSection';
import Footer from '@/components/Landing/Footer';



export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  function handleGetStarted() {
    setIsLoading(true);
    setTimeout(() => router.push('/login'), 1500);
  }

  return (
    <div >
      {/* Only render GlobalBackground on client */}
      <section  className="relative overflow-hidden min-h-screen  items-center justify-center">
          <GlobalBackground isDark={isDark} />
          <Navbar heroHeight={80} />
          <HeroSection onGetStarted={handleGetStarted} />
          <FeaturesSection isDark={isDark} onGetStarted={handleGetStarted}/>
          <BrandScroll/>
          <TestimonialSection isDark={isDark}/>
          <PricingSection isDark={isDark}/>
          <Footer />  
      </section>
     

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

    </div>
  );
}
