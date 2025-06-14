'use client';

import React, { useState, useEffect } from 'react';

// Define a type for a particle's style properties to ensure type safety
interface ParticleStyle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

interface AILabel {
  text: string;
  position: string;
  delay: number;
}

const AIOrb: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  // NEW: State to store particle styles, initialized as an empty array
  const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);

  const labels: AILabel[] = [
    { text: "Understand language", position: "top-16 left-8", delay: 0 },
    { text: "Strong AI", position: "top-8 right-12", delay: 0.5 },
    { text: "Manage process", position: "left-4 top-1/2", delay: 1 },
    { text: "Deep learning", position: "right-8 top-1/3", delay: 1.5 },
    { text: "Computer vision", position: "bottom-24 left-12", delay: 2 },
    { text: "Expert system", position: "bottom-12 right-4", delay: 2.5 },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('ai-orb')?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 10,
          y: (e.clientY - rect.top - rect.height / 2) / 10
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // NEW: Generate particle styles here, only on the client
    const numParticles = 12; // Number of particles as per your original code
    const newParticleStyles: ParticleStyle[] = Array.from({ length: numParticles }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`
    }));
    setParticleStyles(newParticleStyles);


    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty dependency array means this useEffect runs once after initial render on the client

  return (
    <div
      id="ai-orb"
      className="relative w-96 h-96 mx-auto cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Enhanced Main Orb with multiple layers */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
        isHovered ? 'animate-pulse-slow' : 'animate-pulse'
      }`}>
        {/* Outer glow layers */}
        <div className="absolute -inset-12 rounded-full bg-sky-400/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -inset-8 rounded-full bg-sky-400/20 blur-2xl animate-pulse"></div>
        <div className="absolute -inset-4 rounded-full bg-sky-300/30 blur-xl"></div>

        {/* Main orb layers */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 opacity-90">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 opacity-80">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-100 via-sky-200 to-blue-300 opacity-70">
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white via-sky-100 to-sky-200 opacity-60">
                {/* Enhanced inner effects */}
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/40 to-transparent animate-pulse-slow"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-radial from-sky-100/30 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                {/* Core energy effect */}
                <div className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-white/60 to-transparent animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Labels */}
      {labels.map((label, index) => (
        <div
          key={index}
          className={`absolute ${label.position} flex items-center gap-2 animate-float-enhanced opacity-0 animate-fade-in-up`}
          style={{
            animationDelay: `${label.delay}s`,
            animationDuration: '4s',
            animationFillMode: 'forwards'
          }}
        >
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse-dot" style={{ animationDelay: `${index * 0.2}s` }}></div>
          <div className="h-px w-8 bg-gradient-to-r from-sky-400 to-transparent animate-line-grow" style={{ animationDelay: `${label.delay + 0.5}s` }}></div>
          <span className="text-gray-300 text-sm font-medium whitespace-nowrap bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-sky-400/30 hover:border-sky-400/60 hover:bg-black/80 transition-all duration-300 cursor-pointer group">
            {label.text}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </span>
        </div>
      ))}

      {/* Enhanced Connecting lines with dynamic animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-sky-400/40 via-sky-300/20 to-transparent animate-rotate-slow"
            style={{
              left: `${15 + i * 8.75}%`,
              top: '5%',
              height: '90%',
              transform: `rotate(${i * 45}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${12 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Particle effects - Now correctly handled for SSR */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Render particles only if styles have been generated (i.e., on client-side) */}
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sky-400/60 rounded-full animate-particle-float"
            style={style} // Use the pre-generated style object from state
          />
        ))}
      </div>

      {/* Interactive ripple effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-full border-2 border-sky-400/50 animate-ripple"></div>
      )}
    </div>
  );
};

export default AIOrb;