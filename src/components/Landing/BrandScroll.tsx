'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface BrandScrollProps {
  // No specific props defined, but interface is kept as per original.
}

const brands = [
  { name: 'Google', logoSrc: '/google.png' },
  { name: 'Meta', logoSrc: '/meta.png' },
  { name: 'Netflix', logoSrc: '/netflix.png' },
  { name: 'Amazon', logoSrc: '/amazon.png' },
  { name: 'Microsoft', logoSrc: '/microsoft.png' },
  { name: 'Accenture', logoSrc: '/accenture.png' },
  { name: 'TCS', logoSrc: '/tcs.png' },
];

const BrandScroll: React.FC<BrandScrollProps> = () => {
  
  const duplicatedBrands = [...brands, ...brands, ...brands];

  
  const logoContainerWidth = 'w-40'; // Tailwind class for 160px width
  const logoContainerHeight = 'h-16'; // Tailwind class for 64px height
  // The gap is applied by the 'gap-4rem' in the motion.div style directly.
  // So, no specific Tailwind class for it here.

  // Calculate the total width needed for the motion.div based on number of brands,
  // their desired display size, and the gap between them.
  // Each brand container is 160px (w-40). The gap is 4rem (64px).
  const itemEffectiveWidth = 160 + 64; // Width of item + gap
  const totalStripWidth = duplicatedBrands.length * itemEffectiveWidth;

  // The animation duration is adjusted to keep the speed consistent
  // even with more duplicated brands for a truly endless feel.
  const animationDuration = duplicatedBrands.length * 10; // Adjust factor for desired speed

  return (
    <div className="relative w-full overflow-hidden py-12">
      <div className="relative z-10">
        <h3 className="text-center text-xl font-semibold text-gray-400 mb-8 px-4">
          Trusted by leading companies worldwide
        </h3>
        <div className="relative h-24 flex items-center">
          <motion.div
            className="absolute flex items-center h-full"
            key="brand-scroll-strip"
            animate={{
              // Animate from 0% to -100% of the *original* brands' total width.
              x: [`0px`, `-${brands.length * itemEffectiveWidth}px`]
            }}
            transition={{
              x: {
                duration: animationDuration, // Dynamically set duration based on content length
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              },
            }}
            // Removed whileHover to ensure continuous animation
            style={{
              width: `${totalStripWidth}px`, // Total width of all duplicated brand containers
              display: 'flex',
              gap: '4rem', // Space between logos (64px)
            }}
          >
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className={`relative flex-none ${logoContainerWidth} ${logoContainerHeight} flex items-center justify-center rounded-md`}
                // Removed grayscale and opacity classes to use original brand colors
              >
                <Image
                  src={brand.logoSrc}
                  alt={brand.name}
                  fill // Makes the image fill the parent container's dimensions
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: 'contain' }} // Ensures the entire image is visible within the container, maintaining aspect ratio
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandScroll;