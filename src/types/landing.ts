import { ReactNode } from 'react';

// Feature card type
export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

// Testimonial type
export interface Testimonial {
  name: string;
  role: string;
  content: string;
  delay: number;
  rating?: number;
}

// Theme context type
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Analytics event type
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

// TrackedButton props
export interface TrackedButtonProps {
  eventAction: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

// ThemeAwareImage props
export interface ThemeAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  borderColor?: string;
  invertInDarkMode?: boolean;
  width?: number;
  height?: number;
}

// Component variants
export interface ComponentVariants {
  primary?: string;
  secondary?: string;
  dark?: string;
  light?: string;
  [key: string]: string | undefined;
}

export type { Testimonial as TestimonialType };