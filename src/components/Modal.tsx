// app/components/Layout.tsx
'use client';

import { ReactNode } from 'react';
import Navbar from './NavBar'; // Assuming Navbar.tsx is in the same directory or adjust path
import Footer from './Card'; // We'll create this next
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Update the path if needed

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-grow pt-20 sm:pt-24"> {/* Added padding top for fixed Navbar */}
        {children}
      </main>
      <Footer />
    </div>
  );
}