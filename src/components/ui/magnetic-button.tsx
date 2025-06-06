'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';

export const MagneticButton = ({
  children,
  className,
  strength = 0.15,
  ...props
}: {
  children: React.ReactNode
  className?: string
  strength?: number
} & React.ComponentProps<typeof motion.button>) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [-strength*8, strength*8]);
  const rotateY = useTransform(x, [-50, 50], [strength*8, -strength*8]);

  return (
    <motion.button
      className={`relative ${className}`}
      onHoverEnd={() => {
        x.set(0);
        y.set(0);
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width/2) * strength);
        y.set((e.clientY - rect.top - rect.height/2) * strength);
      }}
      style={{ rotateX, rotateY }}
      {...props}
    >
      <motion.span className="block relative z-10">
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-[inherit]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};