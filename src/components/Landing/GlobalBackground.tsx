'use client';

import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { motion } from 'framer-motion';

interface GlobalBackgroundProps {
  isDark: boolean;
}

// Define a type for a particle's style properties
interface ParticleStyle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ isDark }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  // NEW: State to store particle styles generated on client
  const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);

  // Ref to track if the component has mounted on the client
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true; // Mark as mounted on client

    // Only generate particle styles on the client-side after initial mount
    if (isMounted.current) {
      const newParticleStyles: ParticleStyle[] = Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 20}s`
      }));
      setParticleStyles(newParticleStyles);
    }

    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array ensures this runs once after initial mount

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 ${
          isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
        }`}
      >
        {/* Mouse-following radial gradient overlay */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: isDark
              ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)`
              : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          }}
        ></div>

        {/* Floating blur circles - adjust colors/opacity for light mode */}
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-float-slow ${
            isDark ? 'bg-sky-400/5' : 'bg-blue-400/10'
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float-slow ${
            isDark ? 'bg-blue-500/5' : 'bg-indigo-500/10'
          }`}
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className={`absolute top-1/2 right-1/3 w-48 h-48 rounded-full blur-2xl animate-float-slow ${
            isDark ? 'bg-cyan-400/5' : 'bg-green-400/10'
          }`}
          style={{ animationDelay: '4s' }}
        ></div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Render particles only if styles have been generated (i.e., on client-side) */}
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sky-400/30 rounded-full animate-particle-drift"
            style={style} // Use the pre-generated style object
          />
        ))}
      </div>


      {/* This creates a subtle animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 animate-grid-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-pulse 4s ease-in-out infinite'
          }}
        ></div>
      </div>
    </div>
  );
};

export default GlobalBackground;